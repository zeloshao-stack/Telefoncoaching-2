/**
 * Stumme Weltgrenze für den Role Player (K07-4).
 * Kein sprechbarer REGELN-Fließtext — Text: nach der Modellausgabe im Code.
 * Live: derselbe Lock nur in der Werkzeugbeschreibung, nicht in der Sprechszene.
 */

/** Nicht-sprechbare Form — nicht als Vorlesetext in den Instructions. */
export const PLAYER_WORLD_LOCK =
  "World-bound: no invented buyers, prices, or third-party consent.";

const BUYERS =
  /\b((ich|wir)\s+habe[n]?\s+.{0,28}käufer|(ich|wir)\s+habe[n]?\s+.{0,28}interessenten|es gibt\s+.{0,20}käufer|käufer\s+(stehen|warten|sind da)|meine[n]?\s+\w*\s*käufer)\b/i;
const CONSENT =
  /\b(hat zugestimmt|ist einverstanden|hat eingewilligt|haben zugestimmt|zustimmung (der|des|von)|hat schon ja gesagt)\b/i;
const PRICE = /\b\d{1,3}(?:\.\d{3})*(?:,\d+)?\s*(?:euro|€)\b/gi;

export function utteranceInventedWorld(utterance: string, allowedBlob: string): boolean {
  const u = utterance.toLowerCase();
  const a = allowedBlob.toLowerCase();
  if (BUYERS.test(u) && !/käufer|interessent/.test(a)) return true;
  if (CONSENT.test(u) && !/zugestimmt|einverstanden|eingewilligt|zustimmung/.test(a)) return true;
  const prices = utterance.match(PRICE) ?? [];
  for (const raw of prices) {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) continue;
    if (!a.replace(/[^\d]/g, "").includes(digits) && !a.includes(digits)) return true;
  }
  return false;
}

/** Sachbearbeiter-Ton — stumm kappen, nicht als Vorleseverbot in die Szene. */
const CLERK =
  /\b(ich verstehe ihre bedenken|was darf ich für sie tun|wie kann ich ihnen helfen|vielen dank für ihre frage|haben sie ein konkretes anliegen|gerne erkläre ich|die nächsten schritte wären|ich bin hier,? um ihnen zu helfen)\b/i;

export function utteranceSoundsLikeClerk(utterance: string): boolean {
  return CLERK.test(utterance);
}

/** Erfindung oder Clerk-Ton → kurzes Mhm, kein Regelvortrag. */
export function clampPlayerUtterance(utterance: string, allowedBlob: string): string {
  if (utteranceInventedWorld(utterance, allowedBlob) || utteranceSoundsLikeClerk(utterance)) return "Mhm.";
  return utterance;
}
