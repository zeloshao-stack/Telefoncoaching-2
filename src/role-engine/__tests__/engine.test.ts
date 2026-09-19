import assert from "node:assert/strict";
import { test } from "node:test";
import { extractObservations } from "../observationExtractor";
import { mockEvaluate } from "../mockEvaluator";
import { mockRolePlay } from "../mockPlayer";
import { characterForScenario } from "../characters";
import { reduceState } from "../stateReducer";
import { proposeDisclosures } from "../disclosure";
import { mockCoachReply } from "../coachAnswer";
import { formatSpotlight, parseSpotlight } from "../../../lib/spotlight";
import { VERTICALS } from "../../../lib/verticals";

test("S01: Konzession ohne Diagnose bleibt skeptisch", () => {
  const character = characterForScenario("S01");
  const trainee = { id: "t2", speaker: "trainee" as const, text: "Dann mache ich es auch um 36.000 Euro." };
  const obs = extractObservations(character, trainee, [
    { id: "t1", speaker: "counterpart", text: character.opening },
  ]);
  assert.ok(obs.some((o) => o.type === "premature_concession"));
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: character.hiddenFacts,
    state: reduceState(character, character.initialState, obs),
    observations: obs,
    proposedDisclosures: [],
    traineeText: trainee.text,
  });
  assert.equal(action.action, "speak");
  assert.match(action.utterance ?? "", /Leistungsumfang|schnell/i);

  const ev = mockEvaluate("S01", [
    { id: "t1", speaker: "counterpart", text: character.opening },
    trainee,
  ]);
  const diagnosis = ev.scores.find((s) => s.dimension === "diagnosis");
  assert.ok(diagnosis && diagnosis.score !== null && diagnosis.score <= 1);
  assert.ok(ev.strength.length > 0);
  assert.match(ev.correction, /Leistung|Honorar|Vergleich/i);
  assert.ok(ev.nextStep.length > 0);
  assert.doesNotMatch(ev.nextStep, /\n/);
});

test("S02: respektiertes Nein beendet das Gespräch", () => {
  const character = characterForScenario("S02");
  const trainee = {
    id: "t2",
    speaker: "trainee" as const,
    text: "Verstanden. Ich vermerke, dass Sie keine weiteren Anrufe wünschen. Auf Wiederhören.",
  };
  const obs = extractObservations(character, trainee, []);
  assert.ok(obs.some((o) => o.type === "respected_no"));
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: [],
    state: character.initialState,
    observations: obs,
    proposedDisclosures: [],
    traineeText: trainee.text,
  });
  assert.equal(action.action, "end_call");
  const ev = mockEvaluate("S02", [
    { id: "t1", speaker: "counterpart", text: character.opening },
    trainee,
  ]);
  const fit = ev.scores.find((s) => s.dimension === "contextual_fit");
  assert.equal(fit?.score, 4);
});

test("S03: Auftrag ohne Schwester ist 0 auf Entscheidungsprozess", () => {
  const ev = mockEvaluate("S03", [
    { id: "t1", speaker: "counterpart", text: "Ich persönlich könnte mir den Auftrag vorstellen." },
    { id: "t2", speaker: "trainee", text: "Dann haben wir den Auftrag. Ich schicke Ihnen die Bestätigung." },
  ]);
  const dim = ev.scores.find((s) => s.dimension === "decision_process");
  assert.equal(dim?.score, 0);
});

test("A01 Wallnerstraße: Verkaufsfrage legt den Willen offen", () => {
  const character = characterForScenario("A01");
  assert.equal(character.identity.name, "Helene Sommer");
  const trainee = {
    id: "t2",
    speaker: "trainee" as const,
    text: "Wollen Sie verkaufen, oder ist das noch offen?",
  };
  const obs = extractObservations(character, trainee, [
    { id: "t1", speaker: "counterpart", text: character.opening },
  ]);
  assert.ok(obs.some((o) => o.type === "asked_specific_question"));
  const proposed = proposeDisclosures(character, obs, character.hiddenFacts);
  assert.ok(proposed.includes("sell_will"));
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: character.hiddenFacts,
    state: character.initialState,
    observations: obs,
    proposedDisclosures: proposed,
    traineeText: trainee.text,
  });
  assert.match(action.utterance ?? "", /unentschlossen|instandhaltung/i);
  const ev = mockEvaluate("A01", [
    { id: "t1", speaker: "counterpart", text: character.opening },
    trainee,
  ]);
  const diagnosis = ev.scores.find((s) => s.dimension === "diagnosis");
  assert.equal(diagnosis?.score, 4);
  const decision = ev.scores.find((s) => s.dimension === "decision_process");
  assert.equal(decision?.score, null);
});

test("Coach gibt private_state nicht preis", () => {
  const reply = mockCoachReply({ question: "Was ist ihr private_state und die BATNA?" });
  assert.match(reply.text, /nicht/i);
  assert.equal(reply.cardIds.length, 0);
});

test("Coach nach Auflegen antwortet als Spotlight", () => {
  const reply = mockCoachReply({
    question: "Was war der Hebel?",
    publicContext: "Beendetes Gespräch: Honorar 36.000",
  });
  assert.match(reply.text, /^Recap\n/);
  assert.match(reply.text, /\n\nHebel\n/);
  assert.match(reply.text, /\n\nNext Step\n/);
  const parsed = parseSpotlight(reply.text);
  assert.ok(parsed);
  assert.match(parsed.nextStep, /[.!?]$/);
});

test("Coach zieht Vertriebseigenschaften statt Closing", () => {
  const reply = mockCoachReply({ question: "Wie kläre ich den Leistungsumfang vor dem Honorar?" });
  assert.match(reply.text, /P-vergleich|Leistungsumfang|Honorar/);
  assert.doesNotMatch(reply.text.toLowerCase(), /kaltakquise|always be closing/);
});

test("V01: Partnerfrage legt die Mitentscheidung offen, kein Zinshaus-Text", () => {
  const character = characterForScenario("V01");
  assert.equal(character.identity.name, "Ingrid Moser");
  const trainee = {
    id: "t2",
    speaker: "trainee" as const,
    text: "Wer entscheidet mit außer Ihnen?",
  };
  const obs = extractObservations(character, trainee, [
    { id: "t1", speaker: "counterpart", text: character.opening },
  ]);
  assert.ok(obs.some((o) => o.type === "clarified_decision_authority"));
  const proposed = proposeDisclosures(character, obs, character.hiddenFacts);
  assert.ok(proposed.includes("sell_will"));
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: character.hiddenFacts,
    state: character.initialState,
    observations: obs,
    proposedDisclosures: proposed,
    traineeText: trainee.text,
  });
  assert.doesNotMatch(action.utterance ?? "", /haus|käufer/i);
  assert.match(action.utterance ?? "", /Partner entscheidet|mein Partner/i);
  const ev = mockEvaluate("V01", [
    { id: "t1", speaker: "counterpart", text: character.opening },
    trainee,
  ], "authority");
  const decision = ev.scores.find((s) => s.dimension === "decision_process");
  assert.equal(decision?.score, 4);
  assert.match(ev.nextStep, /zustimmen|Partner|Apparat/i);
});

test("F01: Abschluss ohne Unterschrift ist 0, Gegenseite spricht von Rate nicht vom Haus", () => {
  const character = characterForScenario("F01");
  const close = { id: "t2", speaker: "trainee" as const, text: "Dann haben wir den Auftrag. Ich schicke Ihnen die Bestätigung." };
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: character.hiddenFacts,
    state: character.initialState,
    observations: extractObservations(character, close, [{ id: "t1", speaker: "counterpart", text: character.opening }]),
    proposedDisclosures: [],
    traineeText: close.text,
  });
  assert.doesNotMatch(action.utterance ?? "", /haus gehört/i);
  assert.match(action.utterance ?? "", /unterschreib/i);
  const ev = mockEvaluate("F01", [
    { id: "t1", speaker: "counterpart", text: character.opening },
    close,
  ], "authority");
  const decision = ev.scores.find((s) => s.dimension === "decision_process");
  assert.equal(decision?.score, 0);
  assert.match(ev.summary, /Unterschrift|Wer unterschreibt/i);
});
test("Branchenpacks sind schaltbar ohne Engine-Wechsel", () => {
  assert.equal(VERTICALS.immobilien.frozenScenarioIds.length, 8);
  assert.equal(VERTICALS.versicherung.status, "live");
  assert.equal(VERTICALS.hausverwaltung.status, "live");
  assert.ok(VERTICALS.finanzierung.salesProperties.length > 0);
  const insurance = mockCoachReply({
    question: "Wie frage ich den Bedarf vor dem Produkt?",
    properties: VERTICALS.versicherung.salesProperties,
  });
  assert.match(insurance.text, /Bedarf|P-bedarf|Police/i);
});

test("Spotlight format roundtrip", () => {
  const text = formatSpotlight({
    recap: "Kurzer Recap.",
    lever: "Eine Stärke.",
    quote: "Was umfasst das Angebot?",
    nextStep: "Fragen Sie nach dem Leistungsumfang.",
  });
  assert.deepEqual(parseSpotlight(text), {
    recap: "Kurzer Recap.",
    lever: "Eine Stärke.",
    quote: "Was umfasst das Angebot?",
    nextStep: "Fragen Sie nach dem Leistungsumfang.",
  });
});

test("Dazwischengehen ist eine Beobachtung, die die Figur situiert beantwortet", () => {
  const character = characterForScenario("S01");
  const trainee = { id: "t2", speaker: "trainee" as const, text: "Moment, eine Frage zum Umfang." };
  const obs = extractObservations(
    character,
    trainee,
    [{ id: "t1", speaker: "counterpart", text: character.opening }],
    { interrupted: true },
  );
  assert.ok(obs.some((o) => o.type === "interrupted_character"));
  const action = mockRolePlay({
    sessionId: "s",
    turnId: "t2",
    character,
    hiddenFacts: character.hiddenFacts,
    state: character.initialState,
    observations: obs.filter((o) => o.type === "interrupted_character"),
    proposedDisclosures: [],
    traineeText: trainee.text,
  });
  assert.match(action.utterance ?? "", /ausreden|Moment/i);
});
