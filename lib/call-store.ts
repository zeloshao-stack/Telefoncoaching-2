import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { mergeWhisperSegments, type CallSegment } from "@/lib/call-ingest";
import { transcribeWithWhisper } from "@/lib/whisper";

const CALL_DIR = path.join(process.cwd(), "data", "voices", "calls");

export type CallRow = {
  id: string;
  counterpart_name: string;
  consented_recording: number;
  consented_clone: number;
  consented_synthetic: number;
  audio_path: string;
  mime: string;
  segments_json: string;
  created_at: string;
};

function ensureTable() {
  db().exec(`
    CREATE TABLE IF NOT EXISTS call_recordings (
      id TEXT PRIMARY KEY,
      counterpart_name TEXT NOT NULL,
      consented_recording INTEGER NOT NULL,
      consented_clone INTEGER NOT NULL,
      consented_synthetic INTEGER NOT NULL,
      audio_path TEXT NOT NULL,
      mime TEXT NOT NULL,
      segments_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function requireCallConsents(input: {
  consentedRecording?: boolean;
  consentedClone?: boolean;
  consentedSynthetic?: boolean;
}) {
  if (!input.consentedRecording || !input.consentedClone || !input.consentedSynthetic) {
    throw new Error(
      "Es braucht drei Einwilligungen der Gegenseite: Aufnahme, Stimme klonen, synthetisches Sprechen im Training.",
    );
  }
}

async function transcribeGerman(audio: Buffer, mime: string, filename: string): Promise<CallSegment[]> {
  const { segments: raw } = await transcribeWithWhisper(audio, mime, filename);
  const segments = mergeWhisperSegments(raw);
  if (!segments.length) {
    throw new Error("Kein Transkript. Die Aufnahme ist zu leise oder zu kurz.");
  }
  return segments;
}

export async function ingestCall(input: {
  counterpartName: string;
  consentedRecording: boolean;
  consentedClone: boolean;
  consentedSynthetic: boolean;
  audio: Buffer;
  mime: string;
}): Promise<{ id: string; counterpartName: string; segments: CallSegment[] }> {
  requireCallConsents(input);
  const name = input.counterpartName.trim();
  if (name.length < 2) throw new Error("Name der Gegenseite fehlt.");
  if (input.audio.length < 8_000) throw new Error("Aufnahme zu kurz.");
  if (input.audio.length > 24_000_000) throw new Error("Datei zu groß (max. ca. 25 MB).");

  ensureTable();
  fs.mkdirSync(CALL_DIR, { recursive: true });
  const segments = await transcribeGerman(input.audio, input.mime, "gespraech");
  const id = randomUUID();
  const ext = input.mime.includes("mpeg") || input.mime.includes("mp3") ? "mp3" : input.mime.includes("wav") ? "wav" : "webm";
  const audioPath = path.join(CALL_DIR, `${id}.${ext}`);
  fs.writeFileSync(audioPath, input.audio);
  db()
    .prepare(
      `INSERT INTO call_recordings (
        id, counterpart_name, consented_recording, consented_clone, consented_synthetic, audio_path, mime, segments_json, created_at
      ) VALUES (?, ?, 1, 1, 1, ?, ?, ?, ?)`,
    )
    .run(id, name, audioPath, input.mime, JSON.stringify(segments), new Date().toISOString());
  return { id, counterpartName: name, segments };
}

export function getCall(id: string): CallRow {
  ensureTable();
  const row = db().prepare("SELECT * FROM call_recordings WHERE id = ?").get(id) as CallRow | undefined;
  if (!row) throw new Error("Gespräch nicht gefunden.");
  return row;
}

export function assertCallAllowsClone(id: string) {
  const row = getCall(id);
  if (!row.consented_recording || !row.consented_clone || !row.consented_synthetic) {
    throw new Error("Für diesen Mitschnitt fehlt die Klon-Einwilligung.");
  }
  return row;
}
