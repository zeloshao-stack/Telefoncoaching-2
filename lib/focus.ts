import type { RubricDimension } from "@/src/role-engine/types";
import type { VerticalId } from "@/lib/verticals";

export const FOCUS_IDS = ["diagnosis", "authority", "truth", "boundary"] as const;
export type FocusId = (typeof FOCUS_IDS)[number];

export type CallFocus = {
  id: FocusId;
  label: string;
  hint: string;
  nextStep: string;
  dimension: RubricDimension;
};

const IMMOBILIEN: CallFocus[] = [
  {
    id: "diagnosis",
    label: "Lage zuerst",
    hint: "Eine konkrete Lücke klären, bevor Preis oder Auftrag fällt.",
    nextStep: "Fragen Sie nach dem, was im Briefing fehlt — nicht nach dem Auftrag.",
    dimension: "diagnosis",
  },
  {
    id: "authority",
    label: "Wer entscheidet",
    hint: "Interesse einer Person ist keine Vollmacht.",
    nextStep: "Fragen Sie, wer außer der Person am Apparat zustimmen muss.",
    dimension: "decision_process",
  },
  {
    id: "truth",
    label: "Nur Belege",
    hint: "Keine Käufer, keine Zahlen, die der Fall nicht hergibt.",
    nextStep: "Nennen Sie nur, was gesagt oder im Briefing steht.",
    dimension: "truthfulness",
  },
  {
    id: "boundary",
    label: "Grenze halten",
    hint: "Ein klares Nein ist ein Erfolg, kein Misserfolg.",
    nextStep: "Respektieren Sie ein klares Nein und legen Sie auf.",
    dimension: "contextual_fit",
  },
];

const VERSICHERUNG: CallFocus[] = [
  {
    id: "diagnosis",
    label: "Bedarf zuerst",
    hint: "Wofür zahlt sie — bevor ein Produkt fällt.",
    nextStep: "Fragen Sie, wofür die Prämie steigt und was abgesichert sein soll.",
    dimension: "diagnosis",
  },
  {
    id: "authority",
    label: "Wer entscheidet",
    hint: "Partner nicht am Apparat ist keine Vollmacht.",
    nextStep: "Fragen Sie, wer außer der Person am Apparat zustimmen muss.",
    dimension: "decision_process",
  },
  {
    id: "truth",
    label: "Nur belegte Leistungen",
    hint: "Keine erfundenen Deckungen oder Rabatte.",
    nextStep: "Nennen Sie nur Leistungen, die gesagt oder im Briefing stehen.",
    dimension: "truthfulness",
  },
  {
    id: "boundary",
    label: "Grenze halten",
    hint: "Kündigungswunsch ernst nehmen, nicht umdeuten.",
    nextStep: "Nehmen Sie einen klaren Wunsch wörtlich und vereinbaren Sie genau einen nächsten Schritt.",
    dimension: "contextual_fit",
  },
];

const FINANZIERUNG: CallFocus[] = [
  {
    id: "diagnosis",
    label: "Tragbarkeit zuerst",
    hint: "Einkommen und Lasten vor der Rate.",
    nextStep: "Fragen Sie nach Tragbarkeit, bevor Sie eine Zahl in den Raum stellen.",
    dimension: "diagnosis",
  },
  {
    id: "authority",
    label: "Wer unterschreibt",
    hint: "Eine Person am Apparat zeichnet nicht allein.",
    nextStep: "Fragen Sie, wer außer der Person am Apparat unterschreiben muss.",
    dimension: "decision_process",
  },
  {
    id: "truth",
    label: "Keine Werberate",
    hint: "Keine Bankzusage, die der Fall nicht hergibt.",
    nextStep: "Nennen Sie nur Zahlen, die gesagt oder im Briefing stehen.",
    dimension: "truthfulness",
  },
  {
    id: "boundary",
    label: "Grenze halten",
    hint: "Kein Druck, wenn die Lage unklar bleibt.",
    nextStep: "Ohne geklärte Tragbarkeit legen Sie keinen Abschluss nahe.",
    dimension: "contextual_fit",
  },
];

const HAUSVERWALTUNG: CallFocus[] = [
  {
    id: "diagnosis",
    label: "Sachverhalt zuerst",
    hint: "Was ist wann passiert — bevor eine Zusage fällt.",
    nextStep: "Fragen Sie nach dem konkreten Vorfall und dem bisherigen Stand.",
    dimension: "diagnosis",
  },
  {
    id: "authority",
    label: "Wer beauftragt",
    hint: "Nicht jede meldende Person darf den nächsten Schritt auslösen.",
    nextStep: "Fragen Sie, wer den Auftrag oder die Freigabe erteilen darf.",
    dimension: "decision_process",
  },
  {
    id: "truth",
    label: "Keine Sofortzusage",
    hint: "Keine rechtliche oder technische Aussage ohne Prüfung.",
    nextStep: "Nennen Sie nur, was belegt ist, und einen Prüfzeitpunkt für den Rest.",
    dimension: "truthfulness",
  },
  {
    id: "boundary",
    label: "Deeskalation",
    hint: "Kein Verkaufsdruck, keine Schuldzuweisung.",
    nextStep: "Halten Sie Sachverhalt, nächsten Schritt und Zeitpunkt fest — dann auflegen.",
    dimension: "contextual_fit",
  },
];

const BY_VERTICAL: Record<VerticalId, CallFocus[]> = {
  immobilien: IMMOBILIEN,
  versicherung: VERSICHERUNG,
  hausverwaltung: HAUSVERWALTUNG,
  finanzierung: FINANZIERUNG,
};

export function isFocusId(value: string | null | undefined): value is FocusId {
  return !!value && (FOCUS_IDS as readonly string[]).includes(value);
}

export function focusesForVertical(verticalId: VerticalId): CallFocus[] {
  return BY_VERTICAL[verticalId] ?? IMMOBILIEN;
}

export function defaultFocusForScenario(scenarioId: string, verticalId: VerticalId): FocusId {
  if (scenarioId === "S02" || scenarioId === "S04" || scenarioId === "S08") return "boundary";
  if (scenarioId === "S03" || scenarioId === "S05" || scenarioId === "V01" || scenarioId === "F01") {
    return "authority";
  }
  if (scenarioId === "S06") return "truth";
  if (
    scenarioId === "S01" ||
    scenarioId === "S07" ||
    scenarioId === "V02" ||
    scenarioId === "F02" ||
    scenarioId === "A01"
  ) {
    return "diagnosis";
  }
  return focusesForVertical(verticalId)[0]?.id ?? "diagnosis";
}

export function getFocus(verticalId: VerticalId, focusId?: string | null): CallFocus {
  const list = focusesForVertical(verticalId);
  return list.find((item) => item.id === focusId) ?? list[0]!;
}
