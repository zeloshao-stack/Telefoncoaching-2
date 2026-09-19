import assert from "node:assert/strict";
import { test } from "node:test";
import { realtimeSessionConfig } from "../openai-realtime";
import { characterForScenario } from "../../src/role-engine/characters";

test("live memory is an on-demand query with no hidden fact payload", () => {
  const c = characterForScenario("S01");
  const tool = realtimeSessionConfig(c, c.hiddenFacts, structuredClone(c.initialState)).tools.find(t => t.name === "recall_memory");
  assert.ok(tool);
  assert.deepEqual(tool.parameters.required, ["query"]);
  assert.equal(tool.parameters.additionalProperties, false);
  assert.deepEqual(Object.keys(tool.parameters.properties), ["query"]);
  assert.match(tool.description, /vor der Antwort/);
  assert.match(tool.description, /nicht jeden/);
  assert.match(tool.description, /nichts erfinden/);
});
