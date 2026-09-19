import assert from "node:assert/strict";
import { test } from "node:test";
import { characterForScenario } from "../characters";
import { affectivePacket, hydrateAffect, reduceAffect, spokenWithAffect, voiceFeelLabel } from "../affect";
import { extractVocal } from "../vocalChannel";
import { reduceState } from "../stateReducer";
import { extractObservations } from "../observationExtractor";

test("ruhige Stimme senkt Erregung und Irritation — Co-Regulation", () => {
  const character = characterForScenario("S01");
  const trainee = {
    id: "t2",
    speaker: "trainee" as const,
    text: "Ich höre. Lassen Sie sich Zeit. Kein Druck.",
  };
  const obs = extractObservations(character, trainee, [
    { id: "t1", speaker: "counterpart", text: character.opening },
  ]);
  const vocal = extractVocal(trainee.text, { durationMs: 4200, meanEnergy: 0.07, peakEnergy: 0.09, voicedMs: 3800 });
  assert.equal(vocal.rate, "calm");
  assert.equal(vocal.intensity, "soft");
  assert.equal(vocal.soothingLanguage, true);

  const before = character.initialState.irritation;
  const next = reduceState(character, character.initialState, obs, vocal);
  assert.ok(next.affect);
  assert.equal(next.affect.process, "co_regulation");
  assert.ok(next.affect.arousal < hydrateAffect(character, character.initialState).arousal);
  assert.ok(next.irritation < before);
  assert.equal(next.affect.voice.mood, "calm");
});

test("Provokation mit lauter, schneller Stimme hebt Ärger — Reaktanz", () => {
  const character = characterForScenario("S01");
  const trainee = {
    id: "t2",
    speaker: "trainee" as const,
    text: "Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen.",
  };
  const obs = extractObservations(character, trainee, [
    { id: "t1", speaker: "counterpart", text: character.opening },
  ]);
  const vocal = extractVocal(trainee.text, { durationMs: 1800, meanEnergy: 0.28, peakEnergy: 0.45, voicedMs: 1700 });
  assert.equal(vocal.controllingLanguage, true);
  assert.equal(vocal.intensity, "loud");

  const before = character.initialState.irritation;
  const next = reduceState(character, character.initialState, obs, vocal);
  assert.ok(next.affect);
  assert.ok(next.affect.process === "reactance" || next.affect.process === "withdrawal");
  assert.ok(next.irritation > before);
  assert.ok(next.affect.arousal > hydrateAffect(character, character.initialState).arousal);
  assert.equal(next.affect.voice.mood, "impatient");
});

test("Lachen und Mhm wärmen — Affiliation, nicht Spiegelneuron-Score", () => {
  const character = characterForScenario("S01");
  const laugh = extractVocal("Haha, das ist nett.", null);
  assert.equal(laugh.laughter, true);
  assert.equal(laugh.smileCue, true);
  const affect = reduceAffect(character, character.initialState, [], laugh);
  assert.equal(affect.process, "affiliation");
  assert.ok(affect.affiliation > hydrateAffect(character, character.initialState).affiliation);
  assert.ok(affect.voice.warmth === "smiling" || affect.voice.mood === "warm" || affect.voice.mood === "cheerful");

  const mhm = extractVocal("Mhm.", null);
  assert.equal(mhm.backchannel, true);
  const mhmAffect = reduceAffect(character, character.initialState, [], mhm);
  assert.ok(mhmAffect.affiliation >= affect.affiliation - 20);
});

test("Unterbrechen ist Face-Threat", () => {
  const character = characterForScenario("S01");
  const vocal = extractVocal("Moment mal", { durationMs: 600, meanEnergy: 0.14, peakEnergy: 0.2 }, { interrupted: true });
  assert.equal(vocal.overlapping, true);
  const affect = reduceAffect(
    character,
    character.initialState,
    [{ type: "interrupted_character", turnId: "t", evidence: "Moment mal", confidence: "high" }],
    vocal,
  );
  assert.equal(affect.process, "face_threat");
  assert.equal(affect.voice.mood, "skeptical");
});

test("Affect-Paket steuert Stimme, nicht die Rubrik", () => {
  const character = characterForScenario("S01");
  const state = reduceState(
    character,
    character.initialState,
    [],
    extractVocal("Ich höre. Kein Druck.", { durationMs: 3500, meanEnergy: 0.06, peakEnergy: 0.08 }),
  );
  const packet = affectivePacket(state, character);
  assert.match(packet, /INNERE LAGE/);
  assert.doesNotMatch(packet, /Rubrik|B1|B2|diagnosis|truthfulness/i);
  assert.match(packet, /ruhige Stimme beruhigt/i);
});

test("Alte Sitzungen ohne affect werden hydriert", () => {
  const character = characterForScenario("S01");
  const legacy = { ...character.initialState };
  delete legacy.affect;
  const hydrated = hydrateAffect(character, legacy);
  assert.ok(hydrated.arousal >= 0);
  assert.ok(hydrated.voice.mood);
});

test("Wortlaut folgt der Lage, Transkript bleibt ohne Audio-Tags", () => {
  const character = characterForScenario("S01");
  const affiliation = reduceAffect(
    character,
    character.initialState,
    [],
    extractVocal("Haha, das mag ich. Mhm.", { durationMs: 1600, meanEnergy: 0.11, peakEnergy: 0.14 }),
  );
  const colored = spokenWithAffect("Fragen Sie ruhig nach dem Umfang.", affiliation);
  assert.match(colored, /^Mhm\. /);
  assert.doesNotMatch(colored, /\[laughs\]|\[sighs\]/);
  assert.equal(voiceFeelLabel(affiliation), "wird wärmer");

  const withdraw = { ...affiliation, process: "withdrawal" as const, voice: { ...affiliation.voice, mood: "impatient" as const } };
  assert.equal(
    spokenWithAffect("Mir reicht es. Rufen Sie nicht mehr an. Auf Wiederhören.", withdraw),
    "Mir reicht es.",
  );
});
