import {
  classifyCoachQuestion,
  playbookFor,
  SITUATION_LABELS,
  type CoachPlaybook,
  type CoachSituationId,
} from "@/lib/coach-canon";
import { isNotAssessable, resolveDebriefMoment } from "@/lib/debrief-moments";
import { getFocus } from "@/lib/focus";
import { coachIntelBlock, sceneIntelForCoach, type SceneBeat, type SceneEvalBeat } from "@/lib/scene-intel";
import { oneSentence, type Spotlight } from "@/lib/spotlight";
import { DEFAULT_VERTICAL, isVerticalId } from "@/lib/verticals";
import type { Evaluation, TranscriptTurn } from "@/src/role-engine/types";

/** Felder, die der Deep-Link aus einer beendeten Sitzung braucht — kein Scorecard-Dump. */
export type CoachHandoffSource = {
  id: string;
  status: string;
  scenarioId: string;
  scenarioTitle: string;
  counterpartName: string;
  publicBrief: string;
  verticalId: string;
  focusId: string;
  focusLabel: string;
  turns: TranscriptTurn[];
  evaluation: Pick<
    Evaluation,
    "keyMoment" | "importantMomentTurnId" | "nextStep" | "nextLine" | "calibration" | "strength"
  > | null;
};

export type CoachHandoff = {
  sessionId: string;
  turnId: string | null;
  quote: string;
  focusId: string;
  focusLabel: string;
  nextStep: string;
  phrase: string;
  situation: CoachSituationId;
  playbook: CoachPlaybook;
  counterpartName: string;
  scenarioTitle: string;
  recap: string;
  lever: string;
  noContribution: boolean;
  reviewQuestions: { title: string; text: string }[];
  /** Pack-Fokus — Coach nach Hangup, nie Role Player. */
  goal: string;
  beats: SceneBeat[];
  qualify: string[];
  evalBeats: SceneEvalBeat[];
};

const SCORECARD_LEAK =
  /\/\s*4\b|\b[0-4]\s*\/\s*4\b|Rubrik|Gesamtnote|\bScore\b|commercial_judgment|decision_process|contextual_fit|truthfulness|Evaluator|Rationale|mustNotice|calibration|Scorecard/i;

const ISOLATION_PITCH =
  /Isolation|Role Player|Role Generator|State Engine|verdeckter Zustand|private_state|Hidden Fact|TB-[A-Z]|Rubrik im (Player|Figur)/i;

const PSYCH_OR_DEFICIT =
  /keine stärke|nicht gelungen|gereizt|unsicher|ängstlich|aggressiv|Halo/i;

export function handoffLeaksScorecard(text: string): boolean {
  return SCORECARD_LEAK.test(text);
}

export function handoffSellsIsolation(text: string): boolean {
  return ISOLATION_PITCH.test(text);
}

export function stripCoachLeak(text: string): string {
  const cleaned = text
    .split(/(?<=[.!?…])\s+/)
    .map((part) => part.trim())
    .filter(
      (part) =>
        part && !handoffLeaksScorecard(part) && !handoffSellsIsolation(part) && !PSYCH_OR_DEFICIT.test(part),
    )
    .join(" ")
    .trim();
  return cleaned;
}

export function playbookHeading(book: CoachPlaybook): string {
  if (/E-R-K-B-N|V-S-K-B|MEDDPICC/i.test(book.title)) return SITUATION_LABELS[book.situation];
  return book.title;
}

export function coachHandoffHref(input: { sessionId: string; turnId?: string | null; focusId?: string | null }): string {
  const params = new URLSearchParams();
  params.set("session", input.sessionId);
  if (input.turnId) params.set("turn", input.turnId);
  if (input.focusId) params.set("focus", input.focusId);
  return `/coach?${params.toString()}`;
}

export function parseCoachHandoffSearchParams(params: {
  session?: string;
  turn?: string;
  focus?: string;
}): { sessionId: string; turnId: string | null; focusId: string | null } | null {
  const sessionId = params.session?.trim();
  if (!sessionId) return null;
  return {
    sessionId,
    turnId: params.turn?.trim() || null,
    focusId: params.focus?.trim() || null,
  };
}

export function situationForHandoff(
  focusId: string,
  blob: string,
): CoachSituationId {
  if (focusId === "authority") return "entscheidung";
  if (focusId === "boundary") {
    return /einwand|zu teuer|kein interesse|schon einen/i.test(blob) ? "einwand" : "absage";
  }
  return classifyCoachQuestion(blob);
}

export function resolveCoachHandoff(session: CoachHandoffSource, preferredTurnId?: string | null): CoachHandoff {
  if (session.status !== "ended") {
    throw new Error("Der Coach sieht keine laufende Sitzung. Erst auflegen.");
  }
  const vertical = isVerticalId(session.verticalId) ? session.verticalId : DEFAULT_VERTICAL;
  const focus = getFocus(vertical, session.focusId);
  const ev = session.evaluation;
  const moment = resolveDebriefMoment(session.turns, ev);
  const turnId =
    preferredTurnId && session.turns.some((turn) => turn.id === preferredTurnId) ? preferredTurnId : moment.turnId;
  const turn = turnId ? session.turns.find((item) => item.id === turnId) : undefined;
  const quote = (turn?.text || moment.quote).trim();
  const noContribution = isNotAssessable(ev);
  const nextStep = stripCoachLeak(ev?.nextStep?.trim() || focus.nextStep) || focus.nextStep;
  const blob = [session.focusLabel, session.scenarioTitle, session.publicBrief, nextStep, quote, moment.whatHappened].join(
    " ",
  );
  const situation = situationForHandoff(session.focusId, blob);
  const playbook = playbookFor(situation);
  const phrase = stripCoachLeak(ev?.nextLine?.trim() || playbook.phrase) || playbook.phrase;
  const recapFallback = `Gespräch mit ${session.counterpartName} · ${session.scenarioTitle}. Fokus: ${session.focusLabel}.`;
  const strength = stripCoachLeak(ev && "strength" in ev ? String(ev.strength ?? "") : "");
  const recapRaw = noContribution
    ? `Kein eigener Beitrag im Gespräch mit ${session.counterpartName}. Üben Sie denselben Satz.`
    : strength || recapFallback;
  const leverRaw =
    stripCoachLeak(moment.whatHappened) ||
    (noContribution ? "Üben Sie denselben Satz an dieser Stelle." : `An dieser Stelle zählt ${session.focusLabel}.`);
  const recap = stripCoachLeak(recapRaw) || recapFallback;
  const reviewQuestions = reviewQuestionsForHandoff({ quote, focusLabel: session.focusLabel, situation, phrase });
  const intel = sceneIntelForCoach(session.scenarioId);
  return {
    sessionId: session.id,
    turnId,
    quote,
    focusId: session.focusId,
    focusLabel: session.focusLabel,
    nextStep: oneSentence(nextStep),
    phrase,
    situation,
    playbook,
    counterpartName: session.counterpartName,
    scenarioTitle: session.scenarioTitle,
    recap,
    lever: leverRaw,
    noContribution,
    reviewQuestions,
    goal: intel?.goal ?? "",
    beats: intel?.beats ?? [],
    qualify: intel?.qualify ?? [],
    evalBeats: intel?.evalBeats ?? [],
  };
}

export function reviewQuestionsForHandoff(input: {
  quote: string;
  focusLabel: string;
  situation: CoachSituationId;
  phrase: string;
}): { title: string; text: string }[] {
  const quote = input.quote ? ` „${input.quote}“` : "";
  const questions = [
    {
      title: "Was passierte hier?",
      text: `An dieser Stelle${quote} — was ist hörbar passiert, und was wäre der nächste angemessene Satz? Fokus: ${input.focusLabel}.`,
    },
    {
      title: "Nächster Satz",
      text: input.phrase
        ? `Üben Sie diesen Satz an der Stelle, stiloffen, nicht wörtlich Pflicht: „${input.phrase}“`
        : `Formulieren Sie den einen nächsten Satz an dieser Stelle. Fokus: ${input.focusLabel}.`,
    },
  ];
  if (input.situation === "einwand") {
    questions.push({
      title: "Einwand aufnehmen",
      text: `Der Einwand war${quote}. Wie nehmen Sie ihn auf, ohne dagegen zu argumentieren?`,
    });
  }
  return questions;
}

export function spotlightFromHandoff(handoff: CoachHandoff): Spotlight {
  return {
    recap: handoff.recap,
    lever: handoff.lever,
    quote: handoff.quote,
    nextStep: handoff.nextStep,
    phrase: handoff.phrase,
  };
}

export function handoffPublicContext(
  session: Pick<CoachHandoffSource, "scenarioId" | "scenarioTitle" | "publicBrief" | "turns" | "counterpartName">,
  handoff: CoachHandoff,
): string {
  const transcript = session.turns
    .filter((turn) => turn.speaker !== "system")
    .map((turn) => `${turn.speaker === "trainee" ? "Makler" : session.counterpartName}: ${turn.text}`)
    .join("\n");
  const intel = coachIntelBlock(session.scenarioId);
  return [
    `Beendetes Gespräch: ${session.scenarioTitle}`,
    `Öffentliches Briefing: ${session.publicBrief}`,
    `Fokus: ${handoff.focusLabel}`,
    intel,
    handoff.quote ? `Stelle: „${handoff.quote}“` : "",
    `Nächster Zug: ${handoff.nextStep}`,
    handoff.phrase ? `Formulierung: „${handoff.phrase}“` : "",
    `Transkript:\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
