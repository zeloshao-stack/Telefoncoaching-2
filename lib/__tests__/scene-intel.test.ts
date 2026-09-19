import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { hydrateAffect } from "../../src/role-engine/affect";
import { characterForScenario } from "../../src/role-engine/characters";
import { buildPersonaInstructions } from "../../src/role-engine/persona-prompt";
import type { RoleCharacter } from "../../src/role-engine/types";
import { resolveCoachHandoff, handoffPublicContext, handoffLeaksScorecard, type CoachHandoffSource } from "../coach-handoff";
import { FROZEN_SCENARIO_IDS, getScenario } from "../content/pack";
import { defaultFocusForScenario } from "../focus";
import { drillHonesty } from "../scenario-product";
import { catalogSurface, toSceneCard } from "../scene-card";
import { trainingPageSurface, toSceneBriefing } from "../scene-briefing";
import {
  TRAININGSZIELE_MARKER,
  formatCoachIntel,
  sceneIntel,
  sceneIntelPublic,
} from "../scene-intel";
import type { Evaluation, TranscriptTurn } from "../../src/role-engine/types";

function stateOf(character: RoleCharacter) {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("S01–S08: ein Fokus, drei Beats, Prep ohne private_state", () => {
  assert.deepEqual([...FROZEN_SCENARIO_IDS], ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08"]);
  for (const id of FROZEN_SCENARIO_IDS) {
    const intel = sceneIntel(id);
    assert.ok(intel, id);
    assert.equal(intel.goal, drillHonesty(id).practiceFocus);
    assert.equal(intel.beats.length, 3);
    assert.ok(intel.qualify.length >= 2 && intel.qualify.length <= 4);
    assert.ok(intel.prep.length >= 2 && intel.prep.length <= 4);
    assert.ok(intel.evalBeats.length >= 3 && intel.evalBeats.length <= 4);
    for (const beat of intel.beats) {
      assert.ok(beat.title.split(/\s+/).length <= 4, `${id} Titel zu lang: ${beat.title}`);
      assert.ok(beat.why.length > 40, `${id} Why zu dünn: ${beat.why}`);
      assert.match(beat.why, /\bSie\b/, `${id} Why nicht Sie-Form`);
      assert.doesNotMatch(beat.why, /\b(du|dein|deine)\b/i);
    }
    const blob = JSON.stringify(intel);
    assert.doesNotMatch(blob, /70\s*\/\s*30|[0-4]\s*\/\s*4|Halo|Gesamtnote|commercial_judgment|decision_process/);
    assert.doesNotMatch(blob, /Nur Vermittlung|Bindungsdauer|Verkaufsbereitschaft|budget_cap|sister_concern/i);
    assert.doesNotMatch(blob, /hangup_threshold|hidden_fact|Schwägerin|früherer Makler|Beirat hat verboten/i);
    assert.doesNotMatch(blob, /Bindungsangst|Angststörung|Persönlichkeit|Solar|Sheila/i);
  }
  const s01 = sceneIntel("S01")!;
  assert.match(s01.challenge, /12\.000/);
  assert.match(s01.prep.join(" "), /48\.000/);
  assert.match(s01.goal, /Leistungsumfang/);
  const s02 = sceneIntel("S02")!;
  assert.match(s02.goal, /Absage/);
  const s03 = sceneIntel("S03")!;
  assert.match(s03.goal, /mitentscheidet/);
  const s04 = sceneIntel("S04")!;
  assert.match(s04.challenge, /Floskel|Leitung ist tot/);
  assert.match(s04.goal, /Anlass/);
  const s05 = sceneIntel("S05")!;
  assert.match(s05.challenge, /Mehrheit/);
  assert.match(s05.goal, /Mehrheit/);
  const s06 = sceneIntel("S06")!;
  assert.match(s06.challenge, /Anwalt/);
  assert.match(s06.goal, /Rechtszusage/);
  const s07 = sceneIntel("S07")!;
  assert.match(s07.challenge, /Vollmacht|Sorge/);
  assert.match(s07.goal, /Sorge/);
  const s08 = sceneIntel("S08")!;
  assert.match(s08.challenge, /Empfehlung/);
  assert.match(s08.goal, /Neuverkauf|Empfehlung/);
  assert.equal(sceneIntel("A01"), null);
});

test("S01–S08: Lage-Titel, sprechbare Openings, acht verschiedene Gespräche", () => {
  const openings = [];
  const titles = [];
  for (const id of FROZEN_SCENARIO_IDS) {
    const scenario = getScenario(id);
    assert.ok(scenario, id);
    titles.push(scenario.title);
    openings.push(scenario.opening);
    assert.doesNotMatch(scenario.title, /Leitner|Berger|Huber|Felber|Stöger|Prinz|Wallner|Moser/);
    assert.match(scenario.title, /Alsergrund|Ottakring|Währing|Hernals|Josefstadt|Neubau|Landstraße|Wieden/);
    assert.doesNotMatch(scenario.opening, /\[|\]|\(|Szene:|sagt:|skeptisch,/i);
    assert.ok(scenario.opening.split(/\s+/).length >= 8, `${id} Opening zu kurz`);
    assert.ok(scenario.public_brief.length > 80, `${id} public_brief zu dünn`);
  }
  assert.equal(new Set(openings).size, 8);
  assert.equal(new Set(titles).size, 8);
  assert.equal(defaultFocusForScenario("S04", "immobilien"), "boundary");
  assert.equal(defaultFocusForScenario("S05", "immobilien"), "authority");
  assert.equal(defaultFocusForScenario("S06", "immobilien"), "truth");
  assert.equal(defaultFocusForScenario("S07", "immobilien"), "diagnosis");
  assert.equal(defaultFocusForScenario("S08", "immobilien"), "boundary");
});

test("A04-Katalog zeigt beat.why, nicht evalBeats", () => {
  const pub = sceneIntelPublic("S01");
  assert.ok(pub);
  const intel = sceneIntel("S01")!;
  assert.deepEqual(pub.beatTitles, intel.beats.map((beat) => beat.title));
  assert.deepEqual(
    pub.beats.map((beat) => beat.why),
    intel.beats.map((beat) => beat.why),
  );
  assert.equal("evalBeats" in pub, false);
  const card = toSceneCard({
    id: "S01",
    title: "Honorarvergleich",
    counterpart: "Elisabeth Leitner · Zinshaus, Wien",
    verticalId: "immobilien",
  });
  assert.ok(card);
  assert.equal(card.challenge, pub.challenge);
  assert.deepEqual(card.countTitles, pub.beatTitles);
  assert.deepEqual(
    card.goals.map((goal) => goal.sentence),
    intel.beats.map((beat) => beat.why),
  );
  assert.ok(card.beats.every((beat) => beat.why.length > 20));
  const surface = catalogSurface(card);
  assert.equal("evalBeats" in surface, false);
  assert.equal("qualifyPoints" in surface, false);
  assert.equal(surface.goals.length, 3);
  assert.equal(surface.focusLine, null);
  const briefing = toSceneBriefing({
    id: "S01",
    title: "Honorarvergleich",
    publicBrief: "Erlaubtes Verkaufsgespräch. Konkurrenzumfang unbekannt.",
    knowledgeCardIds: ["K01", "K04"],
    verticalId: "immobilien",
  });
  assert.ok(briefing);
  const page = trainingPageSurface(briefing);
  assert.equal("evalBeats" in page, false);
  assert.equal("qualifyPoints" in page, false);
  assert.deepEqual(
    page.goals.map((goal) => goal.title),
    pub.beatTitles,
  );
  assert.equal(page.goals[0]?.sentence, intel.beats[0]?.why);
});

test("Player-Prompt enthält keine evalBeats/TRAININGSZIELE", () => {
  for (const id of FROZEN_SCENARIO_IDS) {
    const character = characterForScenario(id);
    const full = buildPersonaInstructions(character, character.hiddenFacts, stateOf(character));
    assert.doesNotMatch(full, /TRAININGSZIELE|evalBeats|Eval-Hinweise/);
    const intel = sceneIntel(id)!;
    assert.doesNotMatch(full, new RegExp(escapeRegExp(intel.goal)));
    for (const beat of intel.evalBeats) {
      assert.doesNotMatch(full, new RegExp(escapeRegExp(beat.observable.slice(0, 32))));
    }
    for (const beat of intel.beats) {
      assert.doesNotMatch(full, new RegExp(escapeRegExp(beat.why.slice(0, 28))));
    }
  }
});

test("Role-Player-Dateien importieren scene-intel nicht", () => {
  const files = [
    "components/training/liveCall.ts",
    "components/training/bargeIn.ts",
    "lib/live-text.ts",
    "lib/openai-realtime.ts",
    "src/role-engine/persona-prompt.ts",
    "src/role-engine/characters.ts",
    "src/role-engine/playerWorldGate.ts",
  ];
  for (const file of files) {
    const text = readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(text, /scene-intel|TRAININGSZIELE|evalBeats/);
  }
  const adapter = readFileSync(new URL("../../src/role-engine/openaiAdapter.ts", import.meta.url), "utf8");
  assert.doesNotMatch(adapter, /scene-intel|evalBeats/);
  const evaluate = adapter.slice(
    adapter.indexOf("const EVALUATION_SCHEMA"),
    adapter.indexOf("export async function openaiCoachReply"),
  );
  assert.doesNotMatch(evaluate, /TRAININGSZIELE|evalBeats|scene-intel/);
  assert.match(evaluate, /name: "telefoncoaching_auswertung"/);
});

test("Coach-Handoff enthält goal+beats bei Debrief-Link", () => {
  const turns: TranscriptTurn[] = [
    { id: "c1", speaker: "counterpart", text: "36.000 Euro. Warum so teuer?" },
    { id: "t1", speaker: "trainee", text: "Was umfasst das Angebot?" },
  ];
  const ev: Pick<Evaluation, "keyMoment" | "importantMomentTurnId" | "nextStep" | "nextLine" | "calibration" | "strength"> = {
    strength: "Sie haben den Umfang gefragt.",
    importantMomentTurnId: "t1",
    nextStep: "Fragen Sie, was das andere Angebot umfasst.",
    nextLine: "Was genau umfasst das andere Angebot?",
    keyMoment: {
      turnId: "t1",
      quote: "Was umfasst das Angebot?",
      whatHappened: "Die Zahl blieb zu.",
      counterfactual: "Den Umfang nennen.",
      source: "rule",
    },
  };
  const session: CoachHandoffSource = {
    id: "s1",
    status: "ended",
    scenarioId: "S01",
    scenarioTitle: "Honorarvergleich am Tisch",
    counterpartName: "Elisabeth Leitner",
    publicBrief: "12.000 Euro Unterschied, 36.000 Vergleich.",
    verticalId: "immobilien",
    focusId: "diagnosis",
    focusLabel: "Lage zuerst",
    turns,
    evaluation: ev,
  };
  const handoff = resolveCoachHandoff(session, "t1");
  assert.equal(handoff.goal, drillHonesty("S01").practiceFocus);
  assert.equal(handoff.beats.length, 3);
  assert.match(handoff.beats[0]!.title, /Umfang/);
  assert.ok(handoff.evalBeats.length >= 3);
  const ctx = handoffPublicContext(session, handoff);
  assert.match(ctx, new RegExp(TRAININGSZIELE_MARKER));
  assert.match(ctx, /Leistungsumfang klären/);
  assert.match(ctx, /Umfang zuerst/);
  assert.equal(handoffLeaksScorecard(ctx), false);
  const packed = formatCoachIntel(sceneIntel("S01")!);
  assert.match(packed, /TRAININGSZIELE/);
  assert.doesNotMatch(packed, /\bScore\b|Rubrik|0\s*\/\s*4/);
});
