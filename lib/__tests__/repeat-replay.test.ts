import assert from "node:assert/strict";
import { test } from "node:test";
import { seedRepeatFromParent } from "../sessions";
import { initialStateForEvaluation } from "../evaluation";
import { characterForScenario } from "../../src/role-engine/characters";
import { extractObservations } from "../../src/role-engine/observationExtractor";
import { reduceState } from "../../src/role-engine/stateReducer";
import { extractVocal } from "../../src/role-engine/vocalChannel";
import { hydrateAffect } from "../../src/role-engine/affect";
import type { CharacterState, TranscriptTurn } from "../../src/role-engine/types";

const FACT = "Nur Vermittlung, keine vereinbarte Aufbereitung";

function parentTurns(): TranscriptTurn[] {
  return [
    { id: "c1", speaker: "counterpart", text: "Warum sollte ich Ihnen zwölftausend Euro mehr zahlen?" },
    {
      id: "t1",
      speaker: "trainee",
      text: "Guten Tag, ich bin Makler. Was genau umfasst das Angebot, das Sie vergleichen?",
    },
    { id: "c2", speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro." },
    {
      id: "t2",
      speaker: "trainee",
      text: "Dann mache ich es auch um 36.000. Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen.",
    },
    { id: "c3", speaker: "counterpart", text: `Ehrlich gesagt: ${FACT}. Mir reicht's.` },
    { id: "sys", speaker: "system", text: "Elisabeth Leitner hat aufgelegt — eigene Entscheidung." },
  ];
}

function parentEndState(character: ReturnType<typeof characterForScenario>): CharacterState {
  return {
    ...character.initialState,
    status: "ended",
    trust: 4,
    interest: 6,
    irritation: 92,
    timeWillingness: 3,
    perceivedCompetence: 8,
    salesPressure: 88,
    disclosedFacts: ["competitor_scope"],
    stateRevision: 40,
    hangupReason: "character_choice",
    hangupTrigger: "Live: eigene Entscheidung",
  };
}

test("Repeat an der Gegenäußerung behält den Einwand und lässt die schwache Zeile weg", () => {
  const character = characterForScenario("S01");
  const { copied } = seedRepeatFromParent(character, parentTurns(), "c2");
  assert.deepEqual(
    copied.map((turn) => turn.id),
    ["c1", "t1", "c2"],
  );
});

test("Repeat an der eigenen schwachen Zeile schneidet davor", () => {
  const character = characterForScenario("S01");
  const { copied } = seedRepeatFromParent(character, parentTurns(), "t2");
  assert.deepEqual(
    copied.map((turn) => turn.id),
    ["c1", "t1", "c2"],
  );
});

test("Zustand kommt aus Replay, nicht aus dem Eltern-Endzustand", () => {
  const character = characterForScenario("S01");
  const parentState = parentEndState(character);
  const { state, copied } = seedRepeatFromParent(character, parentTurns(), "c2");

  assert.equal(copied.length, 3);
  assert.notEqual(state.irritation, parentState.irritation);
  assert.notEqual(state.stateRevision, parentState.stateRevision);
  assert.notEqual(state.status, parentState.status);
  assert.ok(state.irritation < parentState.irritation);

  let expected: CharacterState = {
    ...character.initialState,
    status: "active",
    disclosedFacts: [],
    affect: hydrateAffect(character, character.initialState),
  };
  const trainee = copied.find((turn) => turn.speaker === "trainee");
  assert.ok(trainee);
  const observations = extractObservations(character, trainee, copied.slice(0, copied.indexOf(trainee)));
  expected = reduceState(character, expected, observations, extractVocal(trainee.text, null));
  assert.equal(state.trust, expected.trust);
  assert.equal(state.interest, expected.interest);
  assert.equal(state.irritation, expected.irritation);
  assert.equal(state.stateRevision, 1);
  assert.equal(state.status, "active");
});

test("Auflege-Grund und Trigger der Elternsitzung werden nicht übernommen", () => {
  const character = characterForScenario("S01");
  const { state } = seedRepeatFromParent(character, parentTurns(), "c2");
  assert.equal(state.hangupReason, undefined);
  assert.equal(state.hangupTrigger, undefined);
  assert.equal(state.status, "active");
});

test("Legacy-Replay erhält die Freigabe auch bei paraphrasierter Gegenäußerung", () => {
  const character = characterForScenario("S01");
  const { state, hiddenFacts } = seedRepeatFromParent(character, parentTurns(), "c2");
  assert.deepEqual(state.disclosedFacts, ["competitor_scope"]);
  assert.equal(hiddenFacts.find((fact) => fact.id === "competitor_scope")?.status, "disclosed");
});

test("Freigabe bleibt im weiteren Replay erhalten", () => {
  const character = characterForScenario("S01");
  const { state, hiddenFacts, copied } = seedRepeatFromParent(character, parentTurns());
  assert.ok(copied.some((turn) => turn.speaker === "counterpart" && turn.text.includes(FACT)));
  assert.deepEqual(state.disclosedFacts, ["competitor_scope"]);
  assert.equal(hiddenFacts.find((fact) => fact.id === "competitor_scope")?.status, "disclosed");
});

test("Legacy-Freigabe bleibt unter Druck gesperrt, trotz passender Frage", () => {
  const character = characterForScenario("S01");
  character.initialState = { ...character.initialState, salesPressure: 80, irritation: 80 };
  const { hiddenFacts } = seedRepeatFromParent(character, parentTurns(), "c2");
  assert.equal(hiddenFacts.find((fact) => fact.id === "competitor_scope")?.status, "private");
});

test("Bloßes Zitieren eines Faktenwortlauts ist keine Freigabe", () => {
  const character = characterForScenario("S01");
  const turns: TranscriptTurn[] = [
    { id: "c1", speaker: "counterpart", text: "Warum sollte ich Ihnen zwölftausend Euro mehr zahlen?" },
    {
      id: "t1",
      speaker: "trainee",
      text: `Ich kenne Ihr Geheimnis: ${FACT}.`,
    },
    { id: "c2", speaker: "counterpart", text: "Fragen Sie nach dem Umfang, nicht nach Vermutungen." },
  ];
  const { copied, state, hiddenFacts } = seedRepeatFromParent(character, turns, "c2");
  assert.ok(copied.some((turn) => turn.speaker === "trainee" && turn.text.includes(FACT)));
  assert.ok(!copied.some((turn) => turn.speaker === "counterpart" && turn.text.includes(FACT)));
  assert.deepEqual(state.disclosedFacts, []);
  assert.equal(hiddenFacts.find((fact) => fact.id === "competitor_scope")?.status, "private");
});

test("Checkpoint erhält exakten Affekt und Freigabe ohne erneute Schlüsselwort-Erkennung", () => {
  const character = characterForScenario("S01");
  const checkpoint = {
    state: { ...character.initialState, trust: 67, irritation: 23, stateRevision: 9, disclosedFacts: ["competitor_scope"] },
    hiddenFacts: character.hiddenFacts.map((fact) => ({ ...fact, status: "disclosed" as const })),
  };
  const { state, hiddenFacts } = seedRepeatFromParent(character, parentTurns(), "c2", new Map([["t1", checkpoint]]));
  assert.equal(state.trust, 67);
  assert.equal(state.irritation, 23);
  assert.equal(state.stateRevision, 9);
  assert.equal(hiddenFacts[0].status, "disclosed");
  assert.notEqual(state, checkpoint.state);
});

test("Checkpoint der verworfenen schwachen Zeile wird nicht übernommen", () => {
  const character = characterForScenario("S01");
  const bad = { state: parentEndState(character), hiddenFacts: character.hiddenFacts };
  const { state } = seedRepeatFromParent(character, parentTurns(), "t2", new Map([["t2", bad]]));
  assert.notEqual(state.irritation, 92);
  assert.equal(state.stateRevision, 1);
});

test("Auswertung mit kopiertem Prefix beginnt am Figurenanfang, nie am Eltern-Ende", () => {
  const character = characterForScenario("S01");
  const initial = initialStateForEvaluation(character);
  assert.deepEqual(initial, character.initialState);
  assert.notEqual(initial.irritation, parentEndState(character).irritation);
});

test("ohne untilTurnId wird das ganze gesprochene Gespräch replayt, Systemzüge entfallen", () => {
  const character = characterForScenario("S01");
  const { copied, state } = seedRepeatFromParent(character, parentTurns());
  assert.deepEqual(
    copied.map((turn) => turn.id),
    ["c1", "t1", "c2", "t2", "c3"],
  );
  assert.equal(state.stateRevision, 2);
  assert.equal(state.status, "active");
  assert.equal(state.hangupReason, undefined);

  const sliced = seedRepeatFromParent(character, parentTurns(), "c2");
  assert.ok(state.irritation > sliced.state.irritation);
  assert.ok(state.salesPressure >= sliced.state.salesPressure);
});

test("stateRevision steigt monoton mit jedem kopierten Trainee-Zug", () => {
  const character = characterForScenario("S01");
  const none = seedRepeatFromParent(character, parentTurns().slice(0, 1), "c1");
  const one = seedRepeatFromParent(character, parentTurns(), "c2");
  const two = seedRepeatFromParent(character, parentTurns());
  assert.equal(none.state.stateRevision, 0);
  assert.equal(one.state.stateRevision, 1);
  assert.equal(two.state.stateRevision, 2);
  assert.ok(none.state.stateRevision < one.state.stateRevision);
  assert.ok(one.state.stateRevision < two.state.stateRevision);
});
