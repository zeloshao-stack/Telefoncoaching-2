/**
 * Katalogkarte auf /: Titel, Telefonat, drei sichtbare Ziele, Person, Start.
 * beat.why aus scene-intel, sonst Titel + practiceFocus — nichts erfinden.
 * evalBeats, qualify, prep bleiben vom Katalog fern.
 */

import { defaultFocusForScenario, getFocus, type FocusId } from "@/lib/focus";
import { splitNameLage } from "@/lib/featured-drill";
import {
  drillChallenge,
  drillHonesty,
  trainingBeats,
  type TrainingBeat,
} from "@/lib/scenario-product";
import { sceneIntel } from "@/lib/scene-intel";
import type { VerticalId } from "@/lib/verticals";

export const CHANNEL_LABEL = "Telefonat" as const;

export type SceneCardInput = {
  id: string;
  title: string;
  counterpart: string;
  location?: string;
  blurb?: string;
  draft?: boolean;
  verticalId: VerticalId;
};

export type VisibleGoal = {
  title: string;
  sentence: string;
};

export type SceneCardModel = {
  id: string;
  title: string;
  name: string;
  roleChip: string;
  initials: string;
  channelLabel: typeof CHANNEL_LABEL;
  callLabel: string;
  challenge: string;
  beats: TrainingBeat[];
  goals: VisibleGoal[];
  /** Nur wenn kein beat.why da ist — vorhandenes practiceFocus, nicht synthetisiert. */
  focusLine: string | null;
  countTitles: string[];
  cold: boolean;
  draft: boolean;
};

export type HomeStartKind = "featured" | "rest" | "own";

export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => /[A-Za-zÄÖÜäöüß]/.test(part));
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** Frozen- und Pack-Karten starten. Eigene Fälle bleiben Briefing. */
export function homeStartAction(kind: HomeStartKind): "start" | "briefing" {
  return kind === "own" ? "briefing" : "start";
}

export function secondaryDrillHref(id: string): string {
  return `/szenario/${id}`;
}

/** Session-POST bleibt scenarioId + focusId. Keine Ziele, kein Auftrag. */
export function catalogSessionBody(
  scenarioId: string,
  focusId: FocusId,
): { scenarioId: string; focusId: FocusId } {
  return { scenarioId, focusId };
}

/** Was die Startkarte zeigen darf — drei Ziele, keine Eval-Liste, keine Qualify-Novelle. */
export function catalogSurface(card: SceneCardModel): {
  title: string;
  channelLabel: typeof CHANNEL_LABEL;
  name: string;
  roleChip: string;
  initials: string;
  goals: VisibleGoal[];
  focusLine: string | null;
} {
  return {
    title: card.title,
    channelLabel: card.channelLabel,
    name: card.name,
    roleChip: card.roleChip,
    initials: card.initials,
    goals: card.goals,
    focusLine: card.focusLine,
  };
}

export function beatTitles(beats: Array<{ title: string }>): string[] {
  return beats.map((beat) => beat.title).filter(Boolean).slice(0, 3);
}

/** Authored why if present; otherwise titles plus one practiceFocus. Never invent a sentence. */
export function visibleGoalsFromBeats(
  beats: Array<{ title: string; why?: string }>,
  practiceFocus: string,
): { goals: VisibleGoal[]; focusLine: string | null } {
  const goals: VisibleGoal[] = [];
  for (const beat of beats) {
    const title = beat.title.trim();
    if (!title) continue;
    goals.push({ title, sentence: (beat.why ?? "").trim() });
    if (goals.length === 3) break;
  }
  const hasSentence = goals.some((goal) => goal.sentence.length > 0);
  const focus = practiceFocus.trim();
  return { goals, focusLine: hasSentence ? null : focus || null };
}

export function toSceneCard(input: SceneCardInput): SceneCardModel | null {
  const title = input.title.trim();
  if (!title) return null;
  const honesty = drillHonesty(input.id, input.draft);
  const { name, location } = splitNameLage(input.counterpart, input.location);
  if (!name) return null;
  const intel = sceneIntel(input.id);
  const focus = getFocus(input.verticalId, defaultFocusForScenario(input.id, input.verticalId));
  const beats: TrainingBeat[] = intel
    ? intel.beats.map((beat) => ({ title: beat.title, action: beat.title, why: beat.why }))
    : trainingBeats({
        practiceFocus: honesty.practiceFocus,
        honesty: honesty.honesty,
        focusHint: focus.hint,
        focusNext: focus.nextStep,
        blurb: input.blurb,
      }).map((beat) => ({ ...beat, why: "" }));
  const { goals, focusLine } = visibleGoalsFromBeats(beats, honesty.practiceFocus);
  if (goals.length === 0) return null;
  return {
    id: input.id,
    title,
    name,
    roleChip: location || honesty.callLabel,
    initials: initialsFromName(name),
    channelLabel: CHANNEL_LABEL,
    callLabel: honesty.callLabel,
    challenge: intel?.challenge ?? drillChallenge(honesty, input.blurb),
    beats,
    goals,
    focusLine,
    countTitles: beatTitles(goals),
    cold: honesty.callKind === "cold",
    draft: Boolean(input.draft),
  };
}
