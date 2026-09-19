import assert from "node:assert/strict";
import test from "node:test";
import { selectMemoryIds, recallMemory } from "../semantic-memory";
import { db } from "../db";
import { randomUUID } from "node:crypto";
import { characterForScenario } from "@/src/role-engine/characters";

const c = characterForScenario("S01");
const input = { character: c, facts: c.hiddenFacts, query: "Leistungen vergleichen", transcript: [
  { speaker: "trainee", text: "Was würde der andere für sein Geld tatsächlich tun?" },
] };

test("semantic selector uses actual transcript and private rules, never evaluation goals", async () => {
  const ids = await selectMemoryIds(input, async (system, user) => {
    assert.match(system, /sinngemäß/);
    assert.match(system, /kein Beleg und keine Berechtigung/);
    assert.ok(user.includes(input.transcript[0].text));
    assert.ok(!user.includes(c.acceptableOutcome));
    assert.ok(!user.includes("rubric"));
    return { factIds: [c.hiddenFacts[0].id] };
  });
  assert.deepEqual(ids, [c.hiddenFacts[0].id]);
});

test("invented IDs, malformed IDs and bulk disclosure fail closed", async () => {
  for (const factIds of [["invented"], [2], [c.hiddenFacts[0].id, c.hiddenFacts[0].id, c.hiddenFacts[0].id], "all"]) {
    assert.deepEqual(await selectMemoryIds(input, async () => ({ factIds })), []);
  }
});

test("no stored caller turn means no provider request; provider errors remain errors", async () => {
  assert.deepEqual(await selectMemoryIds({ ...input, transcript: [] }, async () => { throw new Error("must not call"); }), []);
  await assert.rejects(selectMemoryIds(input, async () => { throw new Error("unavailable"); }), /unavailable/);
});

test("memory commits exact frozen fact and checkpoint; concurrent end never discloses", async () => {
  const database = db();
  const key = process.env.OPENAI_API_KEY;
  const routerKey = process.env.OPENROUTER_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-not-a-credential";
  delete process.env.OPENROUTER_API_KEY;
  const sessions: string[] = [];
  const turns: string[] = [];
  try {
    for (const endDuringSelection of [false, true]) {
      const id = randomUUID(), turn = randomUUID();
      sessions.push(id); turns.push(turn);
      database.prepare(`INSERT INTO sessions (id,scenario_id,scenario_version,status,mode,character_json,hidden_facts_json,state_json,engine_mode,created_at)
        VALUES (?, 'S01', 1, 'active', 'live', ?, ?, ?, 'openai', ?)`)
        .run(id, JSON.stringify(c), JSON.stringify(c.hiddenFacts), JSON.stringify(c.initialState), new Date().toISOString());
      database.prepare("INSERT INTO turns(id,session_id,seq,speaker,text,created_at) VALUES(?,?,0,'trainee',?,?)")
        .run(turn,id,input.transcript[0].text,new Date().toISOString());
      globalThis.fetch = async () => { throw new Error("stale transcript must not call provider"); };
      assert.deepEqual(await recallMemory(id, input.query, undefined, "Eine neuere, noch nicht gespeicherte Frage?"),
        { facts: [], status: "stale" });
      globalThis.fetch = async () => {
        if (endDuringSelection) database.prepare("UPDATE sessions SET status='ended' WHERE id=?").run(id);
        return new Response(JSON.stringify({ choices: [{message: {content: JSON.stringify({factIds:[c.hiddenFacts[0].id]})}}] }), {status:200});
      };
      const result = await recallMemory(id, input.query);
      assert.deepEqual(result.facts, endDuringSelection ? [] : [c.hiddenFacts[0].fact]);
      assert.equal(result.status, endDuringSelection ? "ended" : "recalled");
      if (!endDuringSelection) {
        const row = database.prepare("SELECT checkpoint_json FROM replay_checkpoints WHERE turn_id=?").get(turn) as {checkpoint_json:string};
        assert.ok(JSON.parse(row.checkpoint_json).state.disclosedFacts.includes(c.hiddenFacts[0].id));
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = key;
    if (routerKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = routerKey;
    for (const id of turns) {
      database.prepare("DELETE FROM turns WHERE id=?").run(id);
      database.prepare("DELETE FROM replay_checkpoints WHERE turn_id=?").run(id);
    }
    for (const id of sessions) database.prepare("DELETE FROM sessions WHERE id=?").run(id);
  }
});
