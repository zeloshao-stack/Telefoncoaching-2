import assert from "node:assert/strict";
import { test } from "node:test";
import { drillHonesty, isColdDrill, trainingBeats } from "../scenario-product";

test("S02 ist Kaltakquise mit Auflege-Ehrlichkeit", () => {
  const meta = drillHonesty("S02");
  assert.equal(meta.callKind, "cold");
  assert.match(meta.callLabel, /Kalt/i);
  assert.match(meta.honesty, /legt|auf/i);
  assert.equal(isColdDrill("S02"), true);
});

test("S01 ist Bestand/Vergleich, kein Cold", () => {
  const meta = drillHonesty("S01");
  assert.equal(meta.callKind, "warm");
  assert.equal(isColdDrill("S01"), false);
  assert.match(meta.practiceFocus, /Leistung|Preis/i);
});

test("S04 ist Kaltakquise Verwaltung, S06 eingehend, S08 Bestand", () => {
  assert.equal(drillHonesty("S04").callKind, "cold");
  assert.equal(isColdDrill("S04"), true);
  assert.match(drillHonesty("S04").practiceFocus, /Anlass/);
  assert.equal(drillHonesty("S06").callKind, "inbound");
  assert.equal(isColdDrill("S06"), false);
  assert.match(drillHonesty("S06").practiceFocus, /Mietfrage|Rechtszusage/);
  assert.equal(drillHonesty("S08").callKind, "warm");
  assert.match(drillHonesty("S08").practiceFocus, /Empfehlung|Neuverkauf/);
});

test("Unbekannter Entwurf bekommt ehrlichen Fallback", () => {
  const meta = drillHonesty("X99", true);
  assert.match(meta.honesty, /Entwurf/i);
  assert.match(meta.practiceFocus, /Eine Sache/i);
});

test("Drei Beats kommen aus vorhandenem Pack-Text, nicht aus Rubrik", () => {
  const meta = drillHonesty("S01");
  const beats = trainingBeats({
    practiceFocus: meta.practiceFocus,
    honesty: meta.honesty,
    focusHint: "Eine konkrete Lücke klären, bevor Preis oder Auftrag fällt.",
    blurb: "Honorarvergleich am Tisch. Die Gegenseite will wissen, was die 12.000 Euro mehr bringen.",
  });
  assert.equal(beats.length, 3);
  assert.ok(beats.every((beat) => beat.title && beat.action));
  assert.doesNotMatch(JSON.stringify(beats), /Diagnose|0 \/ 4|70\/30/);
});
