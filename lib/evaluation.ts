import { randomUUID } from "node:crypto";
import { DIMENSION_LABELS, rubric } from "@/lib/content/pack";
import { db, type SessionRow, type TurnRow } from "@/lib/db";
import type { VerticalId } from "@/lib/verticals";
import { evaluateSession } from "@/src/role-engine/roleEngine";
import type {
  CharacterState,
  Evaluation,
  Observation,
  RoleCharacter,
  RubricDimension,
  TranscriptTurn,
} from "@/src/role-engine/types";

/**
 * Auswertung mit vollem Kontext (Figur, gespeicherte Beobachtungen, Startzustand)
 * und Vergleich zur letzten Sitzung im selben Szenario.
 * Bewusst getrennt von lib/sessions.ts: dort läuft der Live-Pfad.
 */

function loadSession(id: string): SessionRow {
  const row = db().prepare("SELECT * FROM sessions WHERE id = ?").get(id) as SessionRow | undefined;
  if (!row) throw new Error("Sitzung nicht gefunden");
  return row;
}

function loadTurns(id: string): TurnRow[] {
  return db().prepare("SELECT * FROM turns WHERE session_id = ? ORDER BY seq ASC").all(id) as TurnRow[];
}

function storedObservations(rows: TurnRow[]): Map<string, Observation[]> {
  const map = new Map<string, Observation[]>();
  for (const row of rows) {
    if (row.speaker !== "trainee" || !row.observations_json) continue;
    try {
      map.set(row.id, JSON.parse(row.observations_json) as Observation[]);
    } catch {
      // defekte Zeile ignorieren — wird aus dem Wortlaut rekonstruiert
    }
  }
  return map;
}

/** Repeats contain the copied prefix: replay the complete transcript exactly once. */
export function initialStateForEvaluation(character: RoleCharacter): CharacterState {
  return character.initialState;
}

/** Endzustand der Sitzung — trägt hangupReason/hangupTrigger, wenn die Figur aufgelegt hat. */
function finalStateFor(row: SessionRow): CharacterState | undefined {
  try {
    return JSON.parse(row.state_json) as CharacterState;
  } catch {
    return undefined;
  }
}

/**
 * Bewertet eine beendete Sitzung und speichert das Ergebnis als jüngste Auswertung.
 * Einziger Auswertungspfad: wird direkt nach dem Auflegen (lib/sessions.ts) und beim
 * bewussten Neu-Bewerten (API) genutzt.
 */
export async function reevaluateSession(sessionId: string, signal?: AbortSignal): Promise<Evaluation> {
  const row = loadSession(sessionId);
  if (row.status !== "ended") throw new Error("Die Bewertung startet erst nach dem Auflegen.");
  const character = JSON.parse(row.character_json) as RoleCharacter;
  const rows = loadTurns(sessionId);
  const transcript: TranscriptTurn[] = rows
    .filter((r) => r.speaker !== "system")
    .map((r) => ({ id: r.id, speaker: r.speaker as TranscriptTurn["speaker"], text: r.text }));

  const { evaluation, mode } = await evaluateSession({
    scenarioId: row.scenario_id,
    publicBrief: character.publicBrief,
    acceptableOutcome: character.acceptableOutcome,
    rubricRule: rubric.rule,
    transcript,
    signal,
    focusId: row.focus_id,
    verticalId: (row.vertical_id || "immobilien") as VerticalId,
    character,
    storedObservations: storedObservations(rows),
    initialState: initialStateForEvaluation(character),
    finalState: finalStateFor(row),
  });
  db()
    .prepare("INSERT INTO evaluations (id, session_id, evaluation_json, created_at) VALUES (?, ?, ?, ?)")
    .run(randomUUID(), sessionId, JSON.stringify(evaluation), new Date().toISOString());
  db().prepare("UPDATE sessions SET engine_mode = ? WHERE id = ?").run(mode, sessionId);
  return evaluation;
}

export type DimensionDelta = {
  dimension: RubricDimension;
  label: string;
  before: number | null;
  after: number | null;
};

export type EvaluationComparison = {
  previousSessionId: string;
  previousCreatedAt: string;
  scenarioId: string;
  dimensions: DimensionDelta[];
  improved: string[];
  declined: string[];
  reading: string;
};

function latestEvaluation(sessionId: string): Evaluation | null {
  const row = db()
    .prepare("SELECT evaluation_json FROM evaluations WHERE session_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(sessionId) as { evaluation_json: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.evaluation_json) as Evaluation;
  } catch {
    return null;
  }
}

/**
 * Vergleich mit der zuletzt beendeten, bewerteten Sitzung im selben Szenario.
 * Nur Dimensionen, die in beiden Sitzungen eine Zahl haben, zählen als besser/schlechter —
 * N/A ist kein Rückschritt.
 */
export function compareWithPrevious(sessionId: string): EvaluationComparison | null {
  const current = loadSession(sessionId);
  const currentEval = latestEvaluation(sessionId);
  if (!currentEval) return null;
  const previous = db()
    .prepare(
      `SELECT s.* FROM sessions s
       WHERE s.scenario_id = ? AND s.status = 'ended' AND s.id != ? AND s.created_at < ?
         AND EXISTS (SELECT 1 FROM evaluations e WHERE e.session_id = s.id)
       ORDER BY s.created_at DESC LIMIT 1`,
    )
    .get(current.scenario_id, sessionId, current.created_at) as SessionRow | undefined;
  if (!previous) return null;
  const previousEval = latestEvaluation(previous.id);
  if (!previousEval) return null;
  // Nur Auswertungen derselben Generation vergleichen: alte Auswertungen ohne
  // Kalibrierung hatten weder Belegpflicht noch N/A-Regel — Zahlen wären Äpfel und Birnen.
  if (!previousEval.calibration || !currentEval.calibration) return null;

  const dimensions: DimensionDelta[] = (Object.keys(DIMENSION_LABELS) as RubricDimension[]).map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    before: previousEval.scores.find((s) => s.dimension === dimension)?.score ?? null,
    after: currentEval.scores.find((s) => s.dimension === dimension)?.score ?? null,
  }));
  const comparable = dimensions.filter((d) => d.before !== null && d.after !== null);
  const improved = comparable.filter((d) => (d.after ?? 0) > (d.before ?? 0)).map((d) => d.label);
  const declined = comparable.filter((d) => (d.after ?? 0) < (d.before ?? 0)).map((d) => d.label);

  let reading = "Gleiche Stelle wie zuletzt — vergleichen Sie den einen Hebel, nicht die Note.";
  if (comparable.length === 0) {
    reading = "Kein Score in beiden Sitzungen belegt — der Vergleich läuft über den Schlüsselmoment, nicht über Zahlen.";
  } else if (improved.length && !declined.length) {
    reading = `Belegt besser: ${improved.join(", ")}.`;
  } else if (improved.length) {
    reading = `Besser bei ${improved.join(", ")}; zurück bei ${declined.join(", ")}.`;
  } else if (declined.length) {
    reading = `Zurück bei ${declined.join(", ")}. Dieselbe Stelle noch einmal.`;
  }

  return {
    previousSessionId: previous.id,
    previousCreatedAt: previous.created_at,
    scenarioId: current.scenario_id,
    dimensions,
    improved,
    declined,
    reading,
  };
}
