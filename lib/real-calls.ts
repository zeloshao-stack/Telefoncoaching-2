import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { mergeWhisperSegments, parseTranscriptText } from "@/lib/call-ingest";
import { transcribeWithWhisper } from "@/lib/whisper";
import { analyzeCall, type CallAnalytics } from "@/lib/call-analytics";
import { findMoments, type CallMoment } from "@/lib/moments";
import type { VerticalId } from "@/lib/verticals";
import type { TranscriptTurn } from "@/src/role-engine/types";

export type RealCallRow = {
  id: string;
  title: string;
  counterpart_name: string;
  vertical_id: string;
  source: string;
  turns_json: string;
  consented: number;
  created_at: string;
};

export type RealCallDTO = {
  id: string;
  title: string;
  counterpartName: string;
  verticalId: VerticalId;
  source: "text" | "audio";
  turns: TranscriptTurn[];
  createdAt: string;
  analytics: CallAnalytics;
  moments: CallMoment[];
  /** Übungen, die aus diesem Gespräch gestartet wurden */
  practiced: { sessionId: string; momentTurnId: string | null; status: string; createdAt: string }[];
};

function ensureTable() {
  db().exec(`
    CREATE TABLE IF NOT EXISTS real_calls (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      counterpart_name TEXT NOT NULL,
      vertical_id TEXT NOT NULL,
      source TEXT NOT NULL,
      turns_json TEXT NOT NULL,
      consented INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function realScenarioId(callId: string) {
  return `real-${callId}`;
}

export function callIdFromScenario(scenarioId: string): string | null {
  return scenarioId.startsWith("real-") ? scenarioId.slice(5) : null;
}

function toDto(row: RealCallRow): RealCallDTO {
  const turns = JSON.parse(row.turns_json) as TranscriptTurn[];
  const practiced = db()
    .prepare("SELECT id, repeat_from_turn_id, status, created_at FROM sessions WHERE scenario_id = ? ORDER BY created_at DESC")
    .all(realScenarioId(row.id)) as { id: string; repeat_from_turn_id: string | null; status: string; created_at: string }[];
  return {
    id: row.id,
    title: row.title,
    counterpartName: row.counterpart_name,
    verticalId: row.vertical_id as VerticalId,
    source: row.source === "audio" ? "audio" : "text",
    turns,
    createdAt: row.created_at,
    analytics: analyzeCall(turns),
    moments: findMoments(turns),
    practiced: practiced.map((p) => ({
      sessionId: p.id,
      momentTurnId: p.repeat_from_turn_id,
      status: p.status,
      createdAt: p.created_at,
    })),
  };
}

function requireConsent(consented: boolean) {
  if (!consented) {
    throw new Error("Bitte bestätigen, dass die Gegenseite weiß, dass dieses Gespräch fürs Training ausgewertet wird.");
  }
}

function persist(input: {
  title: string;
  counterpartName: string;
  verticalId: VerticalId;
  source: "text" | "audio";
  turns: TranscriptTurn[];
}) {
  ensureTable();
  const trainee = input.turns.filter((t) => t.speaker === "trainee").length;
  const counterpart = input.turns.filter((t) => t.speaker === "counterpart").length;
  if (trainee === 0 || counterpart === 0) {
    throw new Error("Im Transkript fehlt eine Seite. Zeilen bitte mit „Ich:“ und „Kunde:“ (oder dem Namen) beginnen.");
  }
  const id = randomUUID();
  const name = input.counterpartName.trim() || "Gegenseite";
  const title = input.title.trim() || `Gespräch mit ${name}`;
  db()
    .prepare(
      `INSERT INTO real_calls (id, title, counterpart_name, vertical_id, source, turns_json, consented, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    )
    .run(id, title, name, input.verticalId, input.source, JSON.stringify(input.turns), new Date().toISOString());
  return getRealCall(id);
}

export function saveRealCallFromText(input: {
  title?: string;
  counterpartName?: string;
  verticalId: VerticalId;
  transcript: string;
  consented: boolean;
}) {
  requireConsent(input.consented);
  const parsed = parseTranscriptText(input.transcript || "", input.counterpartName || "");
  if (parsed.length < 2) throw new Error("Das Transkript ist zu kurz. Mindestens zwei Züge.");
  return persist({
    title: input.title || "",
    counterpartName: input.counterpartName || "",
    verticalId: input.verticalId,
    source: "text",
    turns: parsed,
  });
}

export async function saveRealCallFromAudio(input: {
  title?: string;
  counterpartName?: string;
  verticalId: VerticalId;
  audio: Buffer;
  mime: string;
  consented: boolean;
}) {
  requireConsent(input.consented);
  if (input.audio.length < 8_000) throw new Error("Aufnahme zu kurz.");
  if (input.audio.length > 24_000_000) throw new Error("Datei zu groß (max. ca. 25 MB).");
  const { segments: raw } = await transcribeWithWhisper(input.audio, input.mime, "gespraech");
  const segments = mergeWhisperSegments(raw);
  if (!segments.length) throw new Error("Kein Transkript. Die Aufnahme ist zu leise oder zu kurz.");
  // Sprecher: Vorschlag aus dem Text, Unbekanntes hängt am Vorgänger, Start bei der Gegenseite
  const turns: TranscriptTurn[] = [];
  for (const segment of segments) {
    const last = turns[turns.length - 1];
    const speaker: TranscriptTurn["speaker"] =
      segment.suggested === "unknown" ? (last?.speaker ?? "counterpart") : segment.suggested;
    if (last && last.speaker === speaker) {
      last.text = `${last.text} ${segment.text}`;
    } else {
      turns.push({ id: `r${turns.length + 1}`, speaker, text: segment.text });
    }
  }
  return persist({
    title: input.title || "",
    counterpartName: input.counterpartName || "",
    verticalId: input.verticalId,
    source: "audio",
    turns,
  });
}

export function updateRealCallTurns(id: string, turns: TranscriptTurn[]) {
  ensureTable();
  const cleaned = turns
    .filter((t) => t.speaker === "trainee" || t.speaker === "counterpart")
    .map((t, i) => ({ id: t.id || `r${i + 1}`, speaker: t.speaker, text: t.text.trim() }))
    .filter((t) => t.text);
  db().prepare("UPDATE real_calls SET turns_json = ? WHERE id = ?").run(JSON.stringify(cleaned), id);
  return getRealCall(id);
}

export function getRealCall(id: string): RealCallDTO {
  ensureTable();
  const row = db().prepare("SELECT * FROM real_calls WHERE id = ?").get(id) as RealCallRow | undefined;
  if (!row) throw new Error("Gespräch nicht gefunden.");
  return toDto(row);
}

export function listRealCalls(verticalId?: VerticalId, limit = 40): RealCallDTO[] {
  ensureTable();
  const rows = (
    verticalId
      ? db().prepare("SELECT * FROM real_calls WHERE vertical_id = ? ORDER BY created_at DESC LIMIT ?").all(verticalId, limit)
      : db().prepare("SELECT * FROM real_calls ORDER BY created_at DESC LIMIT ?").all(limit)
  ) as RealCallRow[];
  return rows.map(toDto);
}

export function deleteRealCall(id: string) {
  ensureTable();
  db().prepare("DELETE FROM real_calls WHERE id = ?").run(id);
}
