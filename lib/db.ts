import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "telefoncoaching.sqlite");

let instance: Database.Database | null = null;

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      scenario_version INTEGER NOT NULL,
      status TEXT NOT NULL,
      mode TEXT NOT NULL,
      parent_session_id TEXT,
      repeat_from_turn_id TEXT,
      character_json TEXT NOT NULL,
      hidden_facts_json TEXT NOT NULL,
      state_json TEXT NOT NULL,
      engine_mode TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS turns (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      speaker TEXT NOT NULL,
      text TEXT NOT NULL,
      observations_json TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      evaluation_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS authored_scenarios (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coach_threads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      session_id TEXT,
      engine_mode TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coach_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
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
  `;

export function db() {
  if (!instance) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    instance = new Database(dbPath);
    instance.pragma("journal_mode = WAL");
  }
  instance.exec(SCHEMA);
  migrate(instance);
  return instance;
}

function hasColumn(database: Database.Database, table: string, column: string) {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((row) => row.name === column);
}

function migrate(database: Database.Database) {
  if (!hasColumn(database, "sessions", "vertical_id")) {
    database.exec("ALTER TABLE sessions ADD COLUMN vertical_id TEXT NOT NULL DEFAULT 'immobilien'");
  }
  if (!hasColumn(database, "coach_threads", "vertical_id")) {
    database.exec("ALTER TABLE coach_threads ADD COLUMN vertical_id TEXT NOT NULL DEFAULT 'immobilien'");
  }
  if (!hasColumn(database, "sessions", "focus_id")) {
    database.exec("ALTER TABLE sessions ADD COLUMN focus_id TEXT NOT NULL DEFAULT 'diagnosis'");
  }
  if (!hasColumn(database, "sessions", "live_call_id")) {
    database.exec("ALTER TABLE sessions ADD COLUMN live_call_id TEXT");
  }
  if (!hasColumn(database, "sessions", "live_call_at")) {
    database.exec("ALTER TABLE sessions ADD COLUMN live_call_at TEXT");
  }
}

export type SessionRow = {
  id: string;
  scenario_id: string;
  scenario_version: number;
  status: string;
  mode: string;
  parent_session_id: string | null;
  repeat_from_turn_id: string | null;
  character_json: string;
  hidden_facts_json: string;
  state_json: string;
  engine_mode: string;
  created_at: string;
  vertical_id?: string;
  focus_id?: string;
  live_call_id?: string | null;
  live_call_at?: string | null;
};

export type TurnRow = {
  id: string;
  session_id: string;
  seq: number;
  speaker: string;
  text: string;
  observations_json: string | null;
  created_at: string;
};
