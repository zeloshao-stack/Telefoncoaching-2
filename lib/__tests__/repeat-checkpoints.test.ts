import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("SQLite checkpoints survive repeat-of-repeat without parent end-state contamination", async () => {
  const original = process.cwd();
  const isolated = mkdtempSync(join(tmpdir(), "telefoncoaching-replay-test-"));
  process.chdir(isolated);
  try {
    // dbPath is initialized only after switching into an isolated test directory.
    const { createSession, appendLiveTraineeTurn, appendLiveUtterance, repeatSession } = await import("../sessions");
    const { db } = await import("../db");
    const { loadReplayCheckpoints, saveReplayCheckpoint } = await import("../replay-checkpoints");
    const first = createSession("S01");
    const advanced = appendLiveTraineeTurn(first.id, "Was genau umfasst das Angebot, das Sie vergleichen?").session;
    const trainee = advanced.turns.find((turn) => turn.speaker === "trainee")!;
    const checkpoint = loadReplayCheckpoints([trainee.id]).get(trainee.id)!;
    assert.ok(checkpoint);
    // Model-independent fixture: the semantic memory selector authorized this fact.
    checkpoint.state.disclosedFacts = ["competitor_scope"];
    checkpoint.hiddenFacts = checkpoint.hiddenFacts.map(fact => fact.id === "competitor_scope"
      ? { ...fact, status: "disclosed" as const } : fact);
    saveReplayCheckpoint(trainee.id, checkpoint);
    assert.ok(checkpoint.state.disclosedFacts.includes("competitor_scope"));
    const parent = appendLiveUtterance(first.id, "counterpart", "Der andere sucht nur den Käufer, Unterlagen macht er nicht.");
    const anchor = parent.turns.at(-1)!;
    db().prepare("UPDATE sessions SET state_json = ? WHERE id = ?").run(
      JSON.stringify({ ...checkpoint.state, irritation: 99, status: "ended", hangupReason: "abuse" }), first.id,
    );
    const repeat = repeatSession(first.id, anchor.id);
    const row = db().prepare("SELECT state_json FROM sessions WHERE id = ?").get(repeat.id) as { state_json: string };
    const state = JSON.parse(row.state_json);
    assert.equal(state.irritation, checkpoint.state.irritation);
    assert.equal(state.status, "active");
    assert.equal(state.hangupReason, undefined);
    assert.ok(state.disclosedFacts.includes("competitor_scope"));
    const copiedTrainee = repeat.turns.find((turn) => turn.speaker === "trainee")!;
    assert.deepEqual(loadReplayCheckpoints([copiedTrainee.id]).get(copiedTrainee.id), checkpoint);
    const second = repeatSession(repeat.id, repeat.turns.at(-1)!.id);
    const secondRow = db().prepare("SELECT state_json FROM sessions WHERE id = ?").get(second.id) as { state_json: string };
    assert.deepEqual(JSON.parse(secondRow.state_json), state);
    db().close();
  } finally {
    process.chdir(original);
    rmSync(isolated, { recursive: true, force: true });
  }
});
