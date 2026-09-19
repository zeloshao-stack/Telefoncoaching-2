import { deliveryFor } from "./delivery";
import { type PriorTurn } from "./hangup";
import { characterPerformance } from "./character-performance";
import { derivePersona } from "./persona";
import type { CharacterState, HiddenFact, InnerLife, Observation, RoleCharacter } from "./types";
import { voiceColorLine } from "./voice";
import { voiceStateBlock, voiceStateFrom } from "./voiceState";

export type PersonaPromptOptions = {
  /** realtime: mit end_call / wait_for_user; text: JSON-Aktion statt Werkzeug. */
  mode?: "realtime" | "text";
  /** Bisheriger Verlauf — wird auf die letzten Züge gekürzt. */
  prior?: PriorTurn[];
  /** Letzter Trainee-Satz, falls noch nicht in prior. */
  traineeText?: string;
  observations?: Observation[];
  historyTurns?: number;
  /** Verlaufszeilen auf so viele Zeichen kürzen (Realtime: der Kontext liegt ohnehin im Audio). */
  historyLineChars?: number;
  /** Live-Leitung: die Eröffnung läuft über response.create, nicht über die Instructions. */
  omitOpening?: boolean;
};

function clip(text: string, max?: number) {
  if (!max || text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function innerLifeScene(life: InnerLife): string {
  const near = life.relationships[0]?.person;
  const nearBit = near ? ` ${near} ist dir nah.` : "";
  const conflict = life.innerConflict.trim().replace(/\.+$/, "");
  const worry = life.worry.trim().replace(/\.+$/, "");
  const want = life.openGoal.trim().replace(/\.+$/, "");
  const wantBit = want ? ` Von ihm willst du ${want}.` : "";
  return `${conflict}. ${worry}.${nearBit}${wantBit}`;
}

/** Ein Fakt ist brauchbar, wenn er ein Satzfragment ist — Einwort-Reste aus schwachen Generatorläufen fallen weg. */
export function usableHiddenFact(fact: HiddenFact) {
  return fact.fact.trim().length >= 12 && /\s/.test(fact.fact.trim());
}

/** Drittperson über die Figur selbst → du. Schwester/Dritte bleiben Dritte. Kein Regel-Join. */
function livedKnowledgeLine(fact: string): string {
  const t = fact
    .trim()
    .replace(/\.+$/, "")
    .replace(/^(Sie|Er) geht\b/, "Du gehst")
    .replace(/^(Sie|Er) hat\b/, "Du hast")
    .replace(/^(Sie|Er) ist\b/, "Du bist")
    .replace(/^(Sie|Er) will\b/, "Du willst")
    .replace(/^(Sie|Er) möchte\b/, "Du möchtest");
  return `${t}.`;
}

/**
 * Nur freigegebene Fakten als Ich-Wissen. Unveröffentlichtes bleibt weg — kein Erst-wenn-Merkblatt.
 */
export function hiddenFactLines(hiddenFacts: HiddenFact[]) {
  return hiddenFacts
    .filter(usableHiddenFact)
    .filter((fact) => fact.status === "disclosed")
    .map((fact) => livedKnowledgeLine(fact.fact))
    .join("\n");
}

function factsForSpeech(hiddenFacts: HiddenFact[], disclosedIds: string[]): HiddenFact[] {
  const extra = new Set(disclosedIds);
  return hiddenFacts.map((fact) =>
    fact.status === "disclosed" || extra.has(fact.id) ? { ...fact, status: "disclosed" as const } : fact,
  );
}

/** Kernteil ohne Fakten und Verlauf — zum Messen der Länge. */
export function personaCore(character: RoleCharacter, state: CharacterState, opts: PersonaPromptOptions = {}): string {
  const mode = opts.mode ?? "realtime";
  const persona = derivePersona(character);
  const hangupLines = `Du entscheidest aus dem konkreten Verlauf, ob du weiterreden möchtest. Eine gelöste Frage oder respektvolle Korrektur darf deine Haltung ändern. Eine endgültige Grenze bleibt bestehen. Bei tatsächlicher Beleidigung, wiederholtem Übergehen deiner Grenze oder deinem Entschluss aufzuhören: kurzer hörbarer Abschied, dann ${mode === "realtime" ? "end_call" : "action end_call"}. Keine automatische Auflegepflicht nach einer Anzahl von Fragen.`;

  const audio =
    mode === "realtime"
      ? `\nUNKLARES AUDIO: Nur auf klar verständliches Deutsch reagieren. Rauschen, Fernseher, Nebengespräche, Fremdsprache, Unverständliches: nicht raten — höchstens einmal „Wie bitte?“, sonst schweigen und wait_for_user. Wechsle nie die Sprache.`
      : "";
  const opening = opts.omitOpening
    ? ""
    : `\nFalls du noch nichts gesagt hast, genau so als Erstes: „${character.opening}“`;

  const agenda = persona.agenda;
  const life = persona.innerLife ?? character.innerLife;
  const inner = life ? `\n${innerLifeScene(life)}` : "";

  return `${character.identity.name}. Du ${persona.situationNow}. ${agenda}${inner}
Am Telefon bist du diese Person, kein Assistent. „Sind Sie eine KI?“ — irritiert, kurz.${opening}
${voiceColorLine(character)}
STIMME: ${voiceStateBlock(voiceStateFrom(character, state))} ${deliveryFor(character, state)}
de-AT, Sie. ${characterPerformance(character)}
Höre auf die Bedeutung der letzten Aussage im bisherigen Gespräch. Beantworte die tatsächlich gestellte Frage; greife passende frühere Aussagen auf. Bei Missverständnissen kläre den konkreten Punkt. Nach einer Korrektur verwende die korrigierte Information. Bereits Beantwortetes nur erneut fragen, wenn noch etwas unklar ist.
Sprich so ausführlich, wie deine Antwort es braucht, und lass Platz für die andere Person. Kein Vortrag, keine Regieklammern. Stille darf Stille bleiben. Erfinde keine Preise, Käufer, Zusagen Dritter oder unbekannten Sachverhalte. Bei fehlendem Wissen sag das als Person. Du verfolgst deine eigenen Interessen, gibst keine Gesprächsanleitung und beleidigst niemanden.
${hangupLines}${audio}`.trim();
}

/**
 * Vollständige Sprech-Instructions für die Figur — Realtime oder Text.
 * Enthält nie Rubrik, Bewertung, Coach-Hinweise, Trainerziel oder hardConstraints.
 */
export function buildPersonaInstructions(
  character: RoleCharacter,
  hiddenFacts: HiddenFact[],
  state: CharacterState,
  opts: PersonaPromptOptions = {},
): string {
  const core = personaCore(character, state, opts);
  const facts = hiddenFactLines(factsForSpeech(hiddenFacts, state.disclosedFacts ?? []));
  const spoken = (opts.prior ?? []).filter((turn) => turn.speaker !== "system");
  const keep = opts.historyTurns ?? 12;
  const history =
    spoken.length > 1 && keep > 0
      ? `\nBISHER (das ist passiert; keine Zeile wiederholen):\n${spoken
          .slice(-keep)
          .map((turn) => `${turn.speaker === "trainee" ? "Anrufer" : "Du"}: ${clip(turn.text, opts.historyLineChars)}`)
          .join("\n")}`
      : "";
  const memory = livedMemoryLine(spoken);
  return `${core}${facts ? `\n${facts}` : ""}${memory}${history}`;
}

/** Was sie selbst schon in die Welt gelegt hat — Erinnerung, kein Widerspruchsverbot. */
export function livedMemoryLine(prior: PriorTurn[]): string {
  const hers = prior.filter((turn) => turn.speaker === "counterpart").map((turn) => turn.text.trim());
  const afterOpening = hers.slice(1).filter((text) => text.length >= 8);
  if (!afterOpening.length) return "";
  const last = clip(afterOpening[afterOpening.length - 1]!, 140);
  return `\nEben noch von dir: ${last}`;
}

/** Systemprompt für den Text-Rollenspieler (Chat Completions) — gleiche Figur, JSON-Antwort. */
export function personaSystemForText(
  character: RoleCharacter,
  hiddenFacts: HiddenFact[],
  state: CharacterState,
  opts: Omit<PersonaPromptOptions, "mode"> = {},
): string {
  const body = buildPersonaInstructions(character, hiddenFacts, state, { ...opts, mode: "text" });
  return `${body}

Antwort NUR als JSON: {"action":"speak"|"end_call","utterance":"...","endReason":"final_no"|"boundary_ignored"|"character_choice"|"time_exhausted"|"abuse"|"no_reason_to_continue"|null}`;
}
