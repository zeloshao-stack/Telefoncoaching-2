import assert from "node:assert/strict";
import { test } from "node:test";
import { counterpartDuration, mergeWhisperSegments, suggestSpeaker } from "../call-ingest";
import { requireCallConsents } from "../call-store";

test("Sprecher-Hinweis trennt Makler und Eigentümer nur bei klaren Sätzen", () => {
  assert.equal(suggestSpeaker("Grüß Gott, mein Name ist Manzl, ich rufe wegen des Hauses an."), "trainee");
  assert.equal(suggestSpeaker("Das Haus gehört mir. Warum rufen Sie an?"), "counterpart");
  assert.equal(suggestSpeaker("Ja."), "unknown");
});

test("Whisper-Segmente werden zu hörbaren Abschnitten", () => {
  const rows = mergeWhisperSegments([
    { start: 0, end: 2.1, text: "  Grüß Gott.  " },
    { start: 2.1, end: 2.1, text: "" },
    { start: 3, end: 5.4, text: "Kein Interesse." },
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[1]?.suggested, "counterpart");
  assert.equal(counterpartDuration(rows), 4.5);
});

test("ohne die drei Einwilligungen gibt es keinen Klon", () => {
  assert.throws(
    () => requireCallConsents({ consentedRecording: true, consentedClone: true, consentedSynthetic: false }),
    /drei Einwilligungen/,
  );
});
