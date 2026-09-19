import { ageBandOf, characterSeed, inferAge, inferGender, type AgeBand } from "./persona";
import type { RealtimeVoice, RoleCharacter } from "./types";

export const REALTIME_VOICES: readonly RealtimeVoice[] = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
];

export function isRealtimeVoice(value: unknown): value is RealtimeVoice {
  return typeof value === "string" && (REALTIME_VOICES as readonly string[]).includes(value);
}

/**
 * Klangcharakter der gpt-realtime-Stimmen (OpenAI-Katalog, Stand 2026):
 * marin  — natürlich, warm, mittlere Lage (Flaggschiff)        → weiblich, mittel
 * cedar  — ruhig, tiefer, Autorität (Flaggschiff)              → männlich, älter / bestimmt
 * coral  — warm, freundlich                                     → weiblich, älter-warm
 * sage   — gleichmäßig, nachdenklich, wenig Melodie             → weiblich, älter-skeptisch
 * shimmer— hell, ausdrucksstark                                 → weiblich, jung / lebhaft
 * alloy  — neutral, ausgewogen, sachlich                        → weiblich, Bürostimme
 * ash    — knapp, professionell, schnell                        → männlich, ungeduldig / zackig
 * echo   — mittlere Lage, neutral                               → männlich, mittel / sachlich
 * ballad — weich, erzählend                                     → männlich, jünger / ruhig
 * verse  — lebhaft, beweglich                                   → männlich, jünger / humorvoll
 */
export type VoiceProfile = {
  gender: "female" | "male";
  ageBand: AgeBand;
  temperament: "brisk" | "skeptical" | "warm" | "lively" | "calm" | "businesslike";
};

export function voiceProfileFor(character: RoleCharacter): VoiceProfile {
  const t = character.traits;
  const temperament: VoiceProfile["temperament"] =
    t.patience <= 3 && t.dominance >= 6
      ? "brisk"
      : t.skepticism >= 7
        ? "skeptical"
        : t.humor >= 6 || character.behaviour.emotionalExpression >= 7
          ? "lively"
          : t.humor >= 4 || character.behaviour.smalltalkAffinity >= 4
            ? "warm"
            : t.dominance >= 6 || character.behaviour.directness >= 8
              ? "businesslike"
              : "calm";
  return {
    gender: inferGender(character),
    ageBand: ageBandOf(inferAge(character)),
    temperament,
  };
}

const FEMALE: Record<AgeBand, Record<VoiceProfile["temperament"], RealtimeVoice[]>> = {
  older: {
    brisk: ["sage", "alloy"],
    skeptical: ["sage"],
    warm: ["coral"],
    lively: ["coral", "marin"],
    calm: ["sage", "coral"],
    businesslike: ["alloy", "sage"],
  },
  mid: {
    brisk: ["alloy", "marin"],
    skeptical: ["sage", "alloy"],
    warm: ["marin", "coral"],
    lively: ["shimmer", "marin"],
    calm: ["marin"],
    businesslike: ["alloy"],
  },
  young: {
    brisk: ["alloy", "shimmer"],
    skeptical: ["alloy"],
    warm: ["marin", "shimmer"],
    lively: ["shimmer"],
    calm: ["marin"],
    businesslike: ["alloy", "marin"],
  },
};

const MALE: Record<AgeBand, Record<VoiceProfile["temperament"], RealtimeVoice[]>> = {
  older: {
    brisk: ["ash", "cedar"],
    skeptical: ["cedar"],
    warm: ["cedar", "ballad"],
    lively: ["verse", "cedar"],
    calm: ["cedar"],
    businesslike: ["cedar", "echo"],
  },
  mid: {
    brisk: ["ash"],
    skeptical: ["echo", "cedar"],
    warm: ["ballad", "echo"],
    lively: ["verse", "ballad"],
    calm: ["echo", "ballad"],
    businesslike: ["echo", "ash"],
  },
  young: {
    brisk: ["ash", "verse"],
    skeptical: ["echo"],
    warm: ["ballad"],
    lively: ["verse"],
    calm: ["ballad", "echo"],
    businesslike: ["ash", "echo"],
  },
};

/**
 * Deterministische Stimme pro Figur: Override im Charakter gewinnt, sonst
 * Geschlecht × Altersband × Temperament, Gleichstand per Hash aufgelöst.
 */
export function pickRealtimeVoice(character: RoleCharacter): RealtimeVoice {
  if (isRealtimeVoice(character.voice)) return character.voice;
  const profile = voiceProfileFor(character);
  const table = profile.gender === "male" ? MALE : FEMALE;
  const pool = table[profile.ageBand][profile.temperament];
  return pool[characterSeed(character) % pool.length] ?? (profile.gender === "male" ? "cedar" : "marin");
}

/** Ein Satz Stimmfarbe für den Prompt — Alter und Temperament, nicht die Rubrik. */
export function voiceColorLine(character: RoleCharacter): string {
  const profile = voiceProfileFor(character);
  const age = inferAge(character);
  const tone =
    profile.temperament === "brisk"
      ? "zackig, wenig Melodie, kurze Atemzüge"
      : profile.temperament === "skeptical"
        ? "trocken, gehalten, eher tief im Satz"
        : profile.temperament === "lively"
          ? "beweglich, schnelle Wechsel, ohne Ansage-Ton"
          : profile.temperament === "warm"
            ? "weich, ruhiges Tempo, freundlich ohne Süße"
            : profile.temperament === "businesslike"
              ? "sachlich, klar, ohne Verkaufston"
              : "ruhig, gleichmäßig, nachdenkliche Pausen";
  const ageHint = profile.ageBand === "older" ? "etwas langsamer" : profile.ageBand === "young" ? "schneller, knapper" : "normales Tempo";
  return `Stimme: ${age}, ${profile.gender === "male" ? "männlich" : "weiblich"}, ${tone}, ${ageHint}.`;
}
