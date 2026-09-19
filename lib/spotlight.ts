export function oneSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const fallback = "Stellen Sie als Nächstes eine konkrete Frage zur Lage, die im Briefing fehlt.";
  if (!cleaned) return fallback;
  const parts = cleaned.split(/(?<=[.!?…])\s+/).map((part) => part.trim()).filter(Boolean);
  const useful =
    parts.find((part) => part.length > 12 && !/^(gut|ok|okay|ja)[.!?…]*$/i.test(part)) ??
    parts[parts.length - 1] ??
    cleaned;
  const sentence = useful.trim();
  if (!sentence) return fallback;
  return /[.!?…]$/.test(sentence) ? sentence : `${sentence}.`;
}

export type Spotlight = {
  recap: string;
  lever: string;
  quote: string;
  nextStep: string;
  /** Talk-Track nach Auflegen — fehlt in älteren Threads. */
  phrase?: string;
};

export function spotlightFromEvaluation(
  ev: {
    summary: string;
    strength: string;
    correction: string;
    nextStep?: string | null;
  },
  quote = "",
): Spotlight {
  return {
    recap: ev.summary.trim(),
    lever: ev.strength.trim(),
    quote: quote.trim(),
    nextStep: (ev.nextStep?.trim() || oneSentence(ev.correction)).trim(),
  };
}

export function formatSpotlight(spotlight: Spotlight): string {
  const quote = spotlight.quote ? `\n„${spotlight.quote}“` : "";
  const phrase = spotlight.phrase?.trim() ? `\n\nFormulierung\n„${spotlight.phrase.trim()}“` : "";
  return `Recap\n${spotlight.recap}\n\nHebel${quote}\n${spotlight.lever}\n\nNext Step\n${spotlight.nextStep}${phrase}`;
}

export function parseSpotlight(text: string): Spotlight | null {
  const match = text
    .trim()
    .match(
      /^Recap\n([\s\S]+?)\n\nHebel(?:\n„([\s\S]+?)“)?\n([\s\S]+?)\n\nNext Step\n([\s\S]+?)(?:\n\nFormulierung\n„([\s\S]+?)“)?$/,
    );
  if (!match) return null;
  const parsed: Spotlight = {
    recap: match[1].trim(),
    quote: match[2]?.trim() ?? "",
    lever: match[3].trim(),
    nextStep: match[4].trim(),
  };
  const phrase = match[5]?.trim();
  return phrase ? { ...parsed, phrase } : parsed;
}
