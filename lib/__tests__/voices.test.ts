import assert from "node:assert/strict";
import { test } from "node:test";
import { getSeedVoice, pickBrowserVoice, prepareSpokenText, toAzureSsml, toElevenSpokenText, elevenVoiceFor, voiceIdForScenario } from "../voices";

test("feste Fälle bekommen die passende Telefonstimme", () => {
  assert.equal(voiceIdForScenario("S01"), "elisabeth");
  assert.equal(voiceIdForScenario("S02"), "franz");
  assert.equal(voiceIdForScenario("S03"), "andreas");
  assert.equal(voiceIdForScenario("A01", "Helene Sommer"), "helene");
  assert.equal(voiceIdForScenario("V01", "Ingrid Moser"), "tanja");
  assert.equal(voiceIdForScenario("V02", "Martin Hofer"), "bernd");
  assert.equal(voiceIdForScenario("F01", "Thomas Lang"), "andreas");
  assert.equal(voiceIdForScenario("F02", "Sabine Reiter"), "clara");
  assert.equal(voiceIdForScenario("custom-1", "Unbekannt"), "helene");
});

test("gesprochener Text bleibt knapp und hörbar", () => {
  assert.equal(prepareSpokenText("  Guten Tag.   Warum rufen Sie an?  "), "Guten Tag. Warum rufen Sie an?");
  assert.equal(prepareSpokenText("Moment … das Haus — es gehört uns."), "Moment. das Haus, es gehört uns.");
  assert.throws(() => prepareSpokenText("   "), /Kein Text/);
});

test("Browserstimmen werden nach Region und Geschlecht getrennt", () => {
  const voices = [
    { name: "Anna", lang: "de-DE" },
    { name: "Microsoft Stefan", lang: "de-DE" },
    { name: "Helena", lang: "de-AT" },
    { name: "Grandpa", lang: "de-DE" },
  ];
  const woman = pickBrowserVoice(voices, { id: "elisabeth", gender: "female", ageBand: "older", locale: "de-AT" });
  assert.equal(woman?.name, "Helena");
  const man = pickBrowserVoice(voices, { id: "franz", gender: "male", ageBand: "older", locale: "de-AT" });
  assert.equal(man?.name, "Grandpa");
  const otherMan = pickBrowserVoice(voices, { id: "andreas", gender: "male", ageBand: "mid", locale: "de-DE" });
  assert.ok(otherMan && otherMan.name !== woman?.name);
});

test("Azure-SSML trägt österreichische Stimme und Pausen", () => {
  const spec = getSeedVoice("elisabeth");
  assert.ok(spec);
  const ssml = toAzureSsml(spec, "Grüß Gott. Warum rufen Sie an?");
  assert.match(ssml, /de-AT-IngridNeural/);
  assert.match(ssml, /xml:lang="de-AT"/);
  assert.match(ssml, /break time/);
  assert.match(ssml, /\?/);
});

test("ElevenLabs-Stimme hängt an der Figur, auch ohne Klon", () => {
  const spec = getSeedVoice("elisabeth");
  assert.ok(spec);
  assert.match(elevenVoiceFor(spec), /^[a-zA-Z0-9]{20,}$/);
  assert.notEqual(elevenVoiceFor(spec), elevenVoiceFor(getSeedVoice("franz")!));
});

test("ElevenLabs-Text bleibt committed — keine Audio-Tags im Mund", () => {
  assert.equal(toElevenSpokenText("Kein Interesse.", "impatient"), "Kein Interesse.");
  assert.equal(toElevenSpokenText("Warum rufen Sie an?", "skeptical", { breath: "sigh" }), "Warum rufen Sie an?");
  assert.equal(toElevenSpokenText("Das klingt nett.", "cheerful"), "Das klingt nett.");
  assert.equal(toElevenSpokenText("Grüß Gott.", "calm"), "Grüß Gott.");
  assert.equal(toElevenSpokenText("[sighs] [pause] Hallo."), "Hallo.");
});
