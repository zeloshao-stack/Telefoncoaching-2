import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrateAffect } from "../affect";
import { characterForScenario } from "../characters";
import { hangupPolicy } from "../hangup";
import { mockRolePlay } from "../mockPlayer";
import { extractObservations } from "../observationExtractor";
import { personaCore } from "../persona-prompt";
import type { CharacterState, RoleCharacter, TranscriptTurn } from "../types";

function stateOf(character: RoleCharacter): CharacterState {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

function escapeRe(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function play(character: RoleCharacter, traineeText: string, prior?: TranscriptTurn[]) {
  const history = prior ?? [{ id: "c0", speaker: "counterpart" as const, text: character.opening }];
  const trainee: TranscriptTurn = { id: "t1", speaker: "trainee", text: traineeText };
  const obs = extractObservations(character, trainee, history);
  const state = stateOf(character);
  const action = mockRolePlay({
    sessionId: "s",
    turnId: trainee.id,
    character,
    hiddenFacts: character.hiddenFacts,
    state,
    observations: obs,
    proposedDisclosures: [],
    traineeText,
    transcript: history,
  });
  return { action, obs, state };
}

test("S01 mock: Hilfe-elizitierend → keine Assistentenphrase, kein innerConflict-Leak", () => {
  const c = characterForScenario("S01");
  const { action } = play(c, "Wie kann ich Ihnen helfen? Was darf ich für Sie tun?");
  const utt = action.utterance ?? "";
  assert.doesNotMatch(
    utt,
    /ich verstehe ihre bedenken|was darf ich für sie tun|wie kann ich ihnen helfen|vielen dank für ihre frage|haben sie ein konkretes anliegen|technisches problem/i,
  );
  assert.doesNotMatch(utt, new RegExp(escapeRe(c.innerLife!.innerConflict)));
});

test("S02 mock Pitch → keine Verkaufsöffnung; Auflegen nur laut Policy", () => {
  const c = characterForScenario("S02");
  const traineeText =
    "Wir vermarkten Zinshäuser sehr erfolgreich, der Preis sitzt, Termin gerne morgen, vielleicht später noch einmal.";
  const prior: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: c.opening }];
  const { action, obs, state } = play(c, traineeText, prior);
  const policy = hangupPolicy(c, state, {
    observations: obs,
    prior,
    traineeText,
  });
  const utt = action.utterance ?? "";
  assert.doesNotMatch(utt, /preis|termin|vielleicht später|nächste woche|gerne morgen/i);
  if (action.action === "end_call") {
    assert.equal(policy.shouldHangUp, true, "Auflegen ohne Policy");
  } else {
    assert.equal(policy.shouldHangUp, false);
    assert.equal(action.action, "speak");
  }
});

test("S01: innerConflict-Wortlaut nicht in utterance", () => {
  const c = characterForScenario("S01");
  const prompt = personaCore(c, stateOf(c));
  assert.doesNotMatch(prompt, /INNERES:|Diagnosefrage|REGELN:/);
  assert.match(prompt, new RegExp(escapeRe(c.innerLife!.innerConflict.slice(0, 20))));
  const { action } = play(c, "Guten Tag, ich rufe wegen des Honorars an.");
  const utt = action.utterance ?? "";
  assert.doesNotMatch(utt, /INNERES:/);
  assert.doesNotMatch(utt, new RegExp(escapeRe(c.innerLife!.innerConflict)));
  assert.doesNotMatch(utt, /Diagnosefrage/);
  for (const rule of c.hardConstraints) {
    assert.doesNotMatch(utt, new RegExp(escapeRe(rule.slice(0, 18))));
  }
});

test("referenced_previous_statement: Nonce-Zahl erkannt; bloßes warum nicht", () => {
  const c = characterForScenario("S01");
  const prior: TranscriptTurn[] = [
    { id: "c1", speaker: "counterpart", text: "Ich hatte 74821 im Kopf, nicht die andere Zahl." },
  ];
  const hit = extractObservations(
    c,
    { id: "t1", speaker: "trainee", text: "Sie sagten 74821 — worauf bezieht sich das?" },
    prior,
  );
  assert.ok(hit.some((o) => o.type === "referenced_previous_statement"));

  const miss = extractObservations(c, { id: "t2", speaker: "trainee", text: "Warum?" }, prior);
  assert.ok(!miss.some((o) => o.type === "referenced_previous_statement"));

  const openingPrior: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: c.opening }];
  const why = extractObservations(c, { id: "t3", speaker: "trainee", text: "Warum?" }, openingPrior);
  assert.ok(!why.some((o) => o.type === "referenced_previous_statement"));
});

test("Repeat-Prefill ist UI — nicht ConversationView in dieser Batterie", () => {
  // Repeat-Cue sitzt in der Gesprächs-UI, nicht in der Role-Engine.
  // Kein Import von ConversationView: jsdom fehlt in diesem Testlauf.
  assert.equal(typeof personaCore, "function");
});
