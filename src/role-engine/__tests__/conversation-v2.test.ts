import assert from "node:assert/strict";
import test from "node:test";
import { characterForScenario } from "../characters";
import { characterPerformance } from "../character-performance";
import { buildPersonaInstructions } from "../persona-prompt";
import { playTraineeTurn } from "../roleEngine";
import { openaiRolePlay } from "../openaiAdapter";

test("eight distinct performances preserve unreleased facts and omit evaluation knowledge", () => {
  const profiles = new Set<string>();
  for (let n = 1; n <= 8; n++) {
    const c = characterForScenario(`S0${n}`);
    profiles.add(characterPerformance(c));
    const prompt = buildPersonaInstructions(c, c.hiddenFacts, c.initialState);
    assert.doesNotMatch(prompt, /TRAININGSZIELE|Rubrik|höchstens drei Sätze|Dieselbe Frage nicht zweimal/);
    assert.match(prompt, /Nach einer Korrektur/);
    assert.match(prompt, /tatsächlich gestellte Frage/);
    for (const fact of c.hiddenFacts.filter(f => f.status !== "disclosed")) {
      assert.ok(!prompt.includes(fact.fact), `${c.scenarioId} leaks ${fact.id}`);
    }
  }
  assert.equal(profiles.size, 8);
});

test("real provider failure is surfaced and never converted to mock dialogue", async () => {
  const previous = process.env.OPENAI_API_KEY;
  const fetchBefore = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-only-not-a-credential";
  globalThis.fetch = async () => { throw new Error("provider unavailable"); };
  try {
    const c = characterForScenario("S01");
    await assert.rejects(playTraineeTurn({ sessionId: "s", character: c, hiddenFacts: c.hiddenFacts,
      state: c.initialState, transcript: [], traineeTurn: { id: "t", speaker: "trainee", text: "Was vergleichen Sie?" },
    }), /provider unavailable/);
  } finally {
    globalThis.fetch = fetchBefore;
    if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous;
  }
});

test("heuristic pressure cannot force hangup over a contextual model reply", async () => {
  const previous = process.env.OPENAI_API_KEY;
  const fetchBefore = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-only-not-a-credential";
  globalThis.fetch = async () => new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({action:"speak",utterance:"Was meinen Sie damit genau?"})}}]}), {status:200});
  try {
    const c = characterForScenario("S02");
    const result = await openaiRolePlay({ sessionId:"s", turnId:"t", character:c, hiddenFacts:c.hiddenFacts,
      state:{...c.initialState, irritation:100, timeWillingness:0},
      observations:[{type:"continued_after_final_no",turnId:"t",evidence:"wrong heuristic",confidence:"high"}],
      proposedDisclosures:[], transcript:[], traineeText:"Entschuldigung, ich habe Sie falsch verstanden." });
    assert.equal(result.action,"speak");
    assert.equal(result.utterance,"Was meinen Sie damit genau?");
    assert.equal(result.endReason,undefined);
  } finally {
    globalThis.fetch = fetchBefore;
    if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous;
  }
});
