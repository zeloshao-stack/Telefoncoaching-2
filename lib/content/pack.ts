import packJson from "@/data/Telefoncoaching-Testfaelle.json";
import type { CallGuide } from "@/lib/authored-types";

export const FROZEN_SCENARIO_IDS = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08"] as const;
export type FrozenScenarioId = (typeof FROZEN_SCENARIO_IDS)[number];

export const SCENARIO_VERSION = 1;

export type PackScenario = {
  id: string;
  title: string;
  synthetic: boolean;
  locale: string;
  public_brief: string;
  opening: string;
  private_state: Record<string, unknown>;
  hard_constraints: string[];
  knowledge_card_ids: string[];
  acceptable_outcome: string;
  adaptive_social_behavior: string;
  situation?: string;
  guide?: CallGuide;
};

export type KnowledgeCard = {
  id: string;
  title: string;
  source_ids: string[];
  application: string;
  contraindication: string;
  evidence_scope: string;
  observable: string;
};

type Pack = {
  format_version: string;
  created_at: string;
  status: string;
  knowledge_cards: KnowledgeCard[];
  rubric: {
    range: [number, number];
    abstain_value: null;
    dimensions: string[];
    rule: string;
  };
  scenarios: PackScenario[];
};

const pack = packJson as unknown as Pack;

export const knowledgeCards = pack.knowledge_cards;
export const rubric = pack.rubric;

export const frozenScenarios = pack.scenarios.filter((s) =>
  FROZEN_SCENARIO_IDS.includes(s.id as FrozenScenarioId),
) as PackScenario[];

export function getScenario(id: string): PackScenario | undefined {
  return frozenScenarios.find((s) => s.id === id);
}

export function cardsFor(ids: string[]): KnowledgeCard[] {
  return knowledgeCards.filter((c) => ids.includes(c.id));
}

export const DIMENSION_LABELS: Record<string, string> = {
  diagnosis: "Diagnose",
  truthfulness: "Wahrhaftigkeit",
  decision_process: "Entscheidungsprozess",
  contextual_fit: "Passung zum Kontext",
  commercial_judgment: "Kaufmännisches Urteil",
  next_step: "Nächster Schritt",
};

export const SCENARIO_BLURBS: Record<FrozenScenarioId, string> = {
  S01: "Zwei Honorare liegen auf dem Tisch. Die 12.000 Euro Unterschied müssen Sie erklären — nicht Ihre Firma.",
  S02: "Ein klares Nein zu Verkauf und Rückruf. Hier prüfen Sie, ob Sie aufhören können.",
  S03: "Einer am Apparat ist interessiert. Die Schwester ist nicht da — und ohne sie gibt es keinen Auftrag.",
  S04: "Kalt in der Hausverwaltung. Eine Floskel, und die Leitung ist tot.",
  S05: "Das Dach muss her. Die Mehrheit in der Eigentümergemeinschaft fehlt.",
  S06: "Mietrechtliche Frage am Apparat. Sie sind Makler, nicht Anwalt.",
  S07: "Das Ja zur Vollmacht steht im Raum — und eine letzte Sorge davor.",
  S08: "Die Bestandskundin verkauft nichts. Sie hat eine Empfehlung, keinen neuen Auftrag.",
};

export const SCENARIO_COUNTERPARTS: Record<FrozenScenarioId, string> = {
  S01: "Elisabeth Leitner · Zinshaus, Alsergrund",
  S02: "Franz Berger · Eigentum, Ottakring",
  S03: "Andreas Huber · Miteigentum, Währing",
  S04: "Monika Felber · Hausverwaltung, Hernals",
  S05: "Robert Stöger · Wohnungseigentum, Josefstadt",
  S06: "Helene Prinz · Zinshaus, Neubau",
  S07: "Ingrid Wallner · Auftrag nahe, Landstraße",
  S08: "Sabine Moser · Bestand, Wieden",
};
