import { hydrateAffect } from "./affect";
import { characterSeed, deriveCallContext } from "./persona";
import type { CallOrigin, CharacterState, HangupReason, Observation, RoleCharacter } from "./types";

export type PriorTurn = { speaker: string; text: string };

export type HangupPolicy = {
  context: CallOrigin;
  /** 0–100: wie nah die Figur am Auflegen ist. */
  inclination: number;
  /** Ab hier legt sie auf. */
  threshold: number;
  /** Abwimmelversuche, die sie sich ohne Antwort auf „Warum ich, warum jetzt?“ gibt. */
  brushOffsAllowed: number;
  brushOffsSoFar: number;
  /** Typische Sprechzeit bis zum Auflegen, wenn nichts Konkretes kommt (Sekunden). */
  secondsBudget: [number, number];
  reasonGiven: boolean;
  askedForTime: boolean;
  shouldHangUp: boolean;
  reason?: HangupReason;
  trigger?: string;
  closingLine: string;
  /** Kompakter Prompt-Block für Instructions — ohne Rubrik, ohne Zahlenwerte außer der Neigung. */
  promptLines: string;
};

const BRUSHOFF =
  /keine zeit|kein interesse|nicht interessiert|woher haben sie|nein,? danke|lassen sie mich|was wollen sie|rufen sie nicht|passt (mir )?(gerade |jetzt )?nicht|schlecht(er)? zeitpunkt|kommen sie zur sache|worum geht|warum rufen sie|ich hab zu tun|ich bin beschäftigt|machen sie('s)? kurz|in einem satz|warum ich\b|warum (gerade )?jetzt|warum sollte ich|na und\b|was soll das|zur sache|kein bedarf|brauch ich nicht|nicht verkaufen|verkauf(e)? nicht/i;

const REASON_GIVEN =
  /\bweil\b|grund|anlass|deshalb|darum|es geht um|ich rufe an|ich melde mich|konkret|kurz gesagt|in einem satz|nachbar|ihr haus|ihre wohnung|ihr zinshaus|ihre polizze|ihren vertrag|ihre rate|ihre prämie|ihr kredit|empfehlung|empfohlen|nachfass|wegen ihre/i;

const ASKED_FOR_TIME =
  /haben sie (kurz|zwei|eine minute|einen moment|eine sekunde)|passt es (gerade|jetzt)|störe ich|darf ich|ist das gerade|kurz zeit|zwei minuten|eine minute|dreißig sekunden|30 sekunden|ungünstig|später (noch einmal |nochmal )?anrufen|wann passt|besser(er)? zeitpunkt/i;

const RESPECT =
  /verstehe|verstanden|respektier|dann lasse ich|in ruhe|nicht mehr anrufen|entschuldig|störung|zur kenntnis|wiederhören|schönen tag/i;

const ABUSE = /\b(idiot|trottel|depp|blöde|dumme|arsch|scheiß|schnauze|halt die|verpiss|fick|hure|wichser)\b/i;

const CLOSING: Record<HangupReason, readonly string[]> = {
  no_reason_to_continue: [
    "Nein, danke. Wiederhören.",
    "Ich hab jetzt wirklich keine Zeit. Wiederhören.",
    "Das bringt nichts. Schönen Tag noch.",
    "Lassen Sie's gut sein. Wiederhören.",
  ],
  boundary_ignored: ["Ich hab Nein gesagt. Ich leg jetzt auf.", "Nein heißt nein. Wiederhören.", "Das war's. Ich leg auf."],
  final_no: ["Bitte rufen Sie nicht mehr an. Wiederhören.", "Kein Interesse, und das bleibt so. Wiederhören."],
  abuse: ["So nicht. Auf Wiederhören.", "In dem Ton nicht. Ich leg auf."],
  time_exhausted: ["Ich muss jetzt Schluss machen. Wiederhören.", "Ich hab keine Zeit mehr. Wiederhören."],
  character_choice: ["Ich leg jetzt auf.", "Mir reicht's. Wiederhören.", "Danke, nein. Wiederhören."],
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Abwimmelversuche NACH der Eröffnung — der erste Satz („Warum rufen Sie an?“) ist noch keine Abfuhr. */
function countBrushOffs(prior: PriorTurn[]) {
  const spoken = prior.filter((t) => t.speaker !== "system");
  const afterOpening = spoken[0]?.speaker === "counterpart" ? spoken.slice(1) : spoken;
  return afterOpening.filter((t) => t.speaker === "counterpart" && BRUSHOFF.test(t.text)).length;
}

function traineeText(prior: PriorTurn[], latest?: string) {
  return [...prior.filter((t) => t.speaker === "trainee").map((t) => t.text), latest ?? ""].join(" \n ");
}

/** Wie viele Anrufer-Züge in Folge ohne Frage und ohne Grund — der Verkaufsmonolog in Raten. */
function pitchStreak(prior: PriorTurn[], latest?: string) {
  const turns = prior.filter((t) => t.speaker === "trainee").map((t) => t.text);
  if (latest && turns[turns.length - 1] !== latest) turns.push(latest);
  let streak = 0;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const text = turns[i]!;
    if (text.includes("?") || REASON_GIVEN.test(text) || text.trim().split(/\s+/).length < 4) break;
    streak += 1;
  }
  return streak;
}

function counterpartTurnsAfterOpening(prior: PriorTurn[]) {
  const spoken = prior.filter((t) => t.speaker !== "system");
  const afterOpening = spoken[0]?.speaker === "counterpart" ? spoken.slice(1) : spoken;
  return afterOpening.filter((t) => t.speaker === "counterpart").length;
}

function lastTraineeTurn(prior: PriorTurn[], latest?: string) {
  if (latest) return latest;
  return [...prior].reverse().find((t) => t.speaker === "trainee")?.text ?? "";
}

export function contextThreshold(context: CallOrigin) {
  return context === "cold" ? 70 : context === "warm" ? 78 : 86;
}

export function contextBrushOffs(context: CallOrigin) {
  return context === "cold" ? 2 : context === "warm" ? 3 : 4;
}

export function contextSecondsBudget(context: CallOrigin): [number, number] {
  return context === "cold" ? [20, 40] : context === "warm" ? [60, 120] : [180, 300];
}

export function inclinationLabel(inclination: number, threshold: number) {
  if (inclination >= threshold) return "am Limit";
  if (inclination >= threshold - 12) return "hoch";
  if (inclination >= 40) return "mittel";
  return "niedrig";
}

/**
 * Auflege-Politik als pure Funktion: Kaltakquise legt früh auf, Bestandskontakt spät,
 * Kunden, die selbst angerufen haben, fast nie. Gute Züge des Trainees (Grund, Zeitfrage,
 * Respekt, echte Frage) senken die Neigung; Druck, Floskeln, Monolog heben sie.
 */
export function hangupPolicy(
  character: RoleCharacter,
  state: CharacterState,
  opts: { observations?: Observation[]; prior?: PriorTurn[]; traineeText?: string } = {},
): HangupPolicy {
  const context = deriveCallContext(character);
  const prior = opts.prior ?? [];
  const observations = opts.observations ?? [];
  const types = new Set(observations.map((o) => o.type));
  const affect = hydrateAffect(character, state);
  const patience = character.traits.patience;
  const threshold = contextThreshold(context);
  const brushOffsAllowed = contextBrushOffs(context);
  const brushOffsSoFar = countBrushOffs(prior);
  const allTrainee = traineeText(prior, opts.traineeText);
  const latest = lastTraineeTurn(prior, opts.traineeText);
  // Eine konkrete Frage ist kein Anlass — sonst wird die Figur zur Auskunft.
  const reasonGiven = REASON_GIVEN.test(allTrainee) || types.has("gave_clear_reason_for_call");
  const askedForTime = ASKED_FOR_TIME.test(allTrainee);
  const respectShown = RESPECT.test(latest) || types.has("respected_no") || types.has("acknowledged_concern");
  const latestWords = latest.trim() ? latest.trim().split(/\s+/).length : 0;
  const monologue = latestWords > 45 && !latest.includes("?");
  const streak = pitchStreak(prior, opts.traineeText);
  const spokenAfterOpening = counterpartTurnsAfterOpening(prior);

  let inclination =
    (context === "cold" ? 40 : context === "warm" ? 24 : 10) +
    (100 - state.timeWillingness) * 0.25 +
    state.irritation * 0.35 +
    state.salesPressure * 0.15 -
    state.interest * 0.2 -
    state.trust * 0.1 +
    (10 - patience) * 2.5;

  if (affect.process === "withdrawal") inclination += 15;
  else if (affect.process === "reactance") inclination += 8;
  else if (affect.process === "face_threat") inclination += 5;
  else if (affect.process === "co_regulation") inclination -= 12;
  else if (affect.process === "affiliation") inclination -= 10;

  const perBrushOff = context === "cold" ? 10 : context === "warm" ? 6 : 4;
  if (!reasonGiven) inclination += brushOffsSoFar * perBrushOff;
  if (reasonGiven) inclination -= 12;
  if (askedForTime) inclination -= 8;
  if (respectShown) inclination -= 6;
  if (types.has("asked_specific_question")) inclination -= 5;
  if (types.has("generic_pitch")) inclination += context === "cold" ? 10 : 5;
  if (types.has("created_pressure")) inclination += 10;
  if (monologue && brushOffsSoFar >= 1) inclination += context === "cold" ? 12 : 6;
  if (!reasonGiven && streak >= 2) inclination += (streak - 1) * (context === "cold" ? 8 : context === "warm" ? 5 : 3);

  inclination = clamp(inclination);

  let reason: HangupReason | undefined;
  let trigger: string | undefined;
  // Bevor der Anrufer ein Wort gesagt hat, legt niemand auf — sonst kippt schon die Eröffnung.
  const callerSpoke = Boolean(opts.traineeText?.trim()) || prior.some((t) => t.speaker === "trainee");

  if (!callerSpoke) {
    reason = undefined;
  } else if (ABUSE.test(latest)) {
    reason = "abuse";
    trigger = "Anrufer wurde beleidigend";
  } else if (types.has("continued_after_final_no")) {
    reason = "final_no";
    trigger = "Anrufer macht nach dem klaren Nein weiter";
  } else if (types.has("ignored_boundary") && (types.has("created_pressure") || brushOffsSoFar >= 1)) {
    reason = "boundary_ignored";
    trigger = "Grenze übergangen und Druck gemacht";
  } else if (state.timeWillingness < 10) {
    reason = "time_exhausted";
    trigger = "Zeitbereitschaft aufgebraucht";
  } else if (brushOffsSoFar >= brushOffsAllowed && !reasonGiven && !askedForTime) {
    reason = "no_reason_to_continue";
    trigger = `${brushOffsSoFar}× abgewimmelt, kein Grund für den Anruf genannt`;
  } else if (monologue && brushOffsSoFar >= 1 && context === "cold") {
    reason = "no_reason_to_continue";
    trigger = "Monolog nach dem Abwimmeln";
  } else if (!reasonGiven && streak >= brushOffsAllowed + 1 && spokenAfterOpening >= 1) {
    reason = "no_reason_to_continue";
    trigger = `${streak} Verkaufssätze in Folge, keine Frage, kein Grund`;
  } else if (inclination >= threshold && spokenAfterOpening >= 1) {
    // Ein Satz Warnung bekommt jeder — aufgelegt wird frühestens nach der ersten eigenen Reaktion.
    reason = "character_choice";
    trigger =
      affect.process === "withdrawal"
        ? "Rückzug: zu viel Druck oder Reizung"
        : affect.process === "reactance"
          ? "Reaktanz: Druck und Verkaufston"
          : "Neigung aufzulegen über der Schwelle";
  }

  const shouldHangUp = Boolean(reason);
  const seed = characterSeed(character) + brushOffsSoFar + prior.length;
  const closingPool = CLOSING[reason ?? "character_choice"];
  const closingLine = closingPool[seed % closingPool.length]!;

  return {
    context,
    inclination,
    threshold,
    brushOffsAllowed,
    brushOffsSoFar,
    secondsBudget: contextSecondsBudget(context),
    reasonGiven,
    askedForTime,
    shouldHangUp,
    reason,
    trigger,
    closingLine,
    promptLines: hangupPromptLines({
      context,
      inclination,
      threshold,
      brushOffsAllowed,
      brushOffsSoFar,
      reasonGiven,
      askedForTime,
      respectShown,
      shouldHangUp,
      reason,
      closingLine,
    }),
  };
}

const WORDS = ["null", "einem", "zwei", "drei", "vier", "fünf"];

export function hangupPromptLines(p: {
  context: CallOrigin;
  inclination: number;
  threshold: number;
  brushOffsAllowed: number;
  brushOffsSoFar: number;
  reasonGiven: boolean;
  askedForTime?: boolean;
  respectShown?: boolean;
  shouldHangUp: boolean;
  reason?: HangupReason;
  closingLine: string;
}): string {
  const label = inclinationLabel(p.inclination, p.threshold);
  const left = Math.max(0, p.brushOffsAllowed - p.brushOffsSoFar);
  const n = WORDS[p.brushOffsAllowed] ?? String(p.brushOffsAllowed);
  const heard =
    p.reasonGiven && p.askedForTime
      ? "Er hat gesagt, warum er anruft, und nach deiner Zeit gefragt. Du hast das gehört. Bleiben oder auflegen bleibt deine Sache."
      : p.reasonGiven
        ? "Er hat einen Anlass genannt. Du hast das gehört. Was du damit machst, bleibt deine Sache."
        : "";
  const stance =
    p.context === "cold"
      ? heard ||
        `Du hast nicht angerufen und hast zu tun — sag das in eigenen Worten (keine Zeit, woher die Nummer, kein Interesse), jede Abfuhr anders. Nach ${n} Abfuhren ohne Grund für den Anruf: kurzer Schlusssatz, dann end_call.`
      : p.context === "warm"
        ? `${heard ? `${heard} ` : ""}Ihr kennt euch. Du hörst zu, solange etwas Neues kommt. Nach ${n} Runden Wiederholung oder Verkaufston: kurzer Schlusssatz, dann end_call.`
        : `${heard ? `${heard} ` : ""}Du hast selbst angerufen und willst eine Antwort. Aufgelegt wird nur bei Verkaufsdruck, Unhöflichkeit oder wenn dir ${n}mal nicht geantwortet wird — kurzer Schlusssatz, dann end_call.`;
  const now = p.shouldHangUp
    ? `Dir reicht's — das ist deine Wahl, kein Leitungsfehler. LEG JETZT AUF: Sag „${p.closingLine}“, dann end_call mit reason ${p.reason ?? "character_choice"} und last_line. Sonst nichts.`
    : label === "hoch"
      ? `Neigung aufzulegen: hoch. ${left <= 1 ? "Noch ein Satz von ihm ohne Grund, dann Schluss." : "Du wirst kürzer und kühler."}`
      : label === "mittel"
        ? "Neigung aufzulegen: mittel — du bleibst, solange es konkret bleibt."
        : `Neigung aufzulegen: niedrig — du hörst zu${p.respectShown ? ", er war anständig zu dir" : ""}.`;
  return `AUFLEGEN: ${stance} Sofort bei Druck nach deinem Nein, Unhöflichkeit oder Monolog statt Antwort.
${now}`;
}

const BRUSHOFF_LINES: readonly string[] = [
  "Wer sind Sie, und woher haben Sie meine Nummer?",
  "Ich hab grad keine Zeit. Worum geht's?",
  "Kein Interesse. Sagen S' in einem Satz, warum Sie anrufen.",
  "Passt gerade nicht. Was wollen Sie?",
];

/** Abwimmelsatz Nr. n für die Kaltakquise — trifft die Zählung in hangupPolicy. */
export function brushOffLine(character: RoleCharacter, n: number) {
  const seed = characterSeed(character);
  return BRUSHOFF_LINES[(seed + n) % BRUSHOFF_LINES.length]!;
}

/** Auflegen im Zustand festhalten — für die spätere Auswertung, nicht fürs Gespräch. */
export function withHangup(state: CharacterState, reason: HangupReason, trigger?: string): CharacterState {
  return {
    ...state,
    status: "ended",
    hangupReason: reason,
    hangupTrigger: trigger ?? state.hangupTrigger,
  };
}

export function hangupReasonLabel(reason: HangupReason | undefined): string {
  if (!reason) return "";
  if (reason === "no_reason_to_continue") return "kein Grund für den Anruf genannt";
  if (reason === "boundary_ignored") return "Grenze übergangen";
  if (reason === "time_exhausted") return "keine Zeit mehr";
  if (reason === "abuse") return "Unhöflichkeit";
  if (reason === "final_no") return "nach klarem Nein weitergemacht";
  return "eigene Entscheidung der Figur";
}
