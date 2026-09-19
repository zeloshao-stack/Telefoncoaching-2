import { db } from "./db";
import type { CharacterState, HiddenFact } from "@/src/role-engine/types";

/** Server-only, post-turn authorization state. This does not claim facts were audible. */
export type ReplayCheckpoint = { state: CharacterState; hiddenFacts: HiddenFact[] };

function checkpointDb() {
  const database = db();
  database.exec(`CREATE TABLE IF NOT EXISTS replay_checkpoints (
    turn_id TEXT PRIMARY KEY, checkpoint_json TEXT NOT NULL
  )`);
  return database;
}

export function saveReplayCheckpoint(turnId: string, checkpoint: ReplayCheckpoint) {
  checkpointDb().prepare("INSERT OR REPLACE INTO replay_checkpoints (turn_id, checkpoint_json) VALUES (?, ?)")
    .run(turnId, JSON.stringify(checkpoint));
}

export function loadReplayCheckpoints(turnIds: string[]): Map<string, ReplayCheckpoint> {
  const database = checkpointDb();
  const query = database.prepare("SELECT checkpoint_json FROM replay_checkpoints WHERE turn_id = ?");
  const result = new Map<string, ReplayCheckpoint>();
  for (const id of turnIds) {
    const row = query.get(id) as { checkpoint_json: string } | undefined;
    if (row) result.set(id, JSON.parse(row.checkpoint_json) as ReplayCheckpoint);
  }
  return result;
}
