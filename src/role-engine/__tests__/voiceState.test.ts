import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrateAffect, reduceAffect } from "../affect";
import { characterForScenario } from "../characters";
import { committedSpokenText, deliveryFor, deliveryFromVoice, deliveryInstruction, hasStageDirection } from "../delivery";
import { personaCore } from "../persona-prompt";
import type { CharacterAffect, CharacterState } from "../types";
import { extractVocal } from "../vocalChannel";
import { applyVoiceInertia, figurGapMs, voiceStateBlock, voiceStateFrom } from "../voiceState";

const PROCESS_LEAK =
  /co_regulation|reactance|withdrawal|face_threat|affiliation|contagion|arousal|feltSafety|pauseProfile|contourClass|\bheld\b|\breonset\b|\bstance\b|\breleased\b/i;

function withAffect(characterId: string, patch: Partial<CharacterAffect>): { character: ReturnType<typeof characterForScenario>; state: CharacterState } {
  const character = characterForScenario(characterId);
  const base = hydrateAffect(character, character.initialState);
  const state: CharacterState = {
    ...character.initialState,
    affect: { ...base, ...patch, voice: { ...base.voice, ...patch.voice } },
  };
  return { character, state };
}

test("niedriger feltSafety → hesitant und leisere Intensität", () => {
  const low = withAffect("S01", { feltSafety: 18, process: "contagion", voice: { mood: "skeptical", rate: "even", volume: "even", warmth: "flat", breath: "sigh" } });
  const high = withAffect("S01", { feltSafety: 72, process: "contagion", voice: { mood: "neutral", rate: "even", volume: "even", warmth: "neutral", breath: "normal" } });
  const lowVoice = voiceStateFrom(low.character, low.state);
  const highVoice = voiceStateFrom(high.character, high.state);
  assert.equal(lowVoice.pauseProfile, "hesitant");
  assert.ok(lowVoice.intensity < 0, `Intensität nicht leiser: ${lowVoice.intensity}`);
  assert.ok(lowVoice.intensity < highVoice.intensity, `${lowVoice.intensity} vs ${highVoice.intensity}`);
  assert.ok(lowVoice.speechRate < 0);
});

test("voiceStateBlock ohne Ziffern und ohne Prozessnamen; Pausen an der Satzgrenze", () => {
  const { character, state } = withAffect("S01", { feltSafety: 18, process: "contagion" });
  const block = voiceStateBlock(voiceStateFrom(character, state));
  assert.doesNotMatch(block, /\d/);
  assert.doesNotMatch(block, PROCESS_LEAK);
  assert.match(block, /Satz/);
  assert.doesNotMatch(block, /mitten im Wort.*Pause|Pause mitten/i);
});

test("Franz S02 bei Druck eher resistant als hesitant", () => {
  const franz = characterForScenario("S02");
  const pressed = reduceAffect(
    franz,
    franz.initialState,
    [{ type: "created_pressure", turnId: "t", evidence: "Sie müssen jetzt", confidence: "high" }],
    extractVocal("Sie müssen jetzt sofort unterschreiben!", { durationMs: 1500, meanEnergy: 0.3, peakEnergy: 0.5 }),
  );
  const vs = voiceStateFrom(franz, { ...franz.initialState, affect: pressed });
  assert.equal(vs.pauseProfile, "resistant");
  assert.notEqual(vs.pauseProfile, "hesitant");
});

test("Persona-Prompt trägt STIMME-Block, nicht JETZT, ohne Zahlenleck", () => {
  const { character, state } = withAffect("S01", { feltSafety: 22, process: "contagion" });
  const core = personaCore(character, state);
  assert.match(core, /^[\s\S]*STIMME: /m);
  assert.doesNotMatch(core, /^JETZT:/m);
  assert.doesNotMatch(core, /Erregung \d|Sicherheit \d|\/100/);
  const stimme = core.split("STIMME:")[1]?.split("\n")[0] ?? "";
  assert.doesNotMatch(stimme, /\d/);
  assert.doesNotMatch(stimme, PROCESS_LEAK);
});

test("Delivery bleibt 30–220 Zeichen, ohne Zahlen, calm/angry unterscheidbar", () => {
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
  for (const text of [deliveryInstruction(calm), deliveryInstruction(angry)]) {
    assert.doesNotMatch(text, /hörbares Ausatmen|Lachen darf|Wärme des Anrufers ein Stück|\[pause\]|\[sighs\]/i);
    assert.ok(!hasStageDirection(text), text);
  }
});

test("Face-Threat ist gehalten, nicht hesitant", () => {
  const hit = withAffect("S01", { feltSafety: 18, process: "face_threat", voice: { mood: "skeptical", rate: "even", volume: "firmer", warmth: "flat", breath: "held" } });
  const vs = voiceStateFrom(hit.character, hit.state);
  assert.equal(vs.pauseProfile, "resistant");
  assert.notEqual(vs.pauseProfile, "hesitant");
  assert.equal(vs.contourClass, "held");
});

test("Unterbrochener Status setzt Neu-Ansatz, nicht weitergeführte Lage", () => {
  const { character, state } = withAffect("S01", { process: "contagion" });
  const vs = voiceStateFrom(character, { ...state, status: "interrupted" });
  assert.equal(vs.contourClass, "reonset");
  const block = voiceStateBlock(vs);
  assert.match(block, /Neuer Einsatz|Satz/);
  assert.doesNotMatch(block, PROCESS_LEAK);
  assert.match(deliveryFromVoice(vs), /Neuer Einsatz|Melodie/i);
  assert.doesNotMatch(deliveryFromVoice(vs), PROCESS_LEAK);
});

test("Withdrawal ist Abgegeben-oder-weg, nicht hilfreiches Yield-Füllsel", () => {
  const { character, state } = withAffect("S02", {
    process: "withdrawal",
    valence: 10,
    arousal: 82,
    feltSafety: 22,
    voice: { mood: "impatient", rate: "faster", volume: "firmer", warmth: "flat", breath: "held" },
  });
  const vs = voiceStateFrom(character, state);
  assert.equal(vs.contourClass, "released");
  assert.equal(vs.pauseProfile, "resistant");
  assert.match(deliveryFromVoice(vs), /weg|Stille nicht füllen/i);
});

test("Dialekt bleibt an der Figur, auch nach Co-Regulation", () => {
  const elisabeth = characterForScenario("S01");
  const soothed = reduceAffect(
    elisabeth,
    elisabeth.initialState,
    [],
    extractVocal("Ich höre. Kein Druck.", { durationMs: 3500, meanEnergy: 0.06, peakEnergy: 0.08 }),
  );
  const before = voiceStateFrom(elisabeth, elisabeth.initialState);
  const after = voiceStateFrom(elisabeth, { ...elisabeth.initialState, affect: soothed });
  assert.ok(before.dialectStrength >= 0.4, `${before.dialectStrength}`);
  assert.equal(after.dialectStrength, before.dialectStrength);
  assert.notEqual(after.contourClass, "reonset");
  assert.match(deliveryFor(elisabeth, { ...elisabeth.initialState, affect: soothed }), /Person|Service|ruhig|langsamer|leiser|Wärme/i);
  assert.doesNotMatch(deliveryFor(elisabeth, { ...elisabeth.initialState, affect: soothed }), /Tempo und Wärme des Anrufers ein Stück/i);
});

test("Inertia: resistant kippt nicht in einem Zug nach reflective", () => {
  const { character, state } = withAffect("S02", { process: "reactance" });
  const pressed = voiceStateFrom(character, state);
  assert.equal(pressed.pauseProfile, "resistant");
  const easedAffect = {
    ...hydrateAffect(character, state),
    process: "co_regulation" as const,
    feltSafety: 80,
    arousal: 28,
    valence: 70,
    voice: { mood: "calm" as const, rate: "slower" as const, volume: "softer" as const, warmth: "warm" as const, breath: "normal" as const },
  };
  const rawEase = voiceStateFrom(character, { ...state, irritation: 10, affect: easedAffect });
  const lagged = applyVoiceInertia(pressed, rawEase);
  assert.notEqual(lagged.pauseProfile, "reflective");
  assert.ok(Math.abs(lagged.speechRate - pressed.speechRate) <= 0.28 + 1e-9);
  assert.ok(lagged.dialectStrength >= pressed.dialectStrength * 0.8);
});

test("Committed Take streicht Regie, erfindet kein Loch aus heard_ms", () => {
  assert.equal(committedSpokenText("[pause] [long pause] Hallo. [sighs]"), "Hallo.");
  assert.equal(committedSpokenText("Moment *seufz* bitte."), "Moment bitte.");
  assert.equal(committedSpokenText("<break time=\"2s\"/> Weiter."), "Weiter.");
  assert.equal(figurGapMs(), null);
  assert.equal(figurGapMs({ gapMs: null }), null);
  assert.equal(figurGapMs({ gapMs: 640 }), 640);
  assert.equal(figurGapMs({ gapMs: undefined }), null);
  assert.ok(hasStageDirection("[sighs] weiter"));
  assert.ok(!hasStageDirection("Naja. Das Haus in Hernals."));
});
