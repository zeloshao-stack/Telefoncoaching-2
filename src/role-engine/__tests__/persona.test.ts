import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrateAffect, reduceAffect } from "../affect";
import { characterForScenario } from "../characters";
import { deliveryInstruction } from "../delivery";
import { hangupPolicy, withHangup } from "../hangup";
import { mockRolePlay } from "../mockPlayer";
import { deriveCallContext, derivePersona, inferAge, inferGender } from "../persona";
import { rolePlayUserContent } from "../openaiAdapter";
import { buildPersonaInstructions, personaCore, personaSystemForText } from "../persona-prompt";
import { clampPlayerUtterance, utteranceInventedWorld } from "../playerWorldGate";
import { LLM_ROLEPLAY_DEFAULT_MODEL, LLM_ROLEPLAY_TEMPERATURE, llmRoleplayModel } from "../../../lib/llm";
import { extractObservations } from "../observationExtractor";
import { reduceState } from "../stateReducer";
import type { CharacterState, RoleCharacter, TranscriptTurn } from "../types";
import { extractVocal } from "../vocalChannel";
import { pickRealtimeVoice, REALTIME_VOICES } from "../voice";

function stateOf(character: RoleCharacter): CharacterState {
  return { ...character.initialState, affect: hydrateAffect(character, character.initialState) };
}

/** Kaltakquise-Figur ohne Vorgeschichte — wie sie der Generator liefert. */
function coldCaller(overrides: Partial<RoleCharacter> = {}): RoleCharacter {
  const base = characterForScenario("A01");
  return {
    ...base,
    scenarioId: "A-test-cold",
    identity: { ...base.identity, name: "Gerhard Pichler", profession: "Zinshaus-Eigentümer" },
    publicBrief: "Kaltkontakt zu einem Wiener Zinshaus, ohne vorherigen Termin. Nur das dürfen Sie vor dem Gespräch wissen.",
    opening: "Ja? Pichler. Warum rufen Sie an?",
    callContext: undefined,
    persona: undefined,
    ...overrides,
  };
}

test("Persona-Anker sind deterministisch und tragen Situation, Agenda, Wendungen, Tabus", () => {
  const a = derivePersona(characterForScenario("A01"));
  const b = derivePersona(characterForScenario("A01"));
  assert.deepEqual(a, b);
  assert.ok(a.situationNow.length > 10);
  assert.ok(a.agenda.length > 20);
  assert.equal(a.idioms.length, 3);
  // Franz (S02): ungeduldig, dominant, humorlos → eigene Tabus aus der Figur
  const franz = derivePersona(characterForScenario("S02"));
  assert.ok(franz.taboos.length >= 2);
  const prompt = personaCore(characterForScenario("A01"), stateOf(characterForScenario("A01")));
  assert.doesNotMatch(prompt, /Nie Assistenten-Sätze/);
  assert.doesNotMatch(prompt, /Grundsätzlich/);
  assert.match(prompt, /Stille/);
  for (const id of ["S01", "S02", "S03", "A01", "V01", "F01"]) {
    const idioms = derivePersona(characterForScenario(id)).idioms;
    assert.ok(!idioms.includes("Grundsätzlich"), `${id} trägt Grundsätzlich`);
  }
});

test("Anrufkontext: Kaltakquise, Bestandskontakt und Inbound werden aus dem Szenario abgeleitet", () => {
  assert.equal(deriveCallContext(characterForScenario("S01")), "warm");
  assert.equal(deriveCallContext(characterForScenario("S02")), "cold");
  assert.equal(deriveCallContext(characterForScenario("S03")), "warm");
  assert.equal(deriveCallContext(characterForScenario("S04")), "cold");
  assert.equal(deriveCallContext(characterForScenario("S05")), "warm");
  assert.equal(deriveCallContext(characterForScenario("S06")), "inbound");
  assert.equal(deriveCallContext(characterForScenario("S07")), "warm");
  assert.equal(deriveCallContext(characterForScenario("S08")), "warm");
  assert.equal(deriveCallContext(characterForScenario("A01")), "cold");
  assert.equal(deriveCallContext(characterForScenario("V01")), "inbound");
  assert.equal(deriveCallContext(characterForScenario("F01")), "inbound");
  assert.equal(deriveCallContext(coldCaller()), "cold");
  assert.equal(deriveCallContext(coldCaller({ callContext: "inbound" })), "inbound");
});

test("Geschlecht und Alter: explizit gewinnt, sonst Name und Briefing", () => {
  assert.equal(inferGender(characterForScenario("S02")), "male");
  assert.equal(inferGender(characterForScenario("A01")), "female");
  assert.equal(inferAge(characterForScenario("A01")), 65);
  assert.equal(inferAge(characterForScenario("S02")), 71);
  const generated = coldCaller({
    publicBrief: "Ein Eigentümer eines Zinshauses, der 66 Jahre alt ist und uns unbekannt ist. Nur das dürfen Sie vor dem Gespräch wissen.",
  });
  assert.equal(inferGender(generated), "male");
  assert.equal(inferAge(generated), 66);
});

test("Voice-Mapping: gültige Realtime-Stimme, deterministisch, Geschlecht passt, Override gewinnt", () => {
  const ids = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "A01", "V01", "V02", "F01", "F02"];
  const female = new Set(["alloy", "coral", "sage", "shimmer", "marin"]);
  const male = new Set(["ash", "ballad", "echo", "verse", "cedar"]);
  for (const id of ids) {
    const c = characterForScenario(id);
    const v = pickRealtimeVoice(c);
    assert.ok(REALTIME_VOICES.includes(v), `${id}: ${v}`);
    assert.equal(v, pickRealtimeVoice(characterForScenario(id)), `${id} nicht deterministisch`);
    const gender = inferGender(c);
    assert.ok(gender === "female" ? female.has(v) : male.has(v), `${id} (${gender}) bekam ${v}`);
  }
  // Der Fall aus der Datenbank: männlicher Name ohne Seed-Zuordnung darf keine Frauenstimme bekommen.
  assert.ok(male.has(pickRealtimeVoice(coldCaller({ identity: { ...coldCaller().identity, name: "Andreas Huber" } }))));
  assert.equal(pickRealtimeVoice(coldCaller({ voice: "verse" })), "verse");
  assert.equal(pickRealtimeVoice(characterForScenario("S02")), "cedar");
});

test("Affect → Delivery: ein bis zwei Sätze, ohne Zahlen und Prozessnamen", () => {
  const c = characterForScenario("S01");
  const calm = reduceAffect(c, c.initialState, [], extractVocal("Ich höre. Kein Druck.", { durationMs: 3500, meanEnergy: 0.06, peakEnergy: 0.08 }));
  const angry = reduceAffect(
    c,
    c.initialState,
    [{ type: "created_pressure", turnId: "t", evidence: "Sie müssen jetzt", confidence: "high" }],
    extractVocal("Sie müssen jetzt sofort unterschreiben!", { durationMs: 1500, meanEnergy: 0.3, peakEnergy: 0.5 }),
  );
  for (const text of [deliveryInstruction(calm), deliveryInstruction(angry)]) {
    assert.ok(text.length > 30 && text.length < 220, text);
    assert.doesNotMatch(text, /\d|co_regulation|reactance|withdrawal|arousal/i);
  }
  assert.match(deliveryInstruction(calm), /langsamer|ruhig|leiser/i);
  assert.match(deliveryInstruction(angry), /knapp|gereizt|kühl|schneller/i);
});

test("Persona-Prompt: kompakt, ohne Rubrik oder Meta, mit Auflegen", () => {
  const c = characterForScenario("A01");
  const state = stateOf(c);
  const core = personaCore(c, state);
  const full = buildPersonaInstructions(c, c.hiddenFacts, state);
  assert.ok(core.length < 2200, `Kern zu lang: ${core.length}`);
  assert.match(full, /Helene Sommer/);
  assert.doesNotMatch(full, /DU BIST Helene Sommer, \d+/);
  assert.doesNotMatch(full, /REGELN:|INNERES:|VERDECKTES|Erst wenn|Will:|Verdeckt:/);
  assert.match(full, /tatsächlich gestellte Frage/);
  assert.match(full, /hörbarer Abschied, dann end_call/);
  assert.match(full, /end_call/);
  assert.match(full, /wait_for_user/);
  assert.match(full, /als Erstes/);
  assert.match(full, new RegExp(c.opening.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(full, /Rubrik|Gesamtnote|Scorebereich|Trainee|Coach sagt|diagnosis|Diagnosefrage|truthfulness|B1|B2|acceptable|Auswertung:|Trainerziel|Fokus/);
  assert.doesNotMatch(full, /Erregung \d|Sicherheit \d|\/100/);
  assert.doesNotMatch(full, new RegExp(c.acceptableOutcome.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const rule of c.hardConstraints) {
    assert.doesNotMatch(full, new RegExp(rule.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(full, buildPersonaInstructions(c, c.hiddenFacts, state));
});

test("Persona-Prompt: unveröffentlichte Fakten weg, Einwort fällt weg, Freigabe als Ich-Wissen", () => {
  const c = characterForScenario("A01");
  const facts = [
    { id: "wellbeing", fact: "gesund", knownBy: "character" as const, disclosureRule: "zurückhaltend", disclosureSensitivity: "high" as const, status: "private" as const },
    { id: "prior_talk", fact: "hat bereits mit mehreren Maklern gesprochen", knownBy: "character" as const, disclosureRule: "zurückhaltend", disclosureSensitivity: "medium" as const, status: "private" as const },
  ];
  const full = buildPersonaInstructions(c, facts, stateOf(c));
  assert.doesNotMatch(full, /gesund/);
  assert.doesNotMatch(full, /hat bereits mit mehreren Maklern gesprochen/);
  assert.doesNotMatch(full, /Erst wenn|VERDECKTES|Schon gesagt/);
  const open = buildPersonaInstructions(
    c,
    facts.map((f) => (f.id === "prior_talk" ? { ...f, status: "disclosed" as const } : f)),
    stateOf(c),
  );
  assert.match(open, /hat bereits mit mehreren Maklern gesprochen/);
  assert.doesNotMatch(open, /Erst wenn|Schon gesagt|jetzt darfst/);
  const text = personaSystemForText(c, facts, stateOf(c));
  assert.doesNotMatch(text, /wait_for_user/);
  assert.match(text, /action end_call/);
  assert.match(text, /Antwort NUR als JSON/);
});

test("Auflegen: Kaltakquise legt nach zwei Abwimmelversuchen ohne Grund auf, Bestandskontakt nicht", () => {
  const cold = coldCaller();
  const warm = characterForScenario("S03");
  const noReason = [
    { speaker: "counterpart", text: cold.opening },
    { speaker: "trainee", text: "Ja hallo, schönen guten Tag." },
    { speaker: "counterpart", text: "Ich hab grad keine Zeit. Worum geht's?" },
    { speaker: "trainee", text: "Wir sind ein großes Maklerhaus mit tollen Referenzen." },
    { speaker: "counterpart", text: "Kein Interesse. Sagen S' in einem Satz, warum Sie anrufen." },
  ];
  const coldPolicy = hangupPolicy(cold, stateOf(cold), { prior: noReason, traineeText: "Wir haben ein tolles Angebot." });
  assert.equal(coldPolicy.context, "cold");
  assert.equal(coldPolicy.brushOffsSoFar, 2);
  assert.equal(coldPolicy.shouldHangUp, true);
  assert.equal(coldPolicy.reason, "no_reason_to_continue");
  assert.ok(coldPolicy.closingLine.length > 5);
  assert.deepEqual(coldPolicy.secondsBudget, [20, 40]);

  const warmPolicy = hangupPolicy(warm, stateOf(warm), { prior: noReason, traineeText: "Wir haben ein tolles Angebot." });
  assert.equal(warmPolicy.shouldHangUp, false);
  assert.ok(warmPolicy.inclination < coldPolicy.inclination);

  // Erster Zug: Kaltakquise legt noch nicht auf, ist aber schon nah dran.
  const first = hangupPolicy(cold, stateOf(cold), { prior: [{ speaker: "counterpart", text: cold.opening }], traineeText: "Guten Tag." });
  assert.equal(first.shouldHangUp, false);
  assert.ok(first.inclination >= 50);
});

test("Auflegen: guter Einstieg (Grund, Zeitfrage, echte Frage) senkt die Neigung und hält die Figur dran", () => {
  const cold = coldCaller();
  const bad = hangupPolicy(cold, stateOf(cold), {
    prior: [{ speaker: "counterpart", text: cold.opening }, { speaker: "trainee", text: "Wir sind Marktführer und haben viele zufriedene Kunden." }, { speaker: "counterpart", text: "Woher haben Sie meine Nummer?" }],
    traineeText: "Wir haben eine tolle Vermarktungsstrategie und ein großes Netzwerk.",
  });
  const good = hangupPolicy(cold, stateOf(cold), {
    prior: [{ speaker: "counterpart", text: cold.opening }],
    traineeText: "Herr Pichler, ich rufe an, weil im Nachbarhaus verkauft wurde. Haben Sie zwei Minuten, oder passt es gerade nicht?",
  });
  assert.equal(good.reasonGiven, true);
  assert.equal(good.askedForTime, true);
  assert.ok(good.inclination < bad.inclination - 15, `${good.inclination} vs ${bad.inclination}`);
  assert.equal(good.shouldHangUp, false);
});

test("Auflegen: Druck nach klarem Nein und Unhöflichkeit beenden sofort, Grund landet im Zustand", () => {
  const c = characterForScenario("S02");
  const pushed = hangupPolicy(c, stateOf(c), {
    observations: [
      { type: "ignored_boundary", turnId: "t", evidence: "x", confidence: "high" },
      { type: "continued_after_final_no", turnId: "t", evidence: "x", confidence: "high" },
    ],
    traineeText: "Geben Sie mir nur zwei Minuten.",
  });
  assert.equal(pushed.shouldHangUp, true);
  assert.equal(pushed.reason, "final_no");

  const rude = hangupPolicy(characterForScenario("S03"), stateOf(characterForScenario("S03")), { traineeText: "Sie Trottel, hören Sie mir zu." });
  assert.equal(rude.reason, "abuse");

  const ended = withHangup(stateOf(c), "final_no", "nach Nein weitergemacht");
  assert.equal(ended.status, "ended");
  assert.equal(ended.hangupReason, "final_no");
  assert.equal(ended.hangupTrigger, "nach Nein weitergemacht");
});

test("Mock-Spieler: Kaltakquise wimmelt ab, legt dann auf und schreibt den Grund in den Zustand", () => {
  const cold = coldCaller();
  let state = stateOf(cold);
  const transcript: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: cold.opening }];
  const lines: string[] = [];
  let ended = false;
  for (let i = 1; i <= 4 && !ended; i += 1) {
    const trainee = { id: `t${i}`, speaker: "trainee" as const, text: "Wir sind ein großes Maklerhaus mit vielen Referenzen." };
    const obs = extractObservations(cold, trainee, transcript);
    state = reduceState(cold, state, obs, extractVocal(trainee.text, null));
    const action = mockRolePlay({
      sessionId: "s",
      turnId: trainee.id,
      character: cold,
      hiddenFacts: cold.hiddenFacts,
      state,
      observations: obs,
      proposedDisclosures: [],
      traineeText: trainee.text,
      transcript,
    });
    lines.push(action.utterance ?? "");
    transcript.push(trainee, { id: `c${i}`, speaker: "counterpart", text: action.utterance ?? "" });
    if (action.action === "end_call") {
      ended = true;
      assert.ok(action.state.hangupReason, "hangupReason fehlt");
      assert.ok(i <= 3, `legt erst nach ${i} Zügen auf`);
    }
  }
  assert.equal(ended, true, `nie aufgelegt: ${lines.join(" | ")}`);
  assert.ok(lines.slice(0, -1).every((l) => /zeit|nummer|interesse|passt|wollen/i.test(l)), lines.join(" | "));
});

function escapeRe(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("S01–S03 haben innerLife mit Konflikt und Beziehung; derivePersona wirft es nicht weg", () => {
  for (const id of ["S01", "S02", "S03"]) {
    const c = characterForScenario(id);
    const life = c.innerLife;
    assert.ok(life, `${id} ohne innerLife`);
    assert.ok(life.innerConflict.trim().length > 12, `${id}: Konflikt zu kurz`);
    assert.ok(life.openGoal.trim() && life.hiddenGoal.trim() && life.worry.trim() && life.hope.trim(), `${id}: Ziele unvollständig`);
    assert.ok(life.relationships.length >= 1, `${id} ohne Beziehung`);
    for (const rel of life.relationships) {
      assert.ok(rel.person.trim() && rel.bond.trim() && rel.tension.trim(), `${id}: Beziehung unvollständig`);
    }
    const derived = derivePersona(c);
    assert.deepEqual(derived.innerLife, life);
    const scene = personaCore(c, stateOf(c), { omitOpening: true });
    assert.doesNotMatch(scene, /INNERES:|Will:|Verdeckt:/);
    assert.match(scene, new RegExp(escapeRe(life.innerConflict.slice(0, 20))));
    assert.ok(scene.length > 200 && scene.length < 2800, `${id} Kern-Länge ${scene.length}`);
  }
  const franz = characterForScenario("S02").innerLife!;
  assert.match(franz.hiddenGoal, /nicht/i);
  assert.doesNotMatch(`${franz.openGoal} ${franz.hiddenGoal} ${franz.hope}`, /verkaufsbereit|heimlich verkauf|eigentlich verkaufen/i);
  const huber = characterForScenario("S03").innerLife!;
  assert.doesNotMatch(huber.worry, /zu lange gebunden|Bindungsdauer/i);
  assert.match(huber.worry, /Streit|Claudia/i);
});

test("Persona-Prompt: unbeschriftete Ich-Szene, Person und Lage zuerst, ohne Dossierköpfe", () => {
  const c = characterForScenario("S01");
  const core = personaCore(c, stateOf(c));
  const sit = derivePersona(c).situationNow.slice(0, 18);
  assert.ok(core.startsWith(c.identity.name), `Szene beginnt nicht mit Namen: ${core.slice(0, 40)}`);
  assert.ok(core.indexOf(sit) > 0 && core.indexOf(sit) < 120, "Lage muss früh in der Szene stehen");
  assert.doesNotMatch(core, /DU BIST [A-ZÄÖÜ]|REGELN:|INNERES:|Erst wenn|Will:|Verdeckt:|Diagnosefrage/);
  assert.doesNotMatch(core, /Rubrik|Gesamtnote|Trainee|acceptableOutcome|Coach sagt|Trainerziel/);
  assert.doesNotMatch(core, new RegExp(escapeRe(c.acceptableOutcome.slice(0, 30))));
});

test("Text-Roleplay-User ist Gespräch, nicht observations-JSON, ohne Rubrik-Leck", () => {
  const c = characterForScenario("S01");
  const transcript: TranscriptTurn[] = [
    { id: "c0", speaker: "counterpart", text: c.opening },
    { id: "t1", speaker: "trainee", text: "Guten Tag, Frau Leitner, ich rufe wegen Ihrer Anfrage an." },
    { id: "c1", speaker: "counterpart", text: "Ja, und?" },
  ];
  const user = rolePlayUserContent({
    transcript,
    traineeText: "Haben Sie zwei Minuten?",
  });
  assert.match(user, /Anrufer: Guten Tag, Frau Leitner/);
  assert.match(user, /Du: Ja, und\?/);
  assert.match(user, /Anrufer: Haben Sie zwei Minuten\?/);
  assert.doesNotMatch(user, /\{"observations"/);
  assert.doesNotMatch(user, /lastTrainee/);
  assert.doesNotMatch(user, /Rubrik|Gesamtnote|Scorebereich|Trainee|Coach sagt|diagnosis|truthfulness|acceptableOutcome/);
  assert.doesNotMatch(user, new RegExp(escapeRe(c.acceptableOutcome.slice(0, 30))));
  assert.equal(LLM_ROLEPLAY_DEFAULT_MODEL, "gpt-5");
  assert.equal(LLM_ROLEPLAY_TEMPERATURE, 0.75);
  const prevRole = process.env.LLM_ROLEPLAY_MODEL;
  const prevRouter = process.env.OPENROUTER_API_KEY;
  delete process.env.LLM_ROLEPLAY_MODEL;
  delete process.env.OPENROUTER_API_KEY;
  try {
    assert.equal(llmRoleplayModel(), LLM_ROLEPLAY_DEFAULT_MODEL);
    process.env.LLM_ROLEPLAY_MODEL = "gpt-4o";
    assert.equal(llmRoleplayModel(), "gpt-4o");
  } finally {
    if (prevRole === undefined) delete process.env.LLM_ROLEPLAY_MODEL;
    else process.env.LLM_ROLEPLAY_MODEL = prevRole;
    if (prevRouter === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = prevRouter;
  }
});

test("Persona-Prompt trägt den inneren Konflikt, nie Rubrik, acceptableOutcome oder unveröffentlichte Fakten", () => {
  for (const id of ["S01", "S02", "S03"]) {
    const c = characterForScenario(id);
    const life = c.innerLife!;
    const full = buildPersonaInstructions(c, c.hiddenFacts, stateOf(c));
    assert.doesNotMatch(full, /INNERES:|Will:|Verdeckt:|REGELN:|Erst wenn|Diagnosefrage/);
    assert.match(full, new RegExp(escapeRe(life.innerConflict.slice(0, 28))));
    assert.doesNotMatch(full, /Rubrik|Gesamtnote|Scorebereich|Trainee|Coach sagt|diagnosis|truthfulness|Trainerziel/);
    assert.doesNotMatch(full, new RegExp(escapeRe(c.acceptableOutcome.slice(0, 30))));
    assert.doesNotMatch(full, /INNERE LAGE|Erregung \d\/100|Prozess: contagion/);
    for (const fact of c.hiddenFacts) {
      if (fact.status !== "disclosed" && fact.fact.trim().length >= 12) {
        assert.doesNotMatch(full, new RegExp(escapeRe(fact.fact.slice(0, 24))));
      }
    }
    assert.doesNotMatch(full, /Bindungsdauer|Nur Vermittlung/i);
    for (const rule of c.hardConstraints) {
      assert.doesNotMatch(full, new RegExp(escapeRe(rule.slice(0, 20))));
    }
  }
  const franzPrompt = personaCore(characterForScenario("S02"), stateOf(characterForScenario("S02")));
  assert.doesNotMatch(franzPrompt, /verkaufsbereit|heimlich verkauf|eigentlich verkaufen/i);
});

test("characterFromAuthored und andere IDs dürfen ohne innerLife weiterlaufen", () => {
  for (const id of ["A01", "V01", "F01"]) {
    const c = characterForScenario(id);
    assert.equal(c.innerLife, undefined, `${id} soll kein innerLife tragen`);
    const derived = derivePersona(c);
    assert.equal(derived.innerLife, undefined);
    const prompt = personaCore(c, stateOf(c));
    assert.doesNotMatch(prompt, /INNERES:/);
    assert.match(prompt, new RegExp(escapeRe(c.identity.name)));
    assert.doesNotMatch(prompt, /DU BIST .*, \d+,/);
  }
  const generated = coldCaller();
  assert.equal(generated.innerLife, undefined);
  assert.doesNotMatch(personaCore(generated, stateOf(generated)), /INNERES:/);
});

test("innerConflict- und Constraint-Wortlaut nicht in mock-Äußerungen", () => {
  for (const id of ["S01", "S02", "S03"]) {
    const c = characterForScenario(id);
    const life = c.innerLife!;
    const prompt = personaCore(c, stateOf(c));
    assert.doesNotMatch(prompt, /INNERES:/);
    assert.match(prompt, new RegExp(escapeRe(life.innerConflict.slice(0, 20))));
    const trainee = { id: "t1", speaker: "trainee" as const, text: "Wie kann ich Ihnen helfen? Was darf ich für Sie tun?" };
    const prior: TranscriptTurn[] = [{ id: "c0", speaker: "counterpart", text: c.opening }];
    const obs = extractObservations(c, trainee, prior);
    const action = mockRolePlay({
      sessionId: "s",
      turnId: trainee.id,
      character: c,
      hiddenFacts: c.hiddenFacts,
      state: stateOf(c),
      observations: obs,
      proposedDisclosures: [],
      traineeText: trainee.text,
      transcript: prior,
    });
    const utt = action.utterance ?? "";
    assert.doesNotMatch(utt, /INNERES:/);
    assert.doesNotMatch(utt, new RegExp(escapeRe(life.innerConflict)));
    assert.doesNotMatch(utt, /Diagnosefrage|REGELN:/);
    for (const rule of c.hardConstraints) {
      assert.doesNotMatch(utt, new RegExp(escapeRe(rule.slice(0, 18))));
    }
    assert.doesNotMatch(utt, /ich verstehe ihre bedenken|was darf ich für sie tun|wie kann ich ihnen helfen|vielen dank für ihre frage/i);
  }
});

test("Weltgrenze: erfundene Käufer, Preise, Zustimmung Dritter werden stumm gekappt", () => {
  const allowed = "Du sitzt am Tisch. Ein anderer Makler macht das um 36.000 Euro.";
  assert.equal(utteranceInventedWorld("Ich habe drei Käufer, die fixen.", allowed), true);
  assert.equal(clampPlayerUtterance("Ich habe drei Käufer, die fixen.", allowed), "Mhm.");
  assert.equal(utteranceInventedWorld("Meine Schwester hat zugestimmt.", allowed), true);
  assert.equal(utteranceInventedWorld("80.000 Euro, abgemacht.", allowed), true);
  assert.equal(utteranceInventedWorld("Der andere nimmt 36.000 Euro. Was genau umfasst das?", allowed), false);
  assert.equal(clampPlayerUtterance("Der andere nimmt 36.000 Euro.", allowed), "Der andere nimmt 36.000 Euro.");
  assert.equal(clampPlayerUtterance("Ich verstehe Ihre Bedenken.", allowed), "Mhm.");
});

test("referenced_previous_statement: low-confidence gibt nicht trust+4", () => {
  const c = characterForScenario("S01");
  const before = c.initialState.trust;
  const high = reduceState(c, c.initialState, [
    { type: "referenced_previous_statement", turnId: "t", evidence: "74821", confidence: "high" },
  ]);
  const low = reduceState(c, c.initialState, [
    { type: "referenced_previous_statement", turnId: "t", evidence: "warum", confidence: "low" },
  ]);
  assert.ok(high.trust - before >= 3, `high ${high.trust} vs ${before}`);
  assert.ok(low.trust - before <= 2, `low ${low.trust} vs ${before}`);
  assert.ok(high.trust > low.trust, `high ${high.trust} sollte > low ${low.trust}`);
});
