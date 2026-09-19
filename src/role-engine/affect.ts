import type {
  AffectProcess,
  CharacterAffect,
  CharacterState,
  Observation,
  RoleCharacter,
  VocalChannel,
  VoiceDelivery,
} from "./types";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function deliveryFrom(process: AffectProcess, arousal: number, feltSafety: number, affiliation: number): VoiceDelivery {
  if (process === "withdrawal" || arousal >= 78) {
    return { mood: "impatient", rate: "faster", volume: "firmer", warmth: "flat", breath: "held" };
  }
  if (process === "reactance") {
    return { mood: "impatient", rate: "faster", volume: "firmer", warmth: "flat", breath: "held" };
  }
  if (process === "face_threat") {
    return { mood: "skeptical", rate: "even", volume: "firmer", warmth: "flat", breath: "held" };
  }
  if (process === "co_regulation") {
    return { mood: "calm", rate: "slower", volume: "softer", warmth: "warm", breath: "normal" };
  }
  if (process === "affiliation") {
    return {
      mood: affiliation > 62 ? "cheerful" : "warm",
      rate: "even",
      volume: "even",
      warmth: "smiling",
      breath: "normal",
    };
  }
  if (feltSafety >= 62 && arousal <= 40) {
    return { mood: "calm", rate: "slower", volume: "softer", warmth: "warm", breath: "normal" };
  }
  if (affiliation >= 58) {
    return { mood: "warm", rate: "even", volume: "even", warmth: "warm", breath: "normal" };
  }
  if (feltSafety < 35) {
    return { mood: "skeptical", rate: "even", volume: "even", warmth: "flat", breath: "sigh" };
  }
  return { mood: "neutral", rate: "even", volume: "even", warmth: "neutral", breath: "normal" };
}

export function initialAffect(character: RoleCharacter): CharacterAffect {
  const patience = character.traits.patience / 10;
  const arousal = clamp(28 + (1 - patience) * 22 + character.initialState.irritation * 0.25);
  const feltSafety = clamp(52 - character.initialState.irritation * 0.4 + patience * 12);
  const affiliation = clamp(24 + character.traits.humor * 1.4 + character.behaviour.smalltalkAffinity * 1.2);
  const valence = clamp(55 - character.initialState.irritation * 0.35 + character.initialState.trust * 0.2);
  const process: AffectProcess = character.initialState.irritation > 30 ? "face_threat" : "contagion";
  return {
    arousal,
    feltSafety,
    affiliation,
    valence,
    process,
    voice: deliveryFrom(process, arousal, feltSafety, affiliation),
  };
}

export function hydrateAffect(character: RoleCharacter, state: CharacterState): CharacterAffect {
  return state.affect ?? initialAffect(character);
}

type Pulse = { arousal: number; feltSafety: number; affiliation: number; valence: number; irritation: number };

function strongestProcess(hits: Array<{ process: AffectProcess; weight: number }>): AffectProcess {
  if (!hits.length) return "contagion";
  return hits.reduce((best, hit) => (hit.weight > best.weight ? hit : best)).process;
}

/**
 * Psychologische Abläufe am Telefon:
 * - Co-Regulation: ruhige, weiche, langsamere Stimme = Safety-Cue, senkt Erregung.
 * - Contagion: Lautstärke/Tempo färben auf die Figur ab (Callcenter-Mimikry).
 * - Reaktanz: Druck + kontrollierende Sprache (+ laute/schnelle Stimme) → Ärger.
 * - Face-Threat: Unterbrechung, übergangene Grenze.
 * - Affiliation: Lachen, Mhm, Lächeln in der Stimme (auditorisch-motorische Kopplung).
 * - Withdrawal: zu viel Erregung/Druck → Rückzug, Auflegen.
 */
export function reduceAffect(
  character: RoleCharacter,
  state: CharacterState,
  observations: Observation[],
  vocal: VocalChannel,
): CharacterAffect {
  const traits = character.traits;
  const patience = traits.patience / 10;
  const skepticism = traits.skepticism / 10;
  const dominance = traits.dominance / 10;
  const humor = traits.humor / 10;
  const avoid = traits.conflictAvoidance / 10;
  const prev = hydrateAffect(character, state);
  const types = new Set(observations.map((o) => o.type));
  const pulse: Pulse = {
    arousal: 0,
    feltSafety: 0,
    affiliation: 0,
    valence: 0,
    irritation: 0,
  };
  const hits: Array<{ process: AffectProcess; weight: number }> = [];

  const calmVoice =
    (vocal.rate === "slow" || vocal.rate === "calm" || vocal.intensity === "soft") &&
    vocal.warmth !== "cold" &&
    !vocal.controllingLanguage;
  const provoked =
    vocal.controllingLanguage ||
    vocal.intensity === "loud" ||
    vocal.rate === "rushed" ||
    types.has("created_pressure") ||
    types.has("premature_close") ||
    (types.has("generic_pitch") && vocal.rate === "fast");

  if (
    (calmVoice || vocal.soothingLanguage || types.has("acknowledged_concern") || types.has("respected_no")) &&
    !vocal.overlapping &&
    !types.has("interrupted_character")
  ) {
    const gain = 1 + patience * 0.5;
    pulse.arousal -= 9 * gain;
    pulse.feltSafety += 11 * gain;
    pulse.affiliation += 4;
    pulse.valence += 6;
    pulse.irritation -= 7 * gain;
    hits.push({ process: "co_regulation", weight: 8 + (calmVoice ? 4 : 0) + (vocal.soothingLanguage ? 3 : 0) });
  }

  const hostile =
    prev.process === "reactance" || prev.process === "withdrawal" || prev.process === "face_threat";
  const earnedWarmth = types.has("respected_no");

  if ((vocal.laughter || vocal.smileCue || vocal.backchannel) && !(hostile && !earnedWarmth)) {
    const gain = 0.7 + humor * 0.6 - skepticism * 0.2;
    pulse.affiliation += 10 * gain;
    pulse.feltSafety += 5 * gain;
    pulse.arousal -= vocal.laughter ? 4 : 2;
    pulse.valence += 8 * gain;
    pulse.irritation -= 3;
    hits.push({
      process: "affiliation",
      weight: 7 + (vocal.laughter ? 9 : 0) + (vocal.backchannel ? 2 : 0) + (vocal.smileCue ? 2 : 0),
    });
  }

  if (provoked) {
    const gain = 0.8 + dominance * 0.4 + (1 - patience) * 0.4;
    const loudBoost = vocal.intensity === "loud" || vocal.rate === "rushed" ? 1.35 : 1;
    pulse.arousal += 12 * gain * loudBoost;
    pulse.feltSafety -= 10 * gain;
    pulse.affiliation -= 6;
    pulse.valence -= 8;
    pulse.irritation += 9 * gain * loudBoost;
    hits.push({ process: "reactance", weight: 9 * loudBoost + (vocal.controllingLanguage ? 4 : 0) });
  }

  if (vocal.overlapping || types.has("interrupted_character") || types.has("ignored_boundary")) {
    pulse.arousal += 8;
    pulse.feltSafety -= 9;
    pulse.affiliation -= 5;
    pulse.valence -= 6;
    pulse.irritation += 7;
    hits.push({ process: "face_threat", weight: 14 });
  }

  // Emotionale Ansteckung: Tempo/Lautstärke sickern immer ein, auch ohne Provokation.
  if (vocal.intensity === "loud") pulse.arousal += 4;
  if (vocal.intensity === "soft") pulse.arousal -= 3;
  if (vocal.rate === "fast" || vocal.rate === "rushed") pulse.arousal += 3;
  if (vocal.rate === "slow" || vocal.rate === "calm") pulse.arousal -= 3;
  hits.push({ process: "contagion", weight: 2 });

  const nextArousal = clamp(prev.arousal + pulse.arousal);
  const nextSafety = clamp(prev.feltSafety + pulse.feltSafety);
  const nextAff = clamp(prev.affiliation + pulse.affiliation);
  const nextValence = clamp(prev.valence + pulse.valence);
  let process = strongestProcess(hits);

  const withdrawBar = 72 - avoid * 18;
  if (
    nextArousal >= withdrawBar ||
    state.timeWillingness < 18 ||
    types.has("continued_after_final_no") ||
    state.irritation + pulse.irritation >= 78
  ) {
    process = "withdrawal";
  } else if (hostile && process === "affiliation" && !earnedWarmth) {
    process = prev.process;
  }

  return {
    arousal: nextArousal,
    feltSafety: nextSafety,
    affiliation: nextAff,
    valence: nextValence,
    process,
    voice: deliveryFrom(process, nextArousal, nextSafety, nextAff),
  };
}

export function affectDeltas(affect: CharacterAffect, previous: CharacterAffect): Partial<Record<"irritation" | "trust" | "timeWillingness" | "salesPressure", number>> {
  const dArousal = affect.arousal - previous.arousal;
  const dSafety = affect.feltSafety - previous.feltSafety;
  const dAff = affect.affiliation - previous.affiliation;
  return {
    irritation: dArousal * 0.35 - dSafety * 0.2,
    trust: dSafety * 0.15 + dAff * 0.1,
    timeWillingness: dSafety * 0.2 - Math.max(0, dArousal) * 0.15,
    salesPressure: affect.process === "reactance" || affect.process === "withdrawal" ? 4 : affect.process === "co_regulation" ? -3 : 0,
  };
}

export function firstSpokenSentence(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/^.+?[.!?…](?=\s|$)/);
  return (match?.[0] || trimmed).trim();
}

/** Wortlaut färben — Tags für ElevenLabs setzt die TTS-Schicht, nicht das Transkript. */
export function spokenWithAffect(text: string, affect: CharacterAffect): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (affect.process === "withdrawal") return firstSpokenSentence(trimmed);
  if (affect.process === "reactance" && trimmed.length > 110) return firstSpokenSentence(trimmed);
  if (affect.process === "face_threat" && affect.voice.breath === "sigh" && !/^(naja|ach)\b/i.test(trimmed)) {
    return `Naja. ${trimmed}`;
  }
  if (
    affect.process === "affiliation" &&
    (affect.voice.warmth === "smiling" || affect.voice.mood === "warm" || affect.voice.mood === "cheerful") &&
    trimmed.length < 90 &&
    !/^(mhm|ja)\b/i.test(trimmed)
  ) {
    return `Mhm. ${trimmed}`;
  }
  return trimmed;
}

export function voiceFeelLabel(affect: CharacterAffect): string {
  if (affect.process === "co_regulation") return "entspannt sich";
  if (affect.process === "reactance") return "wird knapper";
  if (affect.process === "face_threat") return "getroffen";
  if (affect.process === "affiliation") return "wird wärmer";
  if (affect.process === "withdrawal") return "will weg";
  if (affect.voice.mood === "impatient") return "ungeduldig";
  if (affect.voice.mood === "calm") return "ruhig";
  if (affect.voice.mood === "warm" || affect.voice.mood === "cheerful") return "offen";
  if (affect.voice.mood === "skeptical") return "skeptisch";
  return "am Hörer";
}

/** Kurzes Stimmpaket fürs Sprechmodell / Realtime session.update — ohne Rubrik, ohne Hidden Facts. */
export function affectivePacket(state: CharacterState, character: RoleCharacter): string {
  const a = hydrateAffect(character, state);
  const voice = a.voice;
  const feel =
    a.process === "co_regulation"
      ? "Du entspannst dich. Die Stimme am anderen Ende ist ruhig — du atmest tiefer, die Schultern sinken."
      : a.process === "reactance"
        ? "Du ärgerst dich. Das fühlt sich wie Druck oder Provokation an. Du schützt deine Autonomie."
        : a.process === "face_threat"
          ? "Das hat dich vor den Kopf gestoßen. Du wirst knapper, nicht laut schreiend."
          : a.process === "affiliation"
            ? "Da war Wärme — ein Lachen, ein Mhm, ein Lächeln in der Stimme. Du wirst zugänglicher."
            : a.process === "withdrawal"
              ? "Dir reicht es. Du willst weg. Kurze Sätze, dann auflegen wenn es so weitergeht."
              : "Du hörst die Stimme und nimmst unwillkürlich Tempo und Wärme mit.";

  const speak =
    voice.mood === "calm"
      ? "Sprich langsamer, leiser, mit etwas Wärme. Kurze Pausen. Kein Pitch."
      : voice.mood === "impatient"
        ? "Kürzer, enger, etwas schärfer. Nicht schreien. Ein Atemzug vor dem Satz."
        : voice.mood === "warm" || voice.mood === "cheerful"
          ? "Etwas Lächeln in der Stimme. Ein Mhm oder ein kleines Lachen ist erlaubt, wenn es passt."
          : voice.mood === "skeptical"
            ? "Trocken, gehalten, wenig Melodie."
            : "Normale Telefonstimme, nicht ansagen.";

  return `INNERE LAGE (verborgen, steuert Stimme und Kürze):
Prozess: ${a.process}. Erregung ${a.arousal}/100, Sicherheit ${a.feltSafety}/100, Nähe ${a.affiliation}/100.
${feel}
STIMME JETZT: ${speak} Tempo ${voice.rate}, Lautstärke ${voice.volume}, Atem ${voice.breath}.
Regel: ruhige Stimme beruhigt dich; Provokation und Druck reizen dich; Lachen und warmes Mhm wärmen; Unterbrechen kränkt.
Du bewertest niemanden. Du bist die Person am Hörer.`;
}
