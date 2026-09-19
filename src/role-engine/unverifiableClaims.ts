import type { TranscriptTurn } from "./types";

/**
 * Unbelegte Pitch-/Druck-Aussagen: für Wahrhaftigkeit und Beobachtungen.
 * Deterministisch — der Guard deckelt Scores, unabhängig vom Modellurteil.
 */

export type UnverifiableClaimKind =
  | "superlative_or_market"
  | "invented_fact"
  | "pressure_scarcity"
  | "marketing_hype";

export type UnverifiableClaimHit = {
  turnId: string;
  text: string;
  kind: UnverifiableClaimKind;
};

const PATTERNS: { kind: UnverifiableClaimKind; re: RegExp }[] = [
  {
    kind: "superlative_or_market",
    re: /\b(größte[snr]?|größtes)\s+(makler|anbieter|haus|unternehmen|vermittl)/i,
  },
  {
    kind: "superlative_or_market",
    re: /\b(marktführ\w*|nummer\s*(1|eins)|führende[snr]?\s+(makler|anbieter))\b/i,
  },
  {
    kind: "marketing_hype",
    re: /\b(einzigartig\w*|toll\w*\s+referenzen|viele[n]?\s+zufriedene[n]?\s+kunden|kunden\s+sind\s+begeistert|großes?\s+maklerhaus)\b/i,
  },
  {
    kind: "invented_fact",
    re: /\b(käufer\b|fixen\b|garant\w*|sicher.*(erlös|honorar)|meine drei|deckung zu 100|bank sagt zu|werberate)\b/i,
  },
  {
    kind: "pressure_scarcity",
    re: /\b(letzte\s+chance|sofort\s+abschlie\w*|müssen\s+sie\s+(sich\s+)?unbedingt|jetzt\s+oder\s+nie|nur\s+noch\s+heute)\b/i,
  },
];

const KIND_LABEL: Record<UnverifiableClaimKind, string> = {
  superlative_or_market: "Superlativ oder Marktführer-Claim ohne Beleg",
  invented_fact: "erfundene oder unbelegte Sachaussage",
  pressure_scarcity: "Druck- oder Verknappungsfloskel",
  marketing_hype: "Marketing-Behauptung ohne Beleg",
};

export function detectUnverifiableClaim(text: string): UnverifiableClaimKind | null {
  const lower = text.toLowerCase();
  for (const { kind, re } of PATTERNS) {
    if (re.test(lower)) return kind;
  }
  return null;
}

export function findUnverifiableClaimTurns(transcript: TranscriptTurn[]): UnverifiableClaimHit[] {
  const hits: UnverifiableClaimHit[] = [];
  for (const turn of transcript) {
    if (turn.speaker !== "trainee") continue;
    const kind = detectUnverifiableClaim(turn.text);
    if (!kind) continue;
    hits.push({ turnId: turn.id, text: turn.text.trim(), kind });
  }
  return hits;
}

export function claimKindLabel(kind: UnverifiableClaimKind): string {
  return KIND_LABEL[kind];
}

/** Wahrhaftigkeit bei Treffer: höchstens 0 (unter Note 2). */
export const TRUTHFULNESS_CLAIM_MAX_SCORE = 0;
