import assert from "node:assert/strict";
import { test } from "node:test";
import { callStatusLine, hangupStatusLine, orbButtonLabel } from "../live-status";

const session = {
  status: "active",
  counterpartName: "Frau Berger",
  voiceFeel: "knapp",
  turns: [] as Array<{ speaker: string; text: string }>,
};

test("Live-Audio: Leitung offen, spricht, Stall — nicht überlegt, nicht Unterbrochen-Banner", () => {
  const live = {
    session,
    liveStatus: "live" as const,
    liveLine: true,
    liveOnly: true,
    liveVoice: true,
    typedOnly: false,
    interruptFlash: true,
    hangupBeat: null,
  };
  assert.equal(callStatusLine({ ...live, phase: "listening" }), "Leitung offen.");
  assert.equal(callStatusLine({ ...live, phase: "idle" }), "Leitung offen.");
  assert.equal(callStatusLine({ ...live, phase: "speaking" }), "Frau Berger spricht.");
  assert.equal(callStatusLine({ ...live, phase: "thinking" }), "Die Leitung ist noch da.");
  assert.equal(callStatusLine({ ...live, phase: "listening" }).includes("überlegt"), false);
  assert.equal(callStatusLine({ ...live, phase: "listening" }).includes("Unterbrochen"), false);
  assert.equal(orbButtonLabel("thinking", "Frau Berger", false, true), "Leitung offen");
});

test("Live-Audio: Figur-Auflegen, Nutzer-Auflegen und Drop sind getrennt", () => {
  assert.equal(
    callStatusLine({
      session,
      liveStatus: "failed",
      phase: "idle",
      liveLine: true,
      liveOnly: false,
      liveVoice: true,
      typedOnly: false,
      interruptFlash: false,
      hangupBeat: null,
    }),
    "Die Leitung ist weggefallen.",
  );
  assert.equal(
    callStatusLine({
      session,
      liveStatus: "live",
      phase: "listening",
      liveLine: true,
      liveOnly: true,
      liveVoice: true,
      typedOnly: false,
      interruptFlash: false,
      hangupBeat: "Sie haben aufgelegt.",
    }),
    "Sie haben aufgelegt.",
  );
  assert.equal(
    callStatusLine({
      session,
      liveStatus: "live",
      phase: "listening",
      liveLine: true,
      liveOnly: true,
      liveVoice: true,
      typedOnly: false,
      interruptFlash: false,
      hangupBeat: "Frau Berger hat aufgelegt.",
    }),
    "Frau Berger hat aufgelegt.",
  );
  assert.equal(
    hangupStatusLine({
      counterpartName: "Frau Berger",
      turns: [{ speaker: "system", text: "Sie haben aufgelegt." }],
    }),
    "Sie haben aufgelegt.",
  );
  assert.equal(
    hangupStatusLine({
      counterpartName: "Frau Berger",
      turns: [{ speaker: "system", text: "Frau Berger hat aufgelegt." }],
    }),
    "Frau Berger hat aufgelegt.",
  );
});

test("Tipp-Modus behält Chat-Chrome inklusive überlegt", () => {
  assert.equal(
    callStatusLine({
      session,
      liveStatus: "off",
      phase: "thinking",
      liveLine: true,
      liveOnly: false,
      liveVoice: true,
      typedOnly: true,
      interruptFlash: false,
      hangupBeat: null,
    }),
    "Frau Berger überlegt…",
  );
  assert.equal(
    callStatusLine({
      session,
      liveStatus: "off",
      phase: "listening",
      liveLine: true,
      liveOnly: false,
      liveVoice: false,
      typedOnly: false,
      interruptFlash: true,
      hangupBeat: null,
    }),
    "Unterbrochen. Sie haben das Wort.",
  );
  assert.equal(orbButtonLabel("thinking", "Frau Berger", false, false), "Frau Berger überlegt");
});
