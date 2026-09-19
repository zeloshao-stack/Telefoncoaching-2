import { hydrateAffect } from "./affect";
import type {
  BehaviourPolicy,
  CharacterAffect,
  CharacterState,
  CharacterTraits,
  RoleCharacter,
} from "./types";

export type PauseProfile = "short" | "reflective" | "hesitant" | "resistant";

/** Ein Anker aus 011: Gehalten / Ihre Lage / Abgegeben-oder-weg / Neu angesetzt. Nicht pause_profile. */
export type ContourClass = "held" | "stance" | "released" | "reonset";

export type VoiceState = {
  valence: number; // -1..1
  arousal: number; // 0..1
  dominance: number; // 0..1
  tension: number; // 0..1
  speechRate: number; // relative -1..1
  pitchRange: number;
  intensity: number;
  pauseProfile: PauseProfile;
  interruptionReadiness: number;
  dialectStrength: number;
  contourClass: ContourClass;
};

export type VoiceStateHints = {
  interrupted?: boolean;
  previous?: VoiceState;
};

const SAFETY_LOW = 40;
const TENSION_HIGH = 0.6;
const DOMINANCE_LOW = 0.45;
const IRRITATION_HOLD = 24;
const COLD_TENSION = 0.72;
const COLD_VALENCE = -0.25;
const INERTIA_STEP = 0.28;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clampRel(n: number) {
  return Math.max(-1, Math.min(1, n));
}

function stepToward(from: number, to: number, maxStep: number) {
  const delta = to - from;
  if (Math.abs(delta) <= maxStep) return to;
  return from + Math.sign(delta) * maxStep;
}

function tensionOf(affect: CharacterAffect, irritation: number): number {
  const arousal = affect.arousal / 100;
  const unsafe = 1 - affect.feltSafety / 100;
  const irr = irritation / 100;
  let tension = 0.35 * arousal + 0.4 * unsafe + 0.25 * irr;
  if (affect.process === "reactance" || affect.process === "withdrawal") tension += 0.15;
  if (affect.process === "co_regulation") tension -= 0.2;
  return clamp01(tension);
}

function pauseFrom(args: {
  process: CharacterAffect["process"];
  feltSafety: number;
  arousal: number;
  mood: CharacterAffect["voice"]["mood"];
  tension: number;
  dominance: number;
  irritation: number;
  skepticism: number;
}): PauseProfile {
  if (args.process === "reactance" || args.process === "withdrawal") return "resistant";
  // Face-Threat ist gehalten, nicht Wortsuche — Repair ≠ hesitant (007).
  if (args.process === "face_threat") return "resistant";
  const uncertain = args.feltSafety < SAFETY_LOW || (args.tension >= TENSION_HIGH && args.dominance < DOMINANCE_LOW);
  if (uncertain) return "hesitant";
  if (args.process === "co_regulation" || args.mood === "calm") {
    // Irritation und Skepsis halten das Register: kein Sofort-Kippen in FAQ-Wärme.
    if (args.irritation >= IRRITATION_HOLD) return "short";
    if (args.skepticism >= 7 && args.tension > 0.36) return "short";
    return args.feltSafety >= 68 && args.arousal <= 38 ? "short" : "reflective";
  }
  return "short";
}

function dialectFloor(region: string | undefined): number {
  if (region && /wien|österreich|niederösterreich/i.test(region)) return 0.4;
  if (region && /steiermark|oberösterreich|salzburg|tirol|kärnten/i.test(region)) return 0.32;
  return 0.22;
}

function contourOf(args: {
  interrupted: boolean;
  process: CharacterAffect["process"];
  pauseProfile: PauseProfile;
  tension: number;
  valence: number;
}): ContourClass {
  if (args.interrupted) return "reonset";
  const cold = args.pauseProfile === "resistant" && args.tension >= COLD_TENSION && args.valence <= COLD_VALENCE;
  if (args.process === "withdrawal" || cold) return "released";
  if (args.process === "face_threat" || args.process === "reactance" || args.pauseProfile === "resistant") {
    return "held";
  }
  return "stance";
}

function mapVoice(
  affect: CharacterAffect,
  traits: CharacterTraits | undefined,
  behaviour: BehaviourPolicy | undefined,
  irritation: number,
  region: string | undefined,
  hints?: VoiceStateHints,
): VoiceState {
  const dominance = clamp01((traits?.dominance ?? 5) / 10);
  const tension = tensionOf(affect, irritation);
  const skepticism = traits?.skepticism ?? 5;
  const pauseProfile = pauseFrom({
    process: affect.process,
    feltSafety: affect.feltSafety,
    arousal: affect.arousal,
    mood: affect.voice.mood,
    tension,
    dominance,
    irritation,
    skepticism,
  });

  let speechRate =
    affect.voice.rate === "slower" ? -0.35 : affect.voice.rate === "faster" ? 0.4 : 0;
  let intensity =
    affect.voice.volume === "softer" ? -0.35 : affect.voice.volume === "firmer" ? 0.25 : 0;
  let pitchRange = 0.55;

  if (pauseProfile === "hesitant") {
    speechRate = Math.min(speechRate, -0.4);
    intensity = Math.min(intensity, -0.5);
    pitchRange = 0.32;
  } else if (pauseProfile === "resistant") {
    speechRate = Math.max(speechRate, 0.15);
    pitchRange = 0.42;
  } else if (pauseProfile === "reflective") {
    speechRate = Math.min(speechRate, -0.25);
    intensity = Math.min(intensity, -0.2);
    pitchRange = 0.48;
  }

  // Identitäts-Schwerkraft: Temperament der Figur, nicht Anrufer-Mimikry.
  if (skepticism >= 7) {
    speechRate = Math.min(speechRate, speechRate - 0.06);
    pitchRange = Math.min(pitchRange, 0.5);
  }
  if ((traits?.patience ?? 5) <= 3) {
    speechRate = Math.max(speechRate, speechRate + 0.08);
  }

  const interruptionReadiness = clamp01(
    (behaviour?.interruptionTendency ?? 3) / 10 +
      (pauseProfile === "resistant" ? 0.2 : 0) -
      (pauseProfile === "hesitant" ? 0.25 : 0),
  );
  const dialectStrength = dialectFloor(region);
  const valence = clampRel(affect.valence / 50 - 1);
  const contourClass = contourOf({
    interrupted: hints?.interrupted === true,
    process: affect.process,
    pauseProfile,
    tension,
    valence,
  });

  const next: VoiceState = {
    valence,
    arousal: clamp01(affect.arousal / 100),
    dominance,
    tension,
    speechRate: clampRel(speechRate),
    pitchRange,
    intensity: clampRel(intensity),
    pauseProfile,
    interruptionReadiness,
    dialectStrength,
    contourClass,
  };
  return applyVoiceInertia(hints?.previous, next);
}

/**
 * Emotions-Trägheit: ein Zug, kein Sprung resistant→reflective, Dialekt fällt nicht auf FAQ-Hochdeutsch.
 */
export function applyVoiceInertia(previous: VoiceState | undefined, next: VoiceState): VoiceState {
  if (!previous) return next;
  let pauseProfile = next.pauseProfile;
  if (previous.pauseProfile === "resistant" && next.pauseProfile === "reflective") {
    pauseProfile = "short";
  } else if (previous.pauseProfile === "hesitant" && next.pauseProfile === "reflective") {
    pauseProfile = "short";
  } else if (previous.pauseProfile === "resistant" && next.pauseProfile === "hesitant") {
    pauseProfile = "short";
  }

  let contourClass = next.contourClass;
  if (next.contourClass !== "reonset") {
    if (previous.contourClass === "held" && next.contourClass === "stance" && pauseProfile === "short") {
      contourClass = "held";
    }
    if (previous.contourClass === "released" && next.contourClass === "held") {
      contourClass = "released";
    }
  }

  return {
    valence: stepToward(previous.valence, next.valence, INERTIA_STEP),
    arousal: stepToward(previous.arousal, next.arousal, INERTIA_STEP),
    dominance: next.dominance,
    tension: stepToward(previous.tension, next.tension, INERTIA_STEP),
    speechRate: stepToward(previous.speechRate, next.speechRate, INERTIA_STEP),
    pitchRange: stepToward(previous.pitchRange, next.pitchRange, 0.12),
    intensity: stepToward(previous.intensity, next.intensity, INERTIA_STEP),
    pauseProfile,
    interruptionReadiness: stepToward(previous.interruptionReadiness, next.interruptionReadiness, 0.2),
    dialectStrength: clamp01(Math.max(next.dialectStrength, previous.dialectStrength * 0.8 + next.dialectStrength * 0.2)),
    contourClass,
  };
}

/** Affect + Traits → Voice State. Keine Rubrik, keine Hidden Facts. */
export function voiceStateFrom(character: RoleCharacter, state: CharacterState, previous?: VoiceState): VoiceState {
  const affect = hydrateAffect(character, state);
  return mapVoice(affect, character.traits, character.behaviour, state.irritation, character.identity.region, {
    interrupted: state.status === "interrupted",
    previous,
  });
}

/** Nur Affect — für Delivery-Tests ohne Figur. */
export function voiceStateFromAffect(affect: CharacterAffect, hints?: VoiceStateHints): VoiceState {
  return mapVoice(affect, undefined, undefined, 0, undefined, hints);
}

/**
 * Qualitativer Stimmeblock: keine Ziffern, keine Prozessnamen, keine Kontur-Codes.
 * Pausen nur an Satzgrenzen, nie mitten im Wort. Kein erfundenes Loch.
 */
export function voiceStateBlock(state: VoiceState): string {
  if (state.contourClass === "reonset") {
    return "Neuer Einsatz. Pause nach dem Satz, nicht mitten im Wort.";
  }
  if (state.contourClass === "released") {
    return "Satzende, dann weg. Keine Pause mitten im Wort, die Stille nicht füllen.";
  }
  if (state.pauseProfile === "hesitant") {
    return "Leiser und langsamer. Pause nach dem Satz, nicht mitten im Wort.";
  }
  if (state.pauseProfile === "resistant" || state.contourClass === "held") {
    return "Gehalten und knapp. Pause nach dem Satz, dann Distanz — kein Zögern im Wort.";
  }
  if (state.pauseProfile === "reflective") {
    return "Ruhiger. Kurze Pause an der Satzgrenze, dann weiter.";
  }
  return "Pausen an der Satzgrenze.";
}

/**
 * Zwischenraum der Figur. Nur explizites gap_ms.
 * heard_ms, durationMs und ein 2000-ms-Metronom sind keine Quelle — nichts erfinden.
 */
export function figurGapMs(source?: { gapMs?: number | null }): number | null {
  const gap = source?.gapMs;
  if (typeof gap === "number" && Number.isFinite(gap) && gap >= 0) return gap;
  return null;
}
