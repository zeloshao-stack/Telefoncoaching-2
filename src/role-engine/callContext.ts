import { commitDisclosures, proposeDisclosures } from "./disclosure";
import { hydrateAffect } from "./affect";
import { hangupReasonLabel } from "./hangup";
import { extractObservations } from "./observationExtractor";
import { reduceState } from "./stateReducer";
import { extractVocal } from "./vocalChannel";
import type {
  AffectProcess,
  CharacterState,
  HangupReason,
  HiddenFact,
  Observation,
  ObservationType,
  RoleCharacter,
  TranscriptTurn,
} from "./types";

/**
 * Verdeckter Verlauf eines Gesprächs, rekonstruiert aus dem Transkript.
 * Reine Logik: dieselben Reducer wie im Live-Turn, ohne Datenbank.
 * Dient NUR der Auswertung nach dem Auflegen — die Gegenseite sieht das nie.
 */

export type TurnClarity = {
  clear: boolean;
  reason: "ok" | "zu_kurz" | "unverstaendlich" | "transkript_artefakt";
};

const WHISPER_ARTEFACT =
  /untertitel|amara\.org|zdf|für funk|vielen dank f(ü|u)r'?s zuschauen|bis zum n(ä|a)chsten mal!|copyright|abonnier/i;

/** STT-Müll: lange Token ohne deutsche Silbenstruktur (nicht: sch/tsch in echten Wörtern). */
function isGibberishWord(raw: string): boolean {
  const clean = raw.toLowerCase().replace(/[^a-zäöüß]/g, "");
  if (clean.length < 10) return false;
  const collapsed = clean
    .replace(/tsch/g, "ç")
    .replace(/sch/g, "ş")
    .replace(/chs/g, "x")
    .replace(/ck/g, "k")
    .replace(/ß/g, "ss");
  const vowels = (collapsed.match(/[aeiouäöüy]/g) || []).length;
  if (vowels / collapsed.length < 0.25) return true;
  // Nach Digraphen-Kollaps immer noch 5+ Konsonanten → Artefakt
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(collapsed)) return true;
  // Sehr lange Fantasiewörter ohne deutsche Endung (z. B. „Krimsoseletsch“)
  if (
    clean.length >= 12 &&
    vowels / clean.length < 0.35 &&
    !/(ung|heit|keit|lich|isch|chen|schaft|ieren|tion|sion|heit|nis|tum|schaft)$/.test(clean)
  ) {
    return true;
  }
  return false;
}

const FILLER_OR_SHORT =
  /^(wo|von|dabei|da|ja|nein|also|halt|eben|mal|nur|schon|doch|noch|ein|eine|einer|paar|mag|ich|dir|mir|uns|kurz|damit|wurde|ist|war|hat|haben|sein|sind|und|oder|aber)$/i;

/** Erkennbarer Gesprächsgehalt — sonst bleibt ein 3-Wort-STT-Fragment „klar“. */
const CONTENT_HINT =
  /^(was|warum|wieso|weshalb|wer|wie|wann|welch|ob|können|könnte|dürfte|möchte|würden|sollten|haus|angebot|honorar|preis|termin|lage|verkauf|entscheid|vollmacht|umfasst|unterscheid|interess|versteh|klar|genau|bitte|grüß|guten|frau|herr|makler|leistung)/i;

export function classifyTraineeTurn(text: string): TurnClarity {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return { clear: false, reason: "zu_kurz" };
  if (WHISPER_ARTEFACT.test(trimmed)) return { clear: false, reason: "transkript_artefakt" };
  // Nur Tokens mit Buchstaben oder Ziffern zählen — „!... ... ....“ ist kein Wort.
  const words = trimmed.split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w));
  const letters = trimmed.replace(/[^\p{L}]/gu, "");
  const vowels = letters.replace(/[^aeiouäöüyAEIOUÄÖÜY]/g, "");
  if (letters.length >= 6 && vowels.length / letters.length < 0.18) {
    return { clear: false, reason: "unverstaendlich" };
  }
  if (words.some((w) => w.length >= 9 && !/[aeiouäöüy]/i.test(w))) {
    return { clear: false, reason: "unverstaendlich" };
  }
  if (words.some((w) => isGibberishWord(w))) {
    return { clear: false, reason: "unverstaendlich" };
  }
  if (words.length < 3) return { clear: false, reason: "zu_kurz" };
  const cleaned = words.map((w) => w.replace(/[^\p{L}]/gu, ""));
  // Kurze STT-Fragmente ohne Substanz („Wo von dabei?“, „Mag ich dir kurz.“, „Damit Semmen wurde“)
  if (
    words.length <= 5 &&
    cleaned.every((clean) => clean.length <= 4 || FILLER_OR_SHORT.test(clean))
  ) {
    return { clear: false, reason: "unverstaendlich" };
  }
  if (
    words.length <= 4 &&
    !cleaned.some((clean) => CONTENT_HINT.test(clean) || (clean.length >= 7 && !isGibberishWord(clean)))
  ) {
    return { clear: false, reason: "unverstaendlich" };
  }
  return { clear: true, reason: "ok" };
}

export type StateSnapshot = {
  trust: number;
  interest: number;
  irritation: number;
  timeWillingness: number;
  process: AffectProcess;
  arousal: number;
  feltSafety: number;
};

export type TurnTrace = {
  turnId: string;
  index: number;
  text: string;
  clarity: TurnClarity;
  observations: ObservationType[];
  before: StateSnapshot;
  after: StateSnapshot;
  /** Verschiebung der Offenheit (Vertrauen + Interesse + Zeit − Gereiztheit) */
  shift: number;
  disclosed: string[];
  /** Was am Hörer ankam, jenseits des Wortlauts */
  vocal: { controlling: boolean; loud: boolean; rushed: boolean };
};

export type RemainingHiddenFact = {
  id: string;
  /** Wonach eine Frage den Fakt geöffnet hätte — ohne den Fakt selbst zu nennen */
  opener: string;
};

/** Die Figur hat aufgelegt — Grund und Auslöser aus dem gespeicherten Endzustand. */
export type CallHangup = {
  reason: HangupReason;
  label: string;
  trigger: string | null;
};

export type CallContext = {
  counterpartName: string;
  traces: TurnTrace[];
  clearTraineeTurns: number;
  unclearTraineeTurns: number;
  disclosedFactIds: string[];
  remainingHidden: RemainingHiddenFact[];
  turningPoint: TurnTrace | null;
  finalProcess: AffectProcess;
  /** null, wenn die übende Person aufgelegt hat oder die Sitzung noch läuft. */
  hangup: CallHangup | null;
};

/** Auflege-Grund aus dem Endzustand — nur wenn die Figur selbst aufgelegt hat. */
export function hangupFromState(state: CharacterState | undefined | null): CallHangup | null {
  if (!state?.hangupReason) return null;
  return {
    reason: state.hangupReason,
    label: hangupReasonLabel(state.hangupReason),
    trigger: state.hangupTrigger?.trim() || null,
  };
}

function snapshot(character: RoleCharacter, state: CharacterState): StateSnapshot {
  const affect = hydrateAffect(character, state);
  return {
    trust: state.trust,
    interest: state.interest,
    irritation: state.irritation,
    timeWillingness: state.timeWillingness,
    process: affect.process,
    arousal: affect.arousal,
    feltSafety: affect.feltSafety,
  };
}

function openness(s: StateSnapshot) {
  return s.trust + s.interest + s.timeWillingness - s.irritation;
}

const OPENERS: Record<string, string> = {
  competitor_scope: "dem Leistungsumfang des anderen Angebots",
  sister_concern: "dem, was die Schwester zögern lässt",
  wellbeing: "wie es der Person mit der Sache geht",
  sell_will: "ob überhaupt verkauft werden soll",
  prior_talk: "ob schon mit jemand anderem gesprochen wurde",
  constitution: "wie die Person körperlich mit dem Haus zurechtkommt",
};

export function openerFor(fact: HiddenFact): string {
  return OPENERS[fact.id] ?? "der Lage, die im Briefing fehlt";
}

/**
 * Spielt Beobachtungen, Offenlegungen und Zustand pro Trainee-Turn nach.
 * Gespeicherte Beobachtungen (Textmodus) haben Vorrang; im Live-Modus fehlen sie
 * und werden aus dem Wortlaut rekonstruiert.
 * `finalState` ist der gespeicherte Endzustand der Sitzung — daraus kommt der Auflege-Grund.
 */
export function buildCallContext(
  character: RoleCharacter,
  transcript: TranscriptTurn[],
  storedObservations?: Map<string, Observation[]>,
  initialState?: CharacterState,
  finalState?: CharacterState,
): CallContext {
  const spoken = transcript.filter((t) => t.speaker !== "system");
  let state: CharacterState = {
    ...(initialState ?? character.initialState),
    status: "active",
    affect: hydrateAffect(character, initialState ?? character.initialState),
  };
  let facts: HiddenFact[] = character.hiddenFacts.map((f) => ({ ...f }));
  const traces: TurnTrace[] = [];

  spoken.forEach((turn, index) => {
    if (turn.speaker !== "trainee") return;
    const prior = spoken.slice(0, index);
    const stored = storedObservations?.get(turn.id);
    const observations =
      stored && stored.length > 0 ? stored : extractObservations(character, turn, prior);
    const interrupted = observations.some((o) => o.type === "interrupted_character");
    const vocal = extractVocal(turn.text, null, { interrupted });
    const proposed = proposeDisclosures(character, observations, facts, state);
    facts = commitDisclosures(facts, proposed);
    const before = snapshot(character, state);
    state = reduceState(character, state, observations, vocal);
    const after = snapshot(character, state);
    traces.push({
      turnId: turn.id,
      index,
      text: turn.text,
      clarity: classifyTraineeTurn(turn.text),
      observations: observations.map((o) => o.type),
      before,
      after,
      shift: openness(after) - openness(before),
      disclosed: proposed,
      vocal: {
        controlling: vocal.controllingLanguage,
        loud: vocal.intensity === "loud",
        rushed: vocal.rate === "rushed" || vocal.rate === "fast",
      },
    });
  });

  const clearTraineeTurns = traces.filter((t) => t.clarity.clear).length;
  return {
    counterpartName: character.identity.name,
    traces,
    clearTraineeTurns,
    unclearTraineeTurns: traces.length - clearTraineeTurns,
    disclosedFactIds: facts.filter((f) => f.status === "disclosed").map((f) => f.id),
    remainingHidden: facts
      .filter((f) => f.status === "private")
      .map((f) => ({ id: f.id, opener: openerFor(f) })),
    turningPoint: findTurningPoint(traces),
    finalProcess: snapshot(character, state).process,
    hangup: hangupFromState(finalState),
  };
}

/**
 * Wendepunkt: der Trainee-Turn mit der größten Verschiebung nach unten.
 * Gibt es keinen Einbruch, zählt die größte Öffnung (auch eine Offenlegung).
 */
export function findTurningPoint(traces: TurnTrace[]): TurnTrace | null {
  if (traces.length === 0) return null;
  // STT-Müll darf keinen Schlüsselmoment tragen — erst klare Beiträge, sonst Fallback.
  const clear = traces.filter((t) => t.clarity.clear);
  const pool = clear.length > 0 ? clear : traces;
  const drops = pool.filter(
    (t) => t.shift <= -6 || (t.after.process === "withdrawal" && t.before.process !== "withdrawal"),
  );
  if (drops.length > 0) {
    return drops.reduce((worst, t) => (t.shift < worst.shift ? t : worst));
  }
  // Öffnungen zählen nur bei verständlichen Beiträgen — ein „Mhm.“ öffnet nichts.
  const gains = pool.filter((t) => t.clarity.clear && (t.shift >= 6 || t.disclosed.length > 0));
  if (gains.length > 0) {
    return gains.reduce((best, t) => (t.shift + t.disclosed.length * 10 > best.shift + best.disclosed.length * 10 ? t : best));
  }
  return null;
}

const OBSERVATION_LABELS: Partial<Record<ObservationType, string>> = {
  created_pressure: "Druck im Satz",
  premature_close: "Abschluss vor der Lage",
  premature_concession: "Preis bewegt, bevor der Umfang klar war",
  made_false_or_unverifiable_claim: "unbelegte Behauptung",
  unsupported_claim: "unbelegte Behauptung",
  interrupted_character: "ins Wort gefallen",
  ignored_boundary: "Grenze übergangen",
  continued_after_final_no: "nach dem Nein weitergemacht",
  generic_pitch: "langer Pitch ohne Frage",
  asked_specific_question: "konkrete Frage zur Lage",
  clarified_decision_authority: "gefragt, wer entscheidet",
  acknowledged_concern: "Widerstand aufgenommen",
  respected_no: "Nein respektiert",
  referenced_previous_statement: "Bezug auf das Gesagte",
};

const PROCESS_LABELS: Record<AffectProcess, string> = {
  withdrawal: "zieht sich zurück und will auflegen",
  reactance: "geht in Widerstand",
  face_threat: "fühlt sich übergangen",
  co_regulation: "entspannt sich",
  affiliation: "wird wärmer",
  contagion: "bleibt in Ihrer Tonlage",
};

const NEGATIVE: ObservationType[] = [
  "created_pressure",
  "premature_close",
  "premature_concession",
  "made_false_or_unverifiable_claim",
  "unsupported_claim",
  "interrupted_character",
  "ignored_boundary",
  "continued_after_final_no",
  "generic_pitch",
];

export function turnLabels(observations: ObservationType[], negativeOnly = false): string[] {
  const pool = negativeOnly ? observations.filter((o) => NEGATIVE.includes(o)) : observations;
  const labels = pool.map((o) => OBSERVATION_LABELS[o]).filter((l): l is string => Boolean(l));
  return [...new Set(labels)];
}

function delta(label: string, before: number, after: number): string | null {
  if (Math.abs(after - before) < 4) return null;
  return `${label} ${before} → ${after}`;
}

/** Ein Satz: was sich bei der Gegenseite an dieser Stelle verschoben hat. */
export function describeShift(trace: TurnTrace, counterpartName: string): string {
  if (!trace.clarity.clear) {
    const what =
      trace.clarity.reason === "transkript_artefakt"
        ? "ein Transkript-Artefakt statt eines Satzes"
        : trace.clarity.reason === "zu_kurz"
          ? "ein Wort statt eines Satzes"
          : "etwas Unverständliches";
    return `Hier kam bei ${counterpartName} ${what} an — es gab nichts, worauf die Gegenseite antworten konnte.`;
  }
  const deltas = [
    delta("Vertrauen", trace.before.trust, trace.after.trust),
    delta("Gereiztheit", trace.before.irritation, trace.after.irritation),
    delta("Zeitbereitschaft", trace.before.timeWillingness, trace.after.timeWillingness),
    delta("Interesse", trace.before.interest, trace.after.interest),
  ].filter((d): d is string => Boolean(d));
  const negative = trace.shift < 0;
  const labels = turnLabels(trace.observations, negative);
  if (negative && trace.vocal.controlling && !labels.includes("Druck im Satz")) labels.unshift("Druck im Satz");
  if (negative && trace.vocal.rushed && !labels.includes("langer Pitch ohne Frage")) labels.push("gehetztes Tempo");
  const cause = !trace.clarity.clear
    ? trace.clarity.reason === "transkript_artefakt"
      ? "am Hörer kam kein verständlicher Satz an"
      : trace.clarity.reason === "zu_kurz"
        ? "ein Wort statt eines Satzes"
        : "unverständlich"
    : labels.length
      ? labels.join(", ")
      : null;
  const process = PROCESS_LABELS[trace.after.process];
  const head = negative ? `Hier kippte ${counterpartName}` : `Hier öffnete sich ${counterpartName}`;
  const parts = [head];
  if (deltas.length) parts.push(`: ${deltas.join(", ")}`);
  parts.push(` — ${process}`);
  if (cause) parts.push(` (${cause})`);
  if (trace.disclosed.length) parts.push(`; eine verdeckte Information wurde offengelegt`);
  return `${parts.join("")}.`;
}

/** Ein Satz in der Stimme der Gegenseite: was an dieser Stelle funktioniert hätte. */
export function ruleCounterfactual(trace: TurnTrace, remainingHidden: RemainingHiddenFact[]): string {
  if (!trace.clarity.clear) {
    return "Ich habe nicht verstanden, was Sie von mir wollen — ein klarer Satz, warum Sie anrufen, und ich hätte zugehört.";
  }
  const obs = new Set(trace.observations);
  if (obs.has("continued_after_final_no") || obs.has("ignored_boundary")) {
    return "Ein „Verstanden, ich vermerke das“ — und ich hätte Sie in guter Erinnerung behalten.";
  }
  if (obs.has("premature_concession")) {
    return "Hätten Sie mich gefragt, was der andere überhaupt anbietet, hätte ich es Ihnen gesagt — statt dass Sie sofort mit dem Preis heruntergehen.";
  }
  if (obs.has("premature_close")) {
    return "Fragen Sie mich, wer bei uns mitentscheidet, bevor Sie von Auftrag reden — dann hätte ich Ihnen gesagt, wie wir entscheiden.";
  }
  if (obs.has("created_pressure") || trace.vocal.controlling) {
    return "Wenn Sie mich gefragt hätten, was mir an dem Angebot wichtig ist, statt mich zu drängen, hätte ich weitergeredet.";
  }
  if (obs.has("made_false_or_unverifiable_claim") || obs.has("unsupported_claim")) {
    return "Hätten Sie nur gesagt, was Sie belegen können, hätte ich Ihnen weiter zugehört.";
  }
  if (obs.has("interrupted_character")) {
    return "Hätten Sie mich ausreden lassen, hätte ich Ihnen gesagt, worum es mir eigentlich geht.";
  }
  if (obs.has("generic_pitch")) {
    return "Eine konkrete Frage an mich statt der Aufzählung — dann hätte ich gesagt, worum es mir geht.";
  }
  if (trace.shift >= 0) {
    return "Das war der Moment, in dem ich Ihnen zugehört habe — bleiben Sie bei dieser Frage, bevor Sie über Preis oder Auftrag reden.";
  }
  if (remainingHidden.length > 0) {
    return `Hätten Sie mich nach ${remainingHidden[0].opener} gefragt, hätte ich Ihnen mehr erzählt.`;
  }
  return "Eine Frage zu meiner Lage statt einer Aussage über Ihr Angebot — dann wäre ich dran geblieben.";
}

/** Kompakte Fassung für den Prompt: keine Fakteninhalte, nur Verlauf und Öffner. */
export function contextForPrompt(ctx: CallContext, alias: (turnId: string) => string) {
  return {
    counterpart: ctx.counterpartName,
    clearTraineeTurns: ctx.clearTraineeTurns,
    unclearTraineeTurns: ctx.unclearTraineeTurns,
    hiddenStateByTurn: ctx.traces.map((t) => ({
      turn: alias(t.turnId),
      clarity: t.clarity.reason,
      heard: t.observations,
      shift: t.shift,
      after: {
        trust: t.after.trust,
        interest: t.after.interest,
        irritation: t.after.irritation,
        timeWillingness: t.after.timeWillingness,
        process: t.after.process,
      },
      disclosedFacts: t.disclosed,
    })),
    turningPoint: ctx.turningPoint
      ? {
          turn: alias(ctx.turningPoint.turnId),
          reading: describeShift(ctx.turningPoint, ctx.counterpartName),
        }
      : null,
    stillHidden: ctx.remainingHidden.map((f) => `hätte sich geöffnet bei einer Frage nach ${f.opener}`),
    endState: ctx.finalProcess,
    hangup: ctx.hangup
      ? {
          reading: `Die Figur hat aufgelegt: ${ctx.hangup.label}.`,
          trigger: ctx.hangup.trigger,
        }
      : null,
  };
}
