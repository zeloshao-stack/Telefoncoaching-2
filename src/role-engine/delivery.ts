import type { CharacterAffect, CharacterState, RoleCharacter } from "./types";
import { voiceStateFrom, voiceStateFromAffect, type VoiceState } from "./voiceState";

/**
 * Hume-/Octave-Regie im Mundtext: nicht sprechen, nicht nachschneiden.
 * Ersetzt nichts durch eine erfundene Pause.
 */
const STAGE_DIRECTION =
  /\[(?:pause|long[-\s]?pause|sighs?|exhales?|laughs?|breath|chuckles?)\]|\*(?:seufz|lacht|pause|atmet aus)\*|<\/?break\b[^>]*>/gi;

export function committedSpokenText(text: string): string {
  return text.replace(STAGE_DIRECTION, " ").replace(/\s+/g, " ").trim();
}

export function hasStageDirection(text: string): boolean {
  const match = new RegExp(STAGE_DIRECTION.source, STAGE_DIRECTION.flags).test(text);
  return match;
}

/**
 * Voice State → Sprechanweisung: ein bis zwei Sätze, die in Instructions passen.
 * Beschreibt Tempo, Kürze, Wärme — keine Zahlen, keine Prozessnamen, keine Rubrik.
 * Kein [pause]/[sighs], kein Hume-Mitnehmen der Anrufer-Wärme.
 */
export function deliveryFromVoice(voice: VoiceState): string {
  if (voice.contourClass === "reonset") {
    return "Neuer Einsatz, dieselbe Person. Nicht die alte Melodie weiterziehen. Pausen nur an der Satzgrenze.";
  }
  if (voice.contourClass === "released") {
    return "Knapp, kühl, du willst weg. Ein Satz, kaum Melodie, keine Rückfrage — die Stille nicht füllen.";
  }
  if (voice.pauseProfile === "resistant" || voice.contourClass === "held") {
    if (voice.speechRate >= 0.2) {
      return "Gereizt, schneller. Kurz angebunden, trocken, gern ein bisschen spitz — aber nicht laut.";
    }
    return "Getroffen. Gehalten, wenig Melodie. Den Schlitz nicht füllen, kein Füllsel, eine Spur förmlicher.";
  }
  if (voice.pauseProfile === "hesitant") {
    return "Leiser und langsamer. Du zögerst an der Satzgrenze, suchst die Worte. Kein Druck in der Stimme, keine Eile.";
  }
  if (voice.pauseProfile === "reflective") {
    return "Du bleibst ruhiger: langsamer, leiser, etwas Wärme. Pausen an der Satzgrenze. Kein Service-Lächeln.";
  }
  if (voice.valence >= 0.15 && voice.arousal <= 0.55) {
    return voice.speechRate > 0.05
      ? "Zugänglicher, etwas schneller — ohne Süße, ohne den Ton des Anrufers zu kopieren."
      : "Wärmer, Tempo bleibt ruhig. Du bleibst diese Person, kein Service-Ton.";
  }
  if (voice.speechRate <= -0.2 && voice.intensity <= -0.15) {
    return "Ruhig, gleichmäßig, eher leise. Du denkst kurz nach, bevor du antwortest.";
  }
  if (voice.valence < -0.1 && voice.speechRate < 0.2) {
    return "Trocken, gehalten, wenig Melodie. Du glaubst nicht alles, das hört man.";
  }
  if (voice.speechRate >= 0.2) {
    return "Knapp und etwas schneller. Du hast anderes zu tun, das darf man hören.";
  }
  if (voice.valence > 0.05) {
    return "Freundlich, ruhig, mit etwas Wärme — ohne Süße, ohne Verkaufston.";
  }
  return "Telefonstimme dieser Person, nüchtern. Nicht Tempo und Wärme des Anrufers übernehmen.";
}

export function deliveryInstruction(affect: CharacterAffect): string {
  return deliveryFromVoice(voiceStateFromAffect(affect));
}

/** Bequemer Einstieg aus dem Zustand heraus. */
export function deliveryFor(character: RoleCharacter, state: CharacterState, previous?: VoiceState): string {
  return deliveryFromVoice(voiceStateFrom(character, state, previous));
}
