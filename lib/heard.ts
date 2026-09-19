import type { Observation } from "@/src/role-engine/types";

export type HeardCue = {
  type: string;
  label: string;
  evidence: string;
};

const HEARD_LABELS: Record<string, string> = {
  introduced_self: "Sie haben sich vorgestellt",
  asked_specific_question: "Eine konkrete Frage",
  asked_generic_question: "Eine allgemeine Frage",
  generic_pitch: "Ein langer Pitch",
  referenced_previous_statement: "Bezug auf das Gesagte",
  acknowledged_concern: "Widerstand aufgenommen",
  ignored_boundary: "Grenze übergangen",
  created_pressure: "Druck im Satz",
  made_false_or_unverifiable_claim: "Unbelegte Aussage",
  unsupported_claim: "Unbelegte Aussage",
  interrupted_character: "Dazwischengegangen",
  respected_no: "Nein respektiert",
  continued_after_final_no: "Nach dem Nein weitergemacht",
  premature_concession: "Preis vor der Lage",
  premature_close: "Abschluss vor Vollmacht",
  clarified_decision_authority: "Nachgefragt, wer entscheidet",
  answered_direct_question: "Direkte Frage beantwortet",
};

export function heardFromRows(rows: { speaker: string; observations_json: string | null }[]): HeardCue[] {
  const seen = new Set<string>();
  const heard: HeardCue[] = [];
  for (const row of rows) {
    if (row.speaker !== "trainee" || !row.observations_json) continue;
    let list: Observation[] = [];
    try {
      list = JSON.parse(row.observations_json) as Observation[];
    } catch {
      continue;
    }
    for (const obs of list) {
      const label = HEARD_LABELS[obs.type];
      if (!label || seen.has(obs.type)) continue;
      seen.add(obs.type);
      heard.push({
        type: obs.type,
        label,
        evidence: obs.evidence.replace(/\s+/g, " ").trim().slice(0, 160),
      });
    }
  }
  return heard;
}
