import { playbooksForQuestion, type CoachPlaybook } from "@/lib/coach-canon";
import { salesPropertiesForQuestion } from "@/lib/sales-properties";
import { formatSpotlight, oneSentence } from "@/lib/spotlight";
import { VERTICALS } from "@/lib/verticals";
import type { SalesProperty } from "@/lib/sales-properties";

export type CoachReply = {
  text: string;
  engine: "openai" | "mock";
  cardIds: string[];
};

export function mockCoachReply(args: {
  question: string;
  publicContext?: string | null;
  properties?: SalesProperty[];
  playbooks?: CoachPlaybook[];
}): CoachReply {
  const catalog = args.properties?.length ? args.properties : VERTICALS.immobilien.salesProperties;
  const props = salesPropertiesForQuestion(args.question, catalog);
  const books = args.playbooks?.length ? args.playbooks : playbooksForQuestion(args.question);
  const book = books[0];
  if (/private_state|verdeckt|hidden|batna|was denkt sie wirklich/.test(args.question.toLowerCase())) {
    return {
      engine: "mock",
      cardIds: [],
      text: "Das sehe ich nicht. Verdeckte Motive einer Figur gehören nicht in den Coach — nur ins Gespräch, wenn sie sie selbst sagt. Fragen Sie zur öffentlichen Lage oder zu einer beendeten Sitzung.",
    };
  }
  if (args.publicContext) {
    const recapLine = args.publicContext.split("\n").find((line) => line.trim()) ?? "Beendetes Übungsgespräch.";
    const quoteMatch = args.publicContext.match(/Stelle:\s*„([^“]+)“/);
    const phraseMatch = args.publicContext.match(/Formulierung:\s*„([^“]+)“/);
    return {
      engine: "mock",
      cardIds: props.map((p) => p.id),
      text: formatSpotlight({
        recap: oneSentence(recapLine.replace(/[.!?]$/, "")),
        lever: props[0]?.coachUse ?? book?.goal ?? "Die Lage aus dem Briefing, nicht eine Closing-Karte.",
        quote: quoteMatch?.[1] ?? "",
        nextStep: oneSentence(props[0]?.coachUse ?? book?.do[0] ?? "Stellen Sie die eine offene Frage zur Lage."),
        phrase: phraseMatch?.[1],
      }),
    };
  }
  const lines = [
    `Engpass: ${book?.goal ?? "Die konkrete Lage zählt, nicht eine Closing-Technik."}`,
    `Grundlage: ${[book ? `${book.id} · ${book.title}` : null, ...props.map((p) => `${p.id} · ${p.label}`)].filter(Boolean).join("; ")}.`,
    `Eine nächste Handlung: ${book?.do[0] ?? props[0]?.coachUse ?? "Nur fragen, was in der Lage fehlt."}`,
    `Formulierung: „${book?.phrase ?? "Was genau umfasst das andere Angebot — und wer muss noch zustimmen?"}“`,
    "Unsicherheit: plausibel (Gesprächslage plus Vertriebseigenschaften, kein freigegebener Gesamtwissen-Snapshot).",
  ];
  return {
    engine: "mock",
    cardIds: [...props.map((p) => p.id), ...books.map((item) => item.id)],
    text: lines.join("\n\n"),
  };
}
