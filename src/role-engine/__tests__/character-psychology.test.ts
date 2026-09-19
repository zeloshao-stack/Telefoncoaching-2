import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrateAffect, reduceAffect } from "../affect";
import { extractVocal } from "../vocalChannel";
import { characterForScenario } from "../characters";
import { disclosureHeldBack, proposeDisclosures } from "../disclosure";
import { hangupPolicy, hangupPromptLines } from "../hangup";
import { extractObservations } from "../observationExtractor";
import { buildPersonaInstructions, livedMemoryLine, personaCore } from "../persona-prompt";
import { clampPlayerUtterance, utteranceSoundsLikeClerk } from "../playerWorldGate";
import { reduceState } from "../stateReducer";
import type { CharacterState, RoleCharacter } from "../types";

function stateOf(character: RoleCharacter): CharacterState {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

test("Frage allein ist kein Anlass — Kaltakquise bleibt bei ihrer Agenda", () => {
  const franz = characterForScenario("S02");
  const state = stateOf(franz);
  const question = "Wer entscheidet das bei Ihnen — Sie allein?";
  const obs = extractObservations(
    franz,
    { id: "t1", speaker: "trainee", text: question },
    [{ id: "c0", speaker: "counterpart", text: franz.opening }],
  );
  assert.ok(obs.some((o) => o.type === "asked_specific_question"));

  const policy = hangupPolicy(franz, state, {
    observations: obs,
    prior: [{ speaker: "counterpart", text: franz.opening }],
    traineeText: question,
  });
  assert.equal(policy.reasonGiven, false);

  const sellQ = hangupPolicy(franz, state, {
    prior: [{ speaker: "counterpart", text: franz.opening }],
    traineeText: "Wollen Sie verkaufen?",
  });
  assert.equal(sellQ.reasonGiven, false);

  const core = personaCore(franz, state, {
    prior: [{ speaker: "counterpart", text: franz.opening }],
    traineeText: question,
    observations: obs,
  });
  assert.match(core, /Nein gesagt|Schluss/);
  assert.doesNotMatch(core, /was das konkret für dich heißt/);
  assert.doesNotMatch(core, /weicher/);
});

test("Echter Anlass überschreibt die Agenda nicht", () => {
  const cold = characterForScenario("S02");
  const state = stateOf(cold);
  const text = "Herr Berger, ich rufe an, weil im Nachbarhaus verkauft wurde.";
  const policy = hangupPolicy(cold, state, {
    prior: [{ speaker: "counterpart", text: cold.opening }],
    traineeText: text,
  });
  assert.equal(policy.reasonGiven, true);
  const core = personaCore(cold, state, {
    prior: [{ speaker: "counterpart", text: cold.opening }],
    traineeText: text,
  });
  assert.match(core, /Nein gesagt|Schluss/);
  assert.match(core, /Du verfolgst deine eigenen Interessen/);
  assert.match(core, /Eine endgültige Grenze bleibt bestehen/);
});

test("Auflege-Prompt rechnet Höflichkeit nicht als Auskunft an; Auflegen ist Wahl", () => {
  const lines = hangupPromptLines({
    context: "cold",
    inclination: 40,
    threshold: 70,
    brushOffsAllowed: 2,
    brushOffsSoFar: 0,
    reasonGiven: true,
    askedForTime: true,
    shouldHangUp: false,
    closingLine: "Auf Wiederhören.",
  });
  assert.doesNotMatch(lines, /rechnest du ihm an|kein Abwimmeln mehr|Du antwortest auf seine Frage/);
  assert.match(lines, /bleibt deine Sache/);

  const now = hangupPromptLines({
    context: "cold",
    inclination: 90,
    threshold: 70,
    brushOffsAllowed: 2,
    brushOffsSoFar: 2,
    reasonGiven: false,
    shouldHangUp: true,
    reason: "character_choice",
    closingLine: "Ich leg jetzt auf.",
  });
  assert.match(now, /deine Wahl, kein Leitungsfehler/);
  assert.match(now, /LEG JETZT AUF: Sag „Ich leg jetzt auf.“, dann end_call mit reason character_choice und last_line/);
});

test("Hidden Fact bleibt zu unter Rückzug; gleiche Frage ohne Druck kann öffnen", () => {
  const c = characterForScenario("S01");
  const obs = extractObservations(
    c,
    { id: "t1", speaker: "trainee", text: "Worin unterscheidet sich der Leistungsumfang?" },
    [{ id: "c0", speaker: "counterpart", text: c.opening }],
  );
  assert.ok(obs.some((o) => o.type === "asked_specific_question"));

  const calm = stateOf(c);
  assert.equal(disclosureHeldBack(calm), false);
  assert.ok(proposeDisclosures(c, obs, c.hiddenFacts, calm).includes("competitor_scope"));

  const withdrawn: CharacterState = {
    ...calm,
    affect: { ...calm.affect!, process: "withdrawal" },
    irritation: 70,
  };
  assert.equal(disclosureHeldBack(withdrawn), true);
  assert.deepEqual(proposeDisclosures(c, obs, c.hiddenFacts, withdrawn), []);
});

test("Reducer: konkrete Frage hebt Kompetenz, nicht Vertrauen", () => {
  const c = characterForScenario("S01");
  const before = c.initialState;
  const next = reduceState(c, before, [
    { type: "asked_specific_question", turnId: "t", evidence: "Worin liegt der Unterschied?", confidence: "high" },
  ]);
  assert.equal(next.trust, before.trust);
  assert.ok(next.perceivedCompetence > before.perceivedCompetence);
  assert.ok(next.interest > before.interest);
});

test("Weltgrenze: Clerk-Ton wird stumm gekappt", () => {
  const allowed = "Du sitzt am Tisch.";
  assert.equal(utteranceSoundsLikeClerk("Wie kann ich Ihnen helfen?"), true);
  assert.equal(clampPlayerUtterance("Wie kann ich Ihnen helfen?", allowed), "Mhm.");
  assert.equal(utteranceSoundsLikeClerk("Den Umfang, ja. Die Zahl allein sagt mir nichts."), false);
  assert.equal(
    clampPlayerUtterance("Den Umfang, ja. Die Zahl allein sagt mir nichts.", allowed),
    "Den Umfang, ja. Die Zahl allein sagt mir nichts.",
  );
});

test("Gedächtnis: eigener Satz nach der Eröffnung bleibt in der Szene", () => {
  const c = characterForScenario("S01");
  const prior = [
    { speaker: "counterpart", text: c.opening },
    { speaker: "trainee", text: "Guten Tag, Frau Leitner." },
    { speaker: "counterpart", text: "Die Zahl allein sagt mir nichts." },
  ];
  assert.match(livedMemoryLine(prior), /Die Zahl allein sagt mir nichts/);
  const full = buildPersonaInstructions(c, c.hiddenFacts, stateOf(c), { prior });
  assert.match(full, /Eben noch von dir: Die Zahl allein sagt mir nichts/);
  assert.match(full, /keine Zeile wiederholen/);
  assert.doesNotMatch(full, /Rubrik|Gesamtnote|Trainee|Coach sagt|Trainerziel/);
  assert.doesNotMatch(full, /INNERES:|REGELN:|Will:|Verdeckt:/);
});

test("S02: Sohn-Fakt bleibt privat; high-sensitivity braucht Vertrauen", () => {
  const franz = characterForScenario("S02");
  const fact = franz.hiddenFacts.find((f) => f.id === "son_ease");
  assert.ok(fact);
  assert.equal(fact.disclosureSensitivity, "high");
  const core = personaCore(franz, stateOf(franz));
  assert.doesNotMatch(core, /weniger Haus|lässt dir das Haus nicht ausreden/);
  assert.ok(franz.behaviour.selfDisclosure <= 2);

  const familyQ = "Spricht Ihr Sohn Thomas mit, oder entscheiden Sie allein?";
  const obs = extractObservations(
    franz,
    { id: "t1", speaker: "trainee", text: familyQ },
    [{ id: "c0", speaker: "counterpart", text: franz.opening }],
  );
  assert.deepEqual(proposeDisclosures(franz, obs, franz.hiddenFacts, stateOf(franz)), []);
  const warmer = { ...stateOf(franz), trust: 55, irritation: 12, affect: { ...stateOf(franz).affect!, process: "contagion" as const } };
  assert.ok(proposeDisclosures(franz, obs, franz.hiddenFacts, warmer).includes("son_ease"));
});

test("Affect: Lachen nach Face-Threat wärmt nicht — Trägheit", () => {
  const franz = characterForScenario("S02");
  const start = hydrateAffect(franz, franz.initialState);
  assert.equal(start.process, "face_threat");
  const afterLaugh = reduceAffect(franz, { ...franz.initialState, affect: start }, [], extractVocal("Haha, das ist nett.", null));
  assert.notEqual(afterLaugh.process, "affiliation");
  assert.ok(afterLaugh.process === "face_threat" || afterLaugh.process === "withdrawal" || afterLaugh.process === "contagion");
});

test("Persona-Kern: Stille erlaubt, keine Rubrik, Want aus innerLife ohne Kopf", () => {
  const c = characterForScenario("S01");
  const core = personaCore(c, stateOf(c));
  assert.match(core, /Stille/);
  assert.match(core, /Stille darf Stille bleiben/);
  assert.match(core, /Du verfolgst deine eigenen Interessen/);
  assert.match(core, /Eine gelöste Frage oder respektvolle Korrektur darf deine Haltung ändern/);
  assert.match(core, /Von ihm willst du/);
  assert.doesNotMatch(core, /weicher|rechnest du|kein Abwimmeln mehr/);
  assert.doesNotMatch(core, /FACE:|WANT:|Rubrik|Gesamtnote|Coach sagt/);
  assert.ok(core.length < 3000, `Kern zu lang: ${core.length}`);
});
