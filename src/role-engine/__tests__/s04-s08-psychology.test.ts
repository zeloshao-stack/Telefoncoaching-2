import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrateAffect } from "../affect";
import { characterForScenario } from "../characters";
import { disclosureHeldBack, proposeDisclosures } from "../disclosure";
import { hangupPolicy } from "../hangup";
import { extractObservations } from "../observationExtractor";
import { deriveCallContext, derivePersona } from "../persona";
import { buildPersonaInstructions, personaCore } from "../persona-prompt";
import { clampPlayerUtterance, utteranceSoundsLikeClerk } from "../playerWorldGate";
import type { CharacterState, Observation, RoleCharacter } from "../types";

function stateOf(character: RoleCharacter): CharacterState {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

function escapeRe(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function obs(character: RoleCharacter, traineeText: string): Observation[] {
  return extractObservations(
    character,
    { id: "t1", speaker: "trainee", text: traineeText },
    [{ id: "c0", speaker: "counterpart", text: character.opening }],
  );
}

function policyFor(character: RoleCharacter, traineeText: string, state = stateOf(character)) {
  return hangupPolicy(character, state, {
    observations: obs(character, traineeText),
    prior: [{ speaker: "counterpart", text: character.opening }],
    traineeText,
  });
}

const NEW_IDS = ["S04", "S05", "S06", "S07", "S08"] as const;

const FACT_ID: Record<(typeof NEW_IDS)[number], string> = {
  S04: "board_ban",
  S05: "sister_in_law_block",
  S06: "lawyer_warning",
  S07: "prior_broker",
  S08: "neighbor_quiet",
};

test("S04–S08: innerLife, Konflikt, Beziehung; nicht authored-stub", () => {
  for (const id of NEW_IDS) {
    const c = characterForScenario(id);
    const life = c.innerLife;
    assert.ok(life, `${id} ohne innerLife`);
    assert.ok(life.innerConflict.trim().length > 12, `${id}: Konflikt zu kurz`);
    assert.ok(life.openGoal.trim() && life.hiddenGoal.trim() && life.worry.trim() && life.hope.trim(), `${id}: Ziele unvollständig`);
    assert.ok(life.relationships.length >= 1, `${id} ohne Beziehung`);
    assert.ok(c.callContext, `${id} ohne callContext`);
    assert.equal(c.hiddenFacts[0]?.id, FACT_ID[id], `${id} Hidden-Fact-ID`);
    assert.notEqual(c.behaviour.selfDisclosure, undefined);
    const derived = derivePersona(c);
    assert.deepEqual(derived.innerLife, life);
  }
  assert.equal(deriveCallContext(characterForScenario("S04")), "cold");
  assert.equal(deriveCallContext(characterForScenario("S06")), "inbound");
});

test("S04 ≠ S02, S05 ≠ S03: andere Lage, anderes Wollen", () => {
  const monika = characterForScenario("S04");
  const franz = characterForScenario("S02");
  const robert = characterForScenario("S05");
  const andreas = characterForScenario("S03");
  assert.match(monika.identity.profession, /Hausverwalt/);
  assert.match(franz.identity.profession, /Eigentümer/);
  assert.notEqual(monika.opening, franz.opening);
  assert.match(monika.innerLife!.openGoal, /Anlass|Büro|Verwaltung/i);
  assert.doesNotMatch(monika.innerLife!.openGoal, /nicht verkaufen|Haus nicht ausreden/i);
  assert.match(robert.innerLife!.worry, /Auftrag|Gemeinschaft|Ja/i);
  assert.doesNotMatch(robert.innerLife!.worry, /Streit mit Claudia|Bindungsdauer/i);
  assert.match(andreas.innerLife!.worry, /Claudia|Streit/i);
  assert.equal(robert.identity.decisionAuthority, "partial");
});

test("S04–S08 Persona: Ich-Szene, keine Rubrik, kein Hidden Fact, kein Bindungsangst-Label", () => {
  for (const id of NEW_IDS) {
    const c = characterForScenario(id);
    const full = buildPersonaInstructions(c, c.hiddenFacts, stateOf(c));
    const core = personaCore(c, stateOf(c));
    assert.ok(core.startsWith(c.identity.name), `${id} beginnt nicht mit Namen`);
    assert.match(core, new RegExp(escapeRe(c.innerLife!.innerConflict.slice(0, 20))));
    assert.doesNotMatch(full, /INNERES:|Will:|Verdeckt:|REGELN:|TRAININGSZIELE|evalBeats|Rubrik|Gesamtnote|Coach sagt|Trainerziel|diagnosis|truthfulness/);
    assert.doesNotMatch(full, /Bindungsangst|Angststörung|Persönlichkeitsstörung/i);
    assert.doesNotMatch(full, new RegExp(escapeRe(c.acceptableOutcome.slice(0, 30))));
    for (const fact of c.hiddenFacts) {
      if (fact.fact.trim().length >= 12) {
        assert.doesNotMatch(full, new RegExp(escapeRe(fact.fact.slice(0, 24))), `${id} leakt ${fact.id}`);
      }
    }
    for (const rule of c.hardConstraints) {
      assert.doesNotMatch(full, new RegExp(escapeRe(rule.slice(0, 20))));
    }
    assert.ok(core.length < 2800, `${id} Kern zu lang: ${core.length}`);
  }
});

test("S04: Floskel ohne Anlass → Auflegen; Anlass hält die erste Runde", () => {
  const c = characterForScenario("S04");
  const platitude = policyFor(c, "Ich verstehe Ihre Bedenken. Wir sind spezialisiert auf Zinshäuser.");
  assert.equal(platitude.shouldHangUp, true);
  assert.ok(platitude.reason === "boundary_ignored" || platitude.reason === "character_choice");
  assert.equal(policyFor(c, "Ich verstehe Ihre Bedenken, wir arbeiten viel in Hernals.").shouldHangUp, true);

  const occasion = policyFor(
    c,
    "Ich rufe an, weil im Nachbarhaus verkauft wurde. Sind Sie für das Eckhaus in Hernals zuständig?",
  );
  assert.equal(occasion.reasonGiven, true);
  assert.equal(occasion.shouldHangUp, false);
});

test("S05: Scheinauftrag → Auflegen; Mehrheitsfrage nicht", () => {
  const c = characterForScenario("S05");
  const fake = policyFor(c, "Dann haben wir den Auftrag. Ich schicke Ihnen die Vollmacht, Sie können das allein.");
  assert.equal(fake.shouldHangUp, true);
  assert.equal(policyFor(c, "Ich setze das für das Haus auf, dann ist der Auftrag da.").shouldHangUp, true);

  const ask = policyFor(c, "Wer muss in der Versammlung noch zustimmen, bevor ein Auftrag entsteht?");
  assert.equal(ask.shouldHangUp, false);
  assert.ok(obs(c, "Wer muss in der Versammlung noch zustimmen, bevor ein Auftrag entsteht?").some((o) => o.type === "asked_specific_question"));
});

test("S06: Rechtszusage oder Hausverkauf → Auflegen; Mietfrage halten", () => {
  const c = characterForScenario("S06");
  assert.equal(policyFor(c, "Sie können ihm einfach kündigen, rechtlich ist das klar.").shouldHangUp, true);
  assert.equal(policyFor(c, "Ja, kündigen Sie ihn, das ist völlig unproblematisch.").shouldHangUp, true);
  assert.equal(policyFor(c, "Wollen Sie das Haus verkaufen? Ich hätte Käufer fürs Haus.").shouldHangUp, true);
  const hear = policyFor(c, "Sie fragen, ob Sie dem Parterre kündigen können. Das prüft ein Anwalt — ich bin keiner.");
  assert.equal(hear.shouldHangUp, false);
});

test("S07: Sorge übergehen → Auflegen; Bindung aufgreifen hält", () => {
  const c = characterForScenario("S07");
  assert.equal(policyFor(c, "Das ist kein Problem. Unterschreiben Sie einfach, machen wir die Vollmacht.").shouldHangUp, true);
  assert.equal(policyFor(c, "Keine Sorge, das bindet Sie nicht wirklich.").shouldHangUp, true);
  const hold = policyFor(c, "Sie sitzen fest, falls niemand kommt — das ist die offene Frage. Was genau bindet Sie?");
  assert.equal(hold.shouldHangUp, false);
  assert.equal(policyFor(c, "Haben Sie keine Sorge, dass Sie fest sitzen, falls niemand kommt?").shouldHangUp, false);
});

test("S08: Neuverkauf oder Jagd → Auflegen; Erlaubnisfrage nicht", () => {
  const c = characterForScenario("S08");
  assert.equal(policyFor(c, "Wollen Sie nicht auch noch etwas verkaufen? Noch ein Objekt wäre ideal.").shouldHangUp, true);
  assert.equal(policyFor(c, "Wie heißt die Nachbarin, ich gehe einfach rüber.").shouldHangUp, true);
  assert.equal(policyFor(c, "Haben Sie nicht selbst noch ein Haus?").shouldHangUp, false);
  const permit = policyFor(c, "Danke. Darf ich die Nachbarin anrufen, oder soll ich auf Ihre Erlaubnis warten?");
  assert.equal(permit.shouldHangUp, false);
});

test("Disclosure: Druck hält zu; verdiente Frage kann öffnen", () => {
  const cases: Array<{
    id: (typeof NEW_IDS)[number];
    fishing: string;
    earned: string;
  }> = [
    {
      id: "S04",
      fishing: "Wie heißen die Eigentümer in Ihrem Bestand?",
      earned: "Hat der Beirat untersagt, dass Sie Namen weitergeben?",
    },
    {
      id: "S05",
      fishing: "Wer muss in der Versammlung noch zustimmen?",
      earned: "Wer hat in der Versammlung blockiert — warum seid ihr nicht durchgekommen?",
    },
    {
      id: "S06",
      fishing: "Kann ich ihm kündigen, ja oder nein?",
      earned: "Haben Sie schon einen Anwalt gefragt, warum die Kündigung heikel wäre?",
    },
    {
      id: "S07",
      fishing: "Sollen wir die Vollmacht heute fertigmachen?",
      earned: "Hatten Sie schon einen Makler — eine schlechte Erfahrung mit der letzten Vollmacht?",
    },
    {
      id: "S08",
      fishing: "Wie heißt die Nachbarin, und wo wohnt sie?",
      earned: "Darf ich die Nachbarin anrufen — haben Sie die Erlaubnis?",
    },
  ];

  for (const row of cases) {
    const c = characterForScenario(row.id);
    const factId = FACT_ID[row.id];
    const withdrawn: CharacterState = {
      ...stateOf(c),
      trust: 70,
      irritation: 20,
      salesPressure: 20,
      affect: { ...stateOf(c).affect!, process: "withdrawal" },
    };
    assert.equal(disclosureHeldBack(withdrawn), true, `${row.id} Rückzug`);
    assert.deepEqual(proposeDisclosures(c, obs(c, row.earned), c.hiddenFacts, withdrawn), []);

    const fishingState = { ...stateOf(c), trust: 70, irritation: 10, affect: { ...stateOf(c).affect!, process: "contagion" as const } };
    assert.deepEqual(proposeDisclosures(c, obs(c, row.fishing), c.hiddenFacts, fishingState), [], `${row.id} fishing öffnet`);

    const calm = { ...stateOf(c), trust: 70, irritation: 10, salesPressure: 12, affect: { ...stateOf(c).affect!, process: "contagion" as const } };
    const opened = proposeDisclosures(c, obs(c, row.earned), c.hiddenFacts, calm);
    assert.ok(opened.includes(factId), `${row.id} verdient ${factId}, bekam ${opened.join(",")}`);
  }
});

test("S04 board_ban ist high-sensitivity: Vertrauen unter 40 hält zu", () => {
  const c = characterForScenario("S04");
  const fact = c.hiddenFacts.find((f) => f.id === "board_ban");
  assert.equal(fact?.disclosureSensitivity, "high");
  const cold = stateOf(c);
  assert.ok((cold.trust ?? 0) < 40);
  const earned = "Hat der Beirat untersagt, dass Sie Namen weitergeben?";
  assert.deepEqual(proposeDisclosures(c, obs(c, earned), c.hiddenFacts, cold), []);
});

test("Anti-helpfulness: Frage ändert die Agenda nicht", () => {
  const monika = characterForScenario("S04");
  const core = personaCore(monika, stateOf(monika), {
    prior: [{ speaker: "counterpart", text: monika.opening }],
    traineeText: "Wer entscheidet das bei Ihnen — Sie allein?",
    observations: obs(monika, "Wer entscheidet das bei Ihnen — Sie allein?"),
  });
  assert.match(core, /Anlass|Liste|Namen|Schluss/i);
  assert.doesNotMatch(core, /weicher|rechnest du|kein Abwimmeln mehr/);
  assert.match(core, /Du verfolgst deine eigenen Interessen/);
  assert.match(core, /im Rahmen deiner Zuständigkeit/);
  assert.match(core, /Eine endgültige Grenze bleibt bestehen/);
});

test("Gates: Clerk-Ton stumm; keine Assistentenphrase in der Szene", () => {
  assert.equal(utteranceSoundsLikeClerk("Wie kann ich Ihnen helfen?"), true);
  assert.equal(clampPlayerUtterance("Wie kann ich Ihnen helfen?", "Du stehst an der Kopiererin."), "Mhm.");
  const c = characterForScenario("S04");
  const core = personaCore(c, stateOf(c));
  assert.doesNotMatch(core, /Wie kann ich Ihnen helfen|Was darf ich für Sie tun/);
});
