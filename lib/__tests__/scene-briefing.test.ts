import assert from "node:assert/strict";
import { test } from "node:test";
import { SCENARIO_BLURBS, getScenario } from "../content/pack";
import { BRIEFING_NOTICE, toSceneBriefing, trainingPageSurface } from "../scene-briefing";

test("S01-Training-Seite: Ziel, public_brief, drei Why-Ziele, Hinweis — keine Tabs, kein private_state", () => {
  const scenario = getScenario("S01");
  assert.ok(scenario);
  const briefing = toSceneBriefing({
    id: scenario.id,
    title: scenario.title,
    publicBrief: scenario.public_brief,
    acceptableOutcome: scenario.acceptable_outcome,
    knowledgeCardIds: scenario.knowledge_card_ids,
    blurb: SCENARIO_BLURBS.S01,
    verticalId: "immobilien",
  });
  assert.ok(briefing);
  const surface = trainingPageSurface(briefing);
  assert.equal(surface.title, "Alsergrund, zwei Honorare");
  assert.match(surface.goal, /Leistung|Preis/i);
  assert.equal(surface.scene, scenario.public_brief);
  assert.equal(surface.goals.length, 3);
  assert.ok(surface.goals.every((goal) => goal.title && goal.sentence.length > 20));
  assert.equal(surface.notice, BRIEFING_NOTICE);
  assert.deepEqual(Object.keys(surface).sort(), ["goal", "goals", "notice", "scene", "title"]);
  const blob = JSON.stringify(surface);
  assert.doesNotMatch(blob, /competitor_scope|sister_concern|budget_cap/i);
  assert.doesNotMatch(blob, /Übersicht|Ihr Auftrag|Wonach ausgewertet/i);
  assert.doesNotMatch(blob, /70\s*\/\s*30|0\s*\/\s*4/);
  assert.doesNotMatch(blob, /Kein Drängen/);
});

test("Lange Auftrag-/Eval-Felder existieren für A08, gehören nicht zur Seitenfläche", () => {
  const scenario = getScenario("S01");
  assert.ok(scenario);
  const briefing = toSceneBriefing({
    id: scenario.id,
    title: scenario.title,
    publicBrief: scenario.public_brief,
    acceptableOutcome: scenario.acceptable_outcome,
    knowledgeCardIds: scenario.knowledge_card_ids,
    verticalId: "immobilien",
  });
  assert.ok(briefing);
  assert.ok(briefing.qualifyPoints.length > 0);
  assert.ok(briefing.evalBeats.length > 0);
  const surface = trainingPageSurface(briefing);
  assert.equal("qualifyPoints" in surface, false);
  assert.equal("evalBeats" in surface, false);
  assert.equal("prepFacts" in surface, false);
});
