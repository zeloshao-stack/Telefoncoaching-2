import assert from "node:assert/strict";
import { test } from "node:test";
import { localTtsReady, localTtsStatus, synthesizeLocal } from "../tts-local";
import { getSeedVoice } from "../voices";
import { synthesizeSpeech, ttsStatus } from "../tts";

const localOnly = { skip: !localTtsReady() && "Lokale Sprachengine auf diesem Rechner nicht installiert" };

test("lokale TTS ist auf diesem Rechner verfügbar", localOnly, () => {
  const status = localTtsStatus();
  assert.equal(status.available, true);
  assert.ok(status.piper || status.macosSay);
  assert.equal(localTtsReady(), true);
});

test("Piper oder say erzeugt WAV für Seed-Stimme", localOnly, async () => {
  const spec = getSeedVoice("elisabeth");
  assert.ok(spec);
  const result = await synthesizeLocal(spec, "Grüß Gott. Warum rufen Sie an?");
  assert.equal(result.contentType, "audio/wav");
  assert.ok(result.audio.length > 1000);
  assert.ok(result.engine === "piper" || result.engine === "macos-say");
});

test("ttsStatus meldet lokale Engine ohne Cloud-Key", localOnly, () => {
  const status = ttsStatus();
  assert.equal(status.available, true);
  assert.equal(status.needsKey, false);
  assert.ok(status.providers.local);
});

test("synthesizeSpeech liefert Audio ohne Cloud-Key", localOnly, async () => {
  const result = await synthesizeLocal(getSeedVoice("franz")!, "Kein Interesse. Bitte lassen S' mich in Ruh.");
  assert.ok(result.audio.length > 1000);
  assert.ok(result.contentType === "audio/wav" || result.contentType === "audio/mpeg");
  assert.ok(["piper", "macos-say"].includes(result.engine));
});
