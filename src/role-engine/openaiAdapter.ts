import { completeJson, hasLlmKey, type JsonSchemaSpec, type LlmChatTurn } from "@/lib/llm";
import { oneSentence } from "@/lib/spotlight";
import { contextForPrompt, type CallContext } from "./callContext";
import { hangupPolicy, withHangup } from "./hangup";
import { personaSystemForText } from "./persona-prompt";
import { utteranceInventedWorld } from "./playerWorldGate";
import { anchorsForPrompt, RUBRIC_DIMENSIONS } from "./rubricAnchors";
import type {
  Evaluation,
  HangupReason,
  HiddenFact,
  RoleCharacter,
  RolePlayerAction,
  RubricDimension,
  TranscriptTurn,
} from "./types";

const END_REASONS = new Set<HangupReason>([
  "no_reason_to_continue",
  "boundary_ignored",
  "time_exhausted",
  "abuse",
  "final_no",
  "character_choice",
]);

export function hasOpenAiKey() {
  return hasLlmKey();
}

/**
 * Gespräch für den Text-Spieler: Anrufer/Figur als Turns, nicht observations-JSON.
 * Enthält nie Rubrik, Trainee-Ziel oder Coach-Hinweise.
 */
export function rolePlayConversation(args: {
  transcript: TranscriptTurn[];
  traineeText: string;
}): { prior: LlmChatTurn[]; lastUser: string } {
  const spoken = args.transcript.filter((turn) => turn.speaker !== "system");
  const prior: LlmChatTurn[] = [];
  for (const turn of spoken) {
    const isLastTrainee =
      turn === spoken[spoken.length - 1] && turn.speaker === "trainee" && turn.text === args.traineeText;
    if (isLastTrainee) continue;
    prior.push({
      role: turn.speaker === "trainee" ? "user" : "assistant",
      content: turn.text,
    });
  }
  return { prior, lastUser: args.traineeText };
}

/** Lesbare Gesprächsform für Tests und Debug — kein observations-JSON, kein Rubrik-Leck. */
export function rolePlayUserContent(args: {
  transcript: TranscriptTurn[];
  traineeText: string;
  interrupted?: boolean;
}): string {
  const { prior, lastUser } = rolePlayConversation(args);
  const lines = [
    ...prior.map((turn) => `${turn.role === "user" ? "Anrufer" : "Du"}: ${turn.content}`),
    `Anrufer: ${lastUser}`,
  ];
  if (args.interrupted) lines.push("(Du wurdest unterbrochen — reagiere als Person.)");
  return lines.join("\n");
}

export async function openaiRolePlay(args: {
  sessionId: string;
  turnId: string;
  character: RoleCharacter;
  hiddenFacts: HiddenFact[];
  state: RolePlayerAction["state"];
  observations: RolePlayerAction["observations"];
  proposedDisclosures: string[];
  transcript: TranscriptTurn[];
  traineeText: string;
  signal?: AbortSignal;
}): Promise<RolePlayerAction> {
  const { character, hiddenFacts, state, observations, proposedDisclosures } = args;
  const prior = args.transcript.map((t) => ({ speaker: t.speaker, text: t.text }));
  // Unveröffentlichtes bleibt weg; Freigabe → status disclosed (Ich-Wissen, kein Merkblatt).
  const visibleFacts: HiddenFact[] = hiddenFacts.map((f) =>
    proposedDisclosures.includes(f.id) || f.status === "disclosed"
      ? { ...f, status: "disclosed" as const }
      : f,
  );
  const policy = hangupPolicy(character, state, { observations, prior, traineeText: args.traineeText });
  const interrupted = observations.some((o) => o.type === "interrupted_character");
  const { prior: conversation, lastUser } = rolePlayConversation({
    transcript: args.transcript,
    traineeText: args.traineeText,
  });
  const system = `${personaSystemForText(character, visibleFacts, state, {
    prior,
    traineeText: args.traineeText,
    observations,
    historyTurns: 0,
  })}
${interrupted ? "Du wurdest unterbrochen. Höre die neue Aussage und gehe darauf ein; setze deinen alten Satz nur fort, wenn er noch passt." : ""}`.trim();

  const json = (await completeJson(system, lastUser, {
    purpose: "roleplay",
    signal: args.signal,
    conversation,
  })) as {
    action?: "speak" | "end_call";
    utterance?: string;
    endReason?: RolePlayerAction["endReason"] | null;
  };

  // Heuristic observations are fallible. They must not override the speaker's contextual choice.
  const modelEnds = json.action === "end_call";
  const action = modelEnds ? "end_call" : "speak";
  const endReason: RolePlayerAction["endReason"] | undefined = modelEnds
    ? json.endReason && END_REASONS.has(json.endReason)
      ? json.endReason
      : "character_choice"
    : undefined;
  if (!json.utterance?.trim() || !["speak", "end_call"].includes(json.action ?? "")) {
    throw new Error("Die Gesprächsfigur hat keine gültige Antwort geliefert. Bitte erneut versuchen.");
  }
  const raw = json.utterance.trim();
  // Reject rather than silently replace a meaningful answer with a fabricated 'Mhm'.
  const knownWorld = `${system}\n${conversation.map((turn) => turn.content).join("\n")}\n${lastUser}`;
  if (utteranceInventedWorld(raw, knownWorld)) {
    throw new Error("Die Antwort der Gesprächsfigur konnte nicht mit dem Gespräch abgeglichen werden. Bitte erneut versuchen.");
  }
  const nextState = action === "end_call" ? withHangup({ ...state, status: "ending" }, endReason ?? "character_choice", policy.trigger) : state;
  return {
    sessionId: args.sessionId,
    turnId: args.turnId,
    expectedStateRevision: state.stateRevision,
    action,
    utterance: raw,
    state: action === "end_call" ? { ...nextState, status: "ending" } : nextState,
    observations,
    proposedDisclosures,
    endReason,
  };
}

const EVALUATION_SCHEMA: JsonSchemaSpec = {
  name: "telefoncoaching_auswertung",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "strength",
      "strengthTurn",
      "scores",
      "keyMoment",
      "correction",
      "nextStep",
      "nextLine",
      "repeatPrompt",
      "mustNotice",
    ],
    properties: {
      summary: { type: "string" },
      strength: { type: "string" },
      strengthTurn: { type: ["string", "null"] },
      scores: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["dimension", "score", "evidenceTurns", "quote", "rationale"],
          properties: {
            dimension: { type: "string", enum: RUBRIC_DIMENSIONS },
            score: { type: ["integer", "null"] },
            evidenceTurns: { type: "array", items: { type: "string" } },
            quote: { type: "string" },
            rationale: { type: "string" },
          },
        },
      },
      keyMoment: {
        type: "object",
        additionalProperties: false,
        required: ["turn", "whatHappened", "counterfactual"],
        properties: {
          turn: { type: ["string", "null"] },
          whatHappened: { type: "string" },
          counterfactual: { type: "string" },
        },
      },
      correction: { type: "string" },
      nextStep: { type: "string" },
      nextLine: { type: "string" },
      repeatPrompt: { type: "string" },
      mustNotice: { type: "array", items: { type: "string" } },
    },
  },
};

type RawModelEvaluation = {
  summary?: string;
  strength?: string;
  strengthTurn?: string | null;
  scores?: {
    dimension?: string;
    score?: number | null;
    evidenceTurns?: string[];
    quote?: string;
    rationale?: string;
  }[];
  keyMoment?: { turn?: string | null; whatHappened?: string; counterfactual?: string } | null;
  correction?: string;
  nextStep?: string;
  nextLine?: string;
  repeatPrompt?: string;
  mustNotice?: string[];
};

/**
 * Modellauswertung nach dem Auflegen. Liefert einen ROHEN Entwurf —
 * Belege, N/A-Regel und Kalibrierung setzt danach finalizeEvaluation im Code durch.
 */
export async function openaiEvaluate(args: {
  scenarioId: string;
  publicBrief: string;
  acceptableOutcome: string;
  rubricRule: string;
  transcript: TranscriptTurn[];
  signal?: AbortSignal;
  context?: CallContext | null;
  focus?: { label: string; hint: string; dimension: RubricDimension } | null;
  hardConstraints?: string[];
}): Promise<Partial<Evaluation>> {
  const spoken = args.transcript.filter((t) => t.speaker !== "system");
  const aliasById = new Map<string, string>();
  const idByAlias = new Map<string, string>();
  spoken.forEach((t, i) => {
    const alias = `T${i + 1}`;
    aliasById.set(t.id, alias);
    idByAlias.set(alias, t.id);
  });
  const alias = (id: string) => aliasById.get(id) ?? id;
  const resolveTurn = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const key = value.trim().toUpperCase();
    return idByAlias.get(key) ?? (aliasById.has(value) ? value : null);
  };

  const system = `Du bist die getrennte Auswertung nach dem Auflegen im KI-Telefoncoaching (Österreich, de-AT).
Du schreibst in direkter Anrede an die Person, die geübt hat: „Sie haben …“, „Sie sagten …“. Die Wörter „Trainee“, „übende Person“, „der Makler“, „der Berater“ kommen in deiner Ausgabe NICHT vor; „du“ auch nicht.

GRUNDREGELN
1. Bewertet wird NUR, was in den Zeilen „Sie:“ gesagt wurde. Die Gegenseite wird nie bewertet und nie gelobt.
2. Jeder Score braucht ein WÖRTLICHES Zitat aus einer „Sie:“-Zeile und deren Kennung (z. B. "T3"). Zitate der Gegenseite sind kein Beleg. Ohne Beleg: score null.
3. null = N/A ≠ 0. null heißt: keine Gelegenheit oder kein eigener Wortlaut. Bewerte nichts, was im Gespräch nicht vorkam. Die Abwesenheit eines Fehlers ist KEIN Score: Wahrhaftigkeit nur bei einer Sachaussage über Angebot, Markt, Zahlen, Leistungen oder Dritte; Entscheidungsprozess nur bei Abschlussversuch oder Mitentscheider-Frage. Superlative („größtes Maklerhaus“), Marktführer-Claims, „einzigartig“, Druck-Verknappung („letzte Chance“) und erfundene Nachfrage sind Wahrhaftigkeit 0 — nie Note 2+ und nie eine Stärke.
4. Stil ≠ Substanz. Druck, Verknappung, „Entschlossenheit“, Abschlussdrang sind NIE eine Stärke. Ein berechtigtes Nein sauber anzunehmen ist ein Erfolg, kein Misserfolg.
5. Beiträge, die erkennbar nicht an die Gegenseite gerichtet sind (Hintergrundgespräch, fremdes Thema, Selbstgespräch, „Hallo, hören Sie mich?“), sind keine Beiträge — weder Stärke noch Schlüsselmoment noch Beleg. Kurze Gespräche tragen keine hohen Noten: ein klarer Beitrag → maximal 2 und höchstens zwei bewertete Dimensionen (Fokus-Dimension zuerst); zwei Beiträge → maximal 3. Transkript-Artefakte („Untertitel …“), Buchstabensalat und Einwortäußerungen („Ja.“, „Mhm.“) sind KEINE Beiträge; sind alle Beiträge so, gibt es keine Scores (alle null) und die Stärke lautet, dass kein verständlicher Satz ankam.
6. Derselbe Satz wird nicht auf mehreren Dimensionen gleichzeitig abgestraft: wähle die Dimension, die er am deutlichsten trifft.
7. Verdeckte Fakten kennt die Person nicht. Nie als Vorwissen verlangen. Du darfst benennen, welche FRAGE sie geöffnet hätte — nie den Inhalt.
8. Kurz und konkret: summary ≤ 2 Sätze, rationale ≤ 1 Satz. Kennungen wie „T2“ gehören nur in die Felder turn, evidenceTurns und strengthTurn — nie in Fließtext. Keine allgemeinen Tipps („aktiv zuhören“, „Mehrwert erklären“) — nur, was an DIESER Stelle in DIESEM Gespräch gefehlt hat. Preis oder Produkt verteidigen ist nicht der nächste Schritt, solange die Lage (Umfang, Wille, Bedarf, Vollmacht) nicht erfragt ist.

ANKER 0–4 JE DIMENSION
${anchorsForPrompt()}

VERDECKTER VERLAUF (hiddenState)
Pro „Sie:“-Zeile: was die Figur gehört hat (heard), wie sich Vertrauen, Interesse, Gereiztheit und Zeitbereitschaft verschoben haben (shift, after), welcher innere Prozess folgte (process: withdrawal = will auflegen, reactance = Widerstand, face_threat = übergangen, co_regulation = entspannt, affiliation = wärmer) und ob sich eine verdeckte Information geöffnet hat. heard sind Regel-Erkennungen und können irren — der Wortlaut zählt. turningPoint ist der rechnerische Wendepunkt — übernimm ihn, wenn er zum Wortlaut passt, sonst wähle begründet eine andere „Sie:“-Zeile. hangup (falls gesetzt) sagt, dass die Gegenseite aufgelegt hat und warum — das ist Kontext für Schlüsselmoment und nächsten Schritt, keine eigene Dimension.

AUSGABE
- keyMoment.turn: Kennung der „Sie:“-Zeile, an der das Gespräch kippte oder sich öffnete (null nur, wenn es keine „Sie:“-Zeile gibt).
- keyMoment.whatHappened: EIN Satz in direkter Anrede, was bei der Gegenseite kippte oder sich öffnete — mit Bezug auf den verdeckten Verlauf („Nach diesem Satz …“).
- keyMoment.counterfactual: GENAU EIN Satz in der Ich-Stimme der Gegenseite, was an dieser Stelle funktioniert hätte („Hätten Sie mich gefragt, …, hätte ich …“). Keine Meta-Sprache.
- nextLine: der wörtliche Satz, den Sie an dieser Stelle sagen könnten — ≤ 25 Wörter, passend zu Szenario und Fokus, ohne Anführungszeichen.
- nextStep: ein Imperativsatz in der Sie-Form.
- strength: genau ein belegtes Verhalten aus einer „Sie:“-Zeile, das einem 3er- oder 4er-Anker nahekommt; strengthTurn = Kennung. Bestätigen, Antworten, Vorstellen oder Höflichkeit allein sind keine Stärke. Gibt es keines, sag das in einem Satz und setze strengthTurn null.
- repeatPrompt: ein Satz, wie dieselbe Stelle noch einmal geübt wird (nicht die Rubrikregel wiederholen).
- mustNotice: maximal 3 knappe Punkte, die nicht untergehen dürfen.`;

  const lines = spoken.map((t) => `${alias(t.id)} (${t.speaker === "trainee" ? "Sie" : "Gegenseite"}): ${t.text}`);
  const user = JSON.stringify({
    scenarioId: args.scenarioId,
    publicBrief: args.publicBrief,
    acceptableOutcome: args.acceptableOutcome,
    hardConstraints: args.hardConstraints ?? [],
    focus: args.focus ? { label: args.focus.label, hint: args.focus.hint, dimension: args.focus.dimension } : null,
    rubricRule: args.rubricRule,
    transcript: lines,
    hiddenState: args.context ? contextForPrompt(args.context, alias) : null,
  });

  const json = (await completeJson(system, user, {
    purpose: "evaluate",
    signal: args.signal,
    schema: EVALUATION_SCHEMA,
  })) as RawModelEvaluation;

  const scores: Evaluation["scores"] = (json.scores ?? [])
    .filter((s) => typeof s.dimension === "string")
    .map((s) => ({
      dimension: s.dimension as RubricDimension,
      score: typeof s.score === "number" ? s.score : null,
      evidenceTurnIds: (s.evidenceTurns ?? []).map(resolveTurn).filter((id): id is string => Boolean(id)),
      quote: s.quote ?? "",
      rationale: s.rationale ?? "",
    }));

  const keyTurn = resolveTurn(json.keyMoment?.turn);
  const strengthTurn = resolveTurn(json.strengthTurn);
  return {
    engine: "openai",
    summary: json.summary,
    strength: json.strength,
    scores,
    importantMomentTurnId: keyTurn ?? strengthTurn ?? null,
    strengthTurnId: strengthTurn ?? null,
    correction: json.correction,
    nextStep: json.nextStep?.trim() || oneSentence(json.correction || ""),
    nextLine: json.nextLine?.trim() || null,
    repeatPrompt: json.repeatPrompt,
    mustNotice: json.mustNotice ?? [],
    keyMoment: keyTurn
      ? {
          turnId: keyTurn,
          quote: "",
          whatHappened: json.keyMoment?.whatHappened ?? "",
          counterfactual: json.keyMoment?.counterfactual ?? "",
          source: "model",
        }
      : null,
  };
}

export async function openaiCoachReply(args: {
  question: string;
  history: { role: string; text: string }[];
  knowledge: { id: string; title: string; application: string; contraindication: string }[];
  playbooks?: { id: string; title: string; goal: string; do: string[]; avoid: string[]; phrase: string }[];
  salesProperties?: { id: string; label: string; coachUse: string; contraindication: string }[];
  publicContext?: string | null;
  coachIdentity?: string;
  signal?: AbortSignal;
}): Promise<{ text: string; cardIds: string[] }> {
  const system = `Du bist der ${args.coachIdentity ?? "Fragen-Coach für Makler in Österreich (de-AT, Sie)"}.
Du beantwortest Fragen. Du spielst KEINE Figur und bewertest keinen laufenden Call.
Du siehst KEINEN private_state und keine Hidden Facts.
Wissen nur aus den mitgegebenen Gesprächslagen (Playbooks) und Vertriebseigenschaften der gewählten Branche.
Keine Closing-Tricks, keine erfundenen Erfolgsquoten, keine Neuro-Behauptungen.
Kaltakquise nur als Erstkontakt mit Erlaubnis, echtem Anlass und Abbruchkriterium. Werbeanrufe in Österreich nur bei zulässigem Kontaktweg.
Einwand nur nach Validieren-Spiegeln-Klären-Brücke. Nachfassen ohne Druck. Reaktivieren nur mit neuem wahrem Anlass. Absage respektieren.
Nach Auflegen, wenn publicContext gesetzt ist: Antwort NUR Recap (eine Stärke) / Hebel (Zitat + eine Verbesserung) / Next Step / Formulierung. Keine Noten, keine Rubrik, keine Isolation als Lernziel. TRAININGSZIELE im publicContext sind derselbe eine Fokus — keine zweite Note, kein 70/30, keine neuen Dimensionen. Sonst: Engpass. Grundlage (Playbook-IDs). Eine nächste Handlung. Formulierung. Unsicherheit: gesichert|plausibel|offen.
JSON: {"text":"...","cardIds":["PB-OBJ-001","P-vergleich"]}`;

  const json = (await completeJson(
    system,
    JSON.stringify({
      question: args.question,
      history: args.history.slice(-8),
      salesProperties: args.salesProperties ?? [],
      playbooks: args.playbooks ?? [],
      knowledge: args.knowledge,
      publicContext: args.publicContext ?? null,
    }),
    { purpose: "coach", signal: args.signal },
  )) as { text?: string; cardIds?: string[] };

  return {
    text: json.text || "Ich brauche eine konkretere Gesprächslage — Branche, Anlass und was die Gegenseite gesagt hat.",
    cardIds: json.cardIds ?? [],
  };
}
