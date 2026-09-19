import assert from "node:assert/strict";
import { test } from "node:test";
import { liveExamUiAllowed, liveStage, showTranscriptWall } from "../live-stage";

test("Audio-Leitung ist Telefon-Chrome, Tipp bleibt Chatwand", () => {
  assert.equal(liveStage({ liveOnly: true, typedOnly: false }), "phone");
  assert.equal(liveStage({ liveOnly: true, typedOnly: true }), "chat");
  assert.equal(liveStage({ liveOnly: false, typedOnly: false }), "chat");
  assert.equal(liveStage({ liveOnly: false, typedOnly: true }), "chat");
});

test("Transkript ist auf der Leitung nicht die Hauptbühne", () => {
  assert.equal(showTranscriptWall("phone", false), false);
  assert.equal(showTranscriptWall("phone", true), true);
  assert.equal(showTranscriptWall("chat", false), true);
});

test("Kein Score-HUD, keine Rubrik, keine Moments auf /sitzung", () => {
  assert.equal(liveExamUiAllowed(), false);
});
