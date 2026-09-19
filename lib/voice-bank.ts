import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  getSeedVoice,
  publicCard,
  standInSeed,
  type VoiceAge,
  type VoiceCard,
  type VoiceGender,
  type VoiceKind,
  type VoiceLocale,
  type VoiceSpec,
} from "@/lib/voices";

const VOICE_DIR = path.join(process.cwd(), ...["data", "voices"]);

export type CustomVoiceRow = {
  id: string;
  name: string;
  role: string;
  region: string;
  gender: VoiceGender;
  age_band: VoiceAge;
  locale: VoiceLocale;
  kind: VoiceKind;
  consent: "own" | "counterpart" | "library";
  sample_path: string | null;
  eleven_voice_id: string | null;
  created_at: string;
};

function ensureTable() {
  db().exec(`
    CREATE TABLE IF NOT EXISTS voice_bank (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      region TEXT NOT NULL,
      gender TEXT NOT NULL,
      age_band TEXT NOT NULL,
      locale TEXT NOT NULL,
      kind TEXT NOT NULL,
      consent TEXT NOT NULL,
      sample_path TEXT,
      eleven_voice_id TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function listCustomVoices(): CustomVoiceRow[] {
  ensureTable();
  return db()
    .prepare("SELECT * FROM voice_bank ORDER BY created_at DESC")
    .all() as CustomVoiceRow[];
}

export function getCustomVoice(id: string): CustomVoiceRow | undefined {
  ensureTable();
  return db().prepare("SELECT * FROM voice_bank WHERE id = ?").get(id) as CustomVoiceRow | undefined;
}

export function customToSpec(row: CustomVoiceRow): VoiceSpec {
  const standIn = standInSeed(row.gender, row.locale, row.age_band);
  const isPiper = Boolean(row.eleven_voice_id?.startsWith("piper:"));
  const isLibrary = row.consent === "library" || row.kind === "library";
  const seed = getSeedVoice(row.id);
  return {
    ...standIn,
    id: row.id,
    name: row.name,
    role: row.role,
    description: isPiper
      ? `Lokal · ${row.region}. Piper-Stimme, ohne API-Kosten.`
      : isLibrary
        ? `Bibliothek · ${row.region}. Lizenzierte Stimme, sofort nutzbar.`
        : `Aufnahme · ${row.region}. ${row.eleven_voice_id ? "Klon aktiv." : "Noch Neural-Ersatz, bis ein Klon-Dienst hinterlegt ist."}`,
    sample: seed?.sample || standIn.sample,
    gender: row.gender,
    ageBand: row.age_band,
    locale: row.locale,
    region: row.region,
    kind: isPiper ? "neural" : isLibrary ? "library" : "clone",
    rate: seed?.rate ?? standIn.rate,
    elevenVoiceId: row.eleven_voice_id || undefined,
    standInId: standIn.id,
  };
}

export function customCard(row: CustomVoiceRow): VoiceCard {
  return publicCard(customToSpec(row));
}

export function saveCustomVoice(input: {
  name: string;
  role: string;
  region: string;
  gender: VoiceGender;
  ageBand: VoiceAge;
  locale: VoiceLocale;
  consent: "own" | "counterpart";
  audio: Buffer;
  mime: string;
  elevenVoiceId?: string;
}): CustomVoiceRow {
  ensureTable();
  fs.mkdirSync(VOICE_DIR, { recursive: true });
  const id = randomUUID();
  const ext = input.mime.includes("mpeg") || input.mime.includes("mp3") ? "mp3" : input.mime.includes("wav") ? "wav" : "webm";
  const samplePath = path.join(VOICE_DIR, `${id}.${ext}`);
  fs.writeFileSync(samplePath, input.audio);
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO voice_bank (id, name, role, region, gender, age_band, locale, kind, consent, sample_path, eleven_voice_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'clone', ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.name,
      input.role,
      input.region,
      input.gender,
      input.ageBand,
      input.locale,
      input.consent,
      samplePath,
      input.elevenVoiceId ?? null,
      now,
    );
  return getCustomVoice(id)!;
}

export function saveLibraryVoice(input: {
  name: string;
  role: string;
  region: string;
  gender: VoiceGender;
  ageBand: VoiceAge;
  locale: VoiceLocale;
  description?: string;
  elevenVoiceId: string;
  sample?: string;
}): CustomVoiceRow {
  ensureTable();
  const id = randomUUID();
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO voice_bank (id, name, role, region, gender, age_band, locale, kind, consent, sample_path, eleven_voice_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'library', 'library', NULL, ?, ?)`,
    )
    .run(
      id,
      input.name,
      input.role || input.description || "Bibliothek",
      input.region,
      input.gender,
      input.ageBand,
      input.locale,
      input.elevenVoiceId,
      now,
    );
  return getCustomVoice(id)!;
}

/** Persistiert eine Seed-/Lokalstimme inkl. Sample-Datei (Upsert nach fester ID). */
export function upsertLocalBankVoice(input: {
  id: string;
  name: string;
  role: string;
  region: string;
  gender: VoiceGender;
  ageBand: VoiceAge;
  locale: VoiceLocale;
  piperModel: string;
  samplePath: string;
}): CustomVoiceRow {
  ensureTable();
  const now = new Date().toISOString();
  const existing = getCustomVoice(input.id);
  if (existing) {
    db()
      .prepare(
        `UPDATE voice_bank SET name=?, role=?, region=?, gender=?, age_band=?, locale=?, kind='library', consent='library',
         sample_path=?, eleven_voice_id=? WHERE id=?`,
      )
      .run(
        input.name,
        input.role,
        input.region,
        input.gender,
        input.ageBand,
        input.locale,
        input.samplePath,
        `piper:${input.piperModel}`,
        input.id,
      );
  } else {
    db()
      .prepare(
        `INSERT INTO voice_bank (id, name, role, region, gender, age_band, locale, kind, consent, sample_path, eleven_voice_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'library', 'library', ?, ?, ?)`,
      )
      .run(
        input.id,
        input.name,
        input.role,
        input.region,
        input.gender,
        input.ageBand,
        input.locale,
        input.samplePath,
        `piper:${input.piperModel}`,
        now,
      );
  }
  return getCustomVoice(input.id)!;
}

export function voiceBankCount(): number {
  ensureTable();
  const row = db().prepare("SELECT COUNT(*) AS n FROM voice_bank").get() as { n: number };
  return row.n;
}

export function customSamplePath(id: string) {
  return getCustomVoice(id)?.sample_path ?? null;
}
