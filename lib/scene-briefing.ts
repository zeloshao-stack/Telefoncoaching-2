/**
 * Training-Seite /szenario/[id]: eine scannbare Seite.
 * Drei Ziele sichtbar (Titel + beat.why). qualify/evalBeats bleiben für A08.
 */

import type { CallGuide } from "@/lib/authored-types";
import { cardsFor } from "@/lib/content/pack";
import { defaultFocusForScenario, getFocus } from "@/lib/focus";
import { drillHonesty, trainingBeats, type TrainingBeat } from "@/lib/scenario-product";
import { beatTitles, visibleGoalsFromBeats, type VisibleGoal } from "@/lib/scene-card";
import { sceneIntel } from "@/lib/scene-intel";
import type { VerticalId } from "@/lib/verticals";

export const BRIEFING_NOTICE = "Die Gegenseite kennt Ihren Auftrag nicht.";

export type SceneBriefingInput = {
  id: string;
  title: string;
  publicBrief: string;
  acceptableOutcome?: string;
  knowledgeCardIds: string[];
  guide?: CallGuide;
  blurb?: string;
  draft?: boolean;
  verticalId: VerticalId;
};

export type SceneBriefing = {
  title: string;
  goal: string;
  scene: string;
  goals: VisibleGoal[];
  countTitles: string[];
  notice: string;
  /** Für A08/Evaluator — nicht auf der Training-Seite rendern. */
  qualifyPoints: string[];
  prepFacts: string[];
  evalBeats: TrainingBeat[];
};

/** Was /szenario zeigen darf: Ziel, Absatz, drei Ziele (Titel+Why), Hinweis. */
export function trainingPageSurface(briefing: SceneBriefing): {
  title: string;
  goal: string;
  scene: string;
  goals: VisibleGoal[];
  notice: string;
} {
  return {
    title: briefing.title,
    goal: briefing.goal,
    scene: briefing.scene,
    goals: briefing.goals,
    notice: briefing.notice,
  };
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 8);
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line.trim());
  }
  return out;
}

export function toSceneBriefing(input: SceneBriefingInput): SceneBriefing | null {
  const title = input.title.trim();
  const scene = input.publicBrief.trim();
  if (!title || !scene) return null;
  const intel = sceneIntel(input.id);
  if (intel) {
    const { goals } = visibleGoalsFromBeats(intel.beats, intel.goal);
    return {
      title,
      goal: intel.goal,
      scene,
      goals,
      countTitles: beatTitles(goals),
      notice: BRIEFING_NOTICE,
      qualifyPoints: intel.qualify,
      prepFacts: intel.prep,
      evalBeats: intel.evalBeats.map((beat) => ({
        title: beat.title,
        action: beat.observable,
        why: "",
      })),
    };
  }
  const honesty = drillHonesty(input.id, input.draft);
  const focus = getFocus(input.verticalId, defaultFocusForScenario(input.id, input.verticalId));
  const beats = trainingBeats({
    practiceFocus: honesty.practiceFocus,
    honesty: honesty.honesty,
    focusHint: focus.hint,
    focusNext: focus.nextStep,
    blurb: input.blurb,
  }).map((beat) => ({ ...beat, why: "" }));
  const { goals } = visibleGoalsFromBeats(beats, honesty.practiceFocus);
  const cards = cardsFor(input.knowledgeCardIds);
  const qualifyPoints = uniqueLines([
    ...beats.map((beat) => `${beat.title} – ${beat.action}`),
    input.acceptableOutcome?.trim() ?? "",
    ...(input.guide?.questions ?? []),
  ]).slice(0, 6);
  const prepFacts = uniqueLines([
    ...sentences(scene),
    ...cards.map((card) => card.application),
  ]).slice(0, 6);
  const evalSources = [focus.hint, focus.nextStep, ...cards.map((card) => card.observable), honesty.practiceFocus];
  const evalBeats: TrainingBeat[] = [];
  for (const source of evalSources) {
    const text = source.trim();
    if (!text) continue;
    if (evalBeats.some((beat) => beat.action === text || beat.title === text)) continue;
    const { title: beatTitle, sentence } = splitOrKeep(text);
    evalBeats.push({ title: beatTitle, action: sentence, why: "" });
    if (evalBeats.length === 4) break;
  }
  if (qualifyPoints.length === 0 || evalBeats.length === 0) return null;
  return {
    title,
    goal: honesty.practiceFocus,
    scene,
    goals,
    countTitles: beatTitles(goals),
    notice: BRIEFING_NOTICE,
    qualifyPoints,
    prepFacts,
    evalBeats,
  };
}

function splitOrKeep(text: string): { title: string; sentence: string } {
  const comma = text.match(/^(.{8,56}?), (.+)$/);
  if (comma?.[1] && comma[2]) {
    return { title: comma[1].replace(/[.,;:]+$/, ""), sentence: comma[2] };
  }
  return { title: text.replace(/[.,;:]+$/, ""), sentence: text };
}

