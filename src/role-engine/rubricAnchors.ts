import type { RubricDimension } from "./types";

export type RubricAnchor = {
  label: string;
  /** Was zählt — nur beobachtbares Verhalten des Trainees */
  observes: string;
  score0: string;
  score2: string;
  score4: string;
  /** Wann N/A statt einer Zahl */
  abstain: string;
};

export const RUBRIC_DIMENSIONS: RubricDimension[] = [
  "diagnosis",
  "truthfulness",
  "decision_process",
  "contextual_fit",
  "commercial_judgment",
  "next_step",
];

/**
 * Verhaltensanker 0–4 für die sechs Dimensionen. Sie gelten branchenübergreifend;
 * die Szenarien liefern, welche Lage konkret fehlt (Umfang, Wille, Bedarf, Tragbarkeit).
 */
export const RUBRIC_ANCHORS: Record<RubricDimension, RubricAnchor> = {
  diagnosis: {
    label: "Diagnose",
    observes: "Wird die Information erfragt, die im Briefing fehlt — bevor Preis, Produkt oder Auftrag fallen?",
    score0: "Argumentiert oder schließt, ohne eine einzige Frage zur Lage.",
    score2: "Allgemeine Frage; die konkrete Lücke (Umfang, Wille, Bedarf, Tragbarkeit) bleibt offen.",
    score4: "Konkrete Frage genau zur fehlenden Information, vor jeder Preis- oder Produktbewegung.",
    abstain: "Kein klarer eigener Beitrag, oder die Gegenseite hat sofort und endgültig abgelehnt.",
  },
  truthfulness: {
    label: "Wahrhaftigkeit",
    observes: "Enthält eine Sachaussage des Trainees nur Belegtes? Erfundene Käufer, Zahlen, Zusagen, Deckungen, Superlative, Marktführer-Claims?",
    score0:
      "Erfundene Käufer, Marktpreise, Bankzusagen, Deckungen; Superlative („größtes Maklerhaus“); Marktführer-Claims; Druck-Verknappung („letzte Chance“) ohne Beleg.",
    score2:
      "Vage Andeutung ohne Beleg („das geht sich sicher aus“) — aber kein Superlativ, kein Marktführer-Claim und keine Verknappungsfloskel (die zählen als 0).",
    score4: "Nur Belegtes aus Briefing oder Gespräch; Unsicheres als unsicher benannt.",
    abstain:
      "Der Trainee hat keine Sachaussage gemacht (nur Fragen, Bestätigungen, Verabschiedung). Ehrlichkeit über den eigenen Gesprächsverlauf ist KEIN Beleg.",
  },
  decision_process: {
    label: "Entscheidungsprozess",
    observes: "Wird geklärt, wer außer der Person am Apparat zustimmen muss — statt Alleinvollmacht zu unterstellen?",
    score0: "Abschluss oder Zusage ohne die Person, die mitentscheidet oder mitunterschreibt.",
    score2: "Mitentscheider wird erwähnt, aber nicht gefragt, wie entschieden wird.",
    score4: "Fragt, wer zustimmen muss und wie die Beteiligten entscheiden; nächster Schritt gemeinsam.",
    abstain: "Alleinentscheidung laut Briefing und kein Abschlussversuch — oder kein klarer eigener Beitrag.",
  },
  contextual_fit: {
    label: "Passung zum Kontext",
    observes: "Greift die Antwort wörtlich auf, was die Gegenseite gerade gesagt hat — statt Skript oder Druck?",
    score0: "Pitch oder Druck gegen ein klares Nein oder eine geäußerte Grenze.",
    score2: "Reagiert, aber allgemein; das Gesagte wird nicht aufgenommen.",
    score4: "Nimmt die Aussage der Gegenseite wörtlich auf und antwortet genau darauf.",
    abstain: "Kein klarer eigener Beitrag.",
  },
  commercial_judgment: {
    label: "Kaufmännisches Urteil",
    observes: "Bleibt Preis oder Produkt offen, bis die Lage klar ist? Wird ein begründetes Nein als zulässiges Ergebnis akzeptiert?",
    score0: "Konzession oder Preisbewegung, bevor der Leistungsumfang oder der Bedarf klar war.",
    score2: "Preis wird verteidigt, ohne dass der Nutzen oder der Vergleich geklärt ist.",
    score4: "Preis offen gehalten bis der Umfang steht — oder ein begründetes Nein sauber angenommen.",
    abstain: "Preis, Produkt oder Auftrag kamen im Gespräch nicht vor.",
  },
  next_step: {
    label: "Nächster Schritt",
    observes: "Steht am Ende ein konkreter Schritt mit Zeitpunkt und Person — oder ein sauberes Ende?",
    score0: "Schritt gegen die geäußerte Grenze (Rückruf nach klarem Nein) oder erfundene Zusage.",
    score2: "Vage („ich melde mich“), ohne Zeitpunkt, Person oder Zweck.",
    score4: "Ein konkreter, passender Schritt — oder ein respektvolles, ausgesprochenes Ende.",
    abstain: "Das Gespräch endete, bevor ein Schritt möglich war; kein Abschlussversuch, kein Angebot eines Schritts.",
  },
};

export function anchorsForPrompt(): string {
  return RUBRIC_DIMENSIONS.map((dim) => {
    const a = RUBRIC_ANCHORS[dim];
    return `${dim} (${a.label}) — ${a.observes}\n  0: ${a.score0}\n  2: ${a.score2}\n  4: ${a.score4}\n  N/A: ${a.abstain}`;
  }).join("\n");
}
