import type { AcousticSample, VocalChannel, VocalIntensity, VocalRate, VocalWarmth } from "./types";

const LAUGH = /\b(haha+|hehe+|hihi+|hah+|lacht)\b|😂|😄|😊|🙂/;
const BACKCHANNEL = /^(mhm+|aha+|ah+|hm+|ja|genau|verstehe|ok|okay|mm)[.!?…]*$/i;
const SMILE = /\b(schön|nett|freut|liebe das|das mag ich|zum schmunzeln)\b|:\)|😊|🙂/;
const CONTROL = /\b(müssen sie|sie müssen|sofort|jetzt gleich|nur noch heute|letzte chance|wenn sie jetzt nicht|ich sage? ihnen|packen wir das|fix abschließen)\b/;
const SOOTHE = /\b(kein druck|in ruhe|wenn es passt|ganz in ihrer zeit|ich höre|verstehe|kein problem|lassen sie sich zeit|ruhig|ohne eile)\b/;

function rateFromWpm(wpm: number | null, wordCount: number, hasQuestion: boolean): VocalRate {
  if (wpm == null) {
    if (wordCount > 55 && !hasQuestion) return "rushed";
    if (wordCount > 40 && !hasQuestion) return "fast";
    if (wordCount <= 8) return "calm";
    return "normal";
  }
  if (wpm < 110) return "slow";
  if (wpm < 145) return "calm";
  if (wpm < 185) return "normal";
  if (wpm < 230) return "fast";
  return "rushed";
}

function intensityFromEnergy(energy: number | null, text: string): VocalIntensity {
  if (energy == null) {
    if (/[!]{2,}/.test(text) || text === text.toUpperCase() && text.length > 12) return "loud";
    return "normal";
  }
  if (energy < 0.09) return "soft";
  if (energy >= 0.2) return "loud";
  return "normal";
}

function warmthOf(args: {
  laughter: boolean;
  smileCue: boolean;
  controlling: boolean;
  soothing: boolean;
  intensity: VocalIntensity;
}): VocalWarmth {
  if (args.controlling || args.intensity === "loud") return "cold";
  if (args.laughter || args.smileCue) return "smiling";
  if (args.soothing) return "warm";
  return "neutral";
}

/**
 * Trainee-Kanal: Tempo/Wärme/Druck aus seinem Text und optionaler Akustik.
 * durationMs/voicedMs sind seine Sprechzeit, nicht die Lücke der Figur und nicht heard_ms.
 */
export function extractVocal(
  text: string,
  acoustic?: AcousticSample | null,
  opts?: { interrupted?: boolean },
): VocalChannel {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMs = acoustic && acoustic.durationMs > 250 ? acoustic.durationMs : null;
  const voicedMs = acoustic?.voicedMs && acoustic.voicedMs > 200 ? acoustic.voicedMs : durationMs;
  const wpm =
    voicedMs && wordCount >= 3 ? Math.round(wordCount / (voicedMs / 60_000)) : null;
  const meanEnergy = acoustic ? acoustic.meanEnergy : null;
  const laughter = LAUGH.test(lower);
  const backchannel = BACKCHANNEL.test(trimmed);
  const smileCue = laughter || SMILE.test(lower);
  const controllingLanguage = CONTROL.test(lower);
  const soothingLanguage = SOOTHE.test(lower) || (backchannel && wordCount <= 4);
  const rate = backchannel ? "calm" : rateFromWpm(wpm, wordCount, trimmed.includes("?"));
  const intensity = intensityFromEnergy(meanEnergy, trimmed);

  return {
    rate,
    intensity,
    warmth: warmthOf({
      laughter,
      smileCue,
      controlling: controllingLanguage,
      soothing: soothingLanguage,
      intensity,
    }),
    laughter,
    backchannel,
    smileCue,
    overlapping: opts?.interrupted === true,
    controllingLanguage,
    soothingLanguage,
    wordsPerMinute: wpm,
    meanEnergy,
  };
}
