import assert from "node:assert/strict";
import { test } from "node:test";
import type { Evaluation, TranscriptTurn } from "@/src/role-engine/types";
import {
  debriefScoreLabel,
  debriefTurnDomId,
  isNotAssessable,
  jumpToDebriefTurn,
  resolveDebriefMoment,
} from "../debrief-moments";

const counterpart = (id: string, text: string): TranscriptTurn => ({ id, speaker: "counterpart", text });
const trainee = (id: string, text: string): TranscriptTurn => ({ id, speaker: "trainee", text });
const system = (id: string, text: string): TranscriptTurn => ({ id, speaker: "system", text });

test("Anker-ID bleibt UUID-sicher und wirft Markup weg", () => {
  assert.equal(debriefTurnDomId("442b1722-67b0-498b-a258-d0ddebe4b516"), "turn-442b1722-67b0-498b-a258-d0ddebe4b516");
  assert.equal(debriefTurnDomId('t1"><img src=x>'), "turn-t1imgsrcx");
  assert.equal(debriefTurnDomId(""), "turn-unknown");
});

test("Note bleibt ehrlich: null ist N/A, 0 ist 0, not_assessable nicht 0 / 4", () => {
  assert.equal(debriefScoreLabel(null), "N/A");
  assert.equal(debriefScoreLabel(undefined), "N/A");
  assert.equal(debriefScoreLabel(0), "0 / 4");
  assert.equal(debriefScoreLabel(3), "3 / 4");
  assert.equal(isNotAssessable({ calibration: { clearTraineeTurns: 0, unclearTraineeTurns: 2, maxScore: null, note: "kein Beitrag" } }), true);
  assert.equal(isNotAssessable({ calibration: { clearTraineeTurns: 2, unclearTraineeTurns: 0, maxScore: 3, note: null } }), false);
  assert.equal(isNotAssessable({}), false);
  assert.equal(isNotAssessable(null), false);
});

test("Schlüsselmoment: keyMoment.turnId vor importantMomentTurnId, Systemzüge kein Sprungziel", () => {
  const turns = [
    counterpart("c1", "Warum rufen Sie an?"),
    trainee("t1", "Was umfasst das andere Angebot genau?"),
    counterpart("c2", "Das ist mir zu teuer."),
    system("sys", "Elisabeth Leitner hat aufgelegt — eigene Entscheidung."),
  ];
  const fromKey = resolveDebriefMoment(turns, {
    importantMomentTurnId: "c1",
    keyMoment: {
      turnId: "t1",
      quote: "Was umfasst das andere Angebot genau?",
      whatHappened: "Die Lage wurde hörbar.",
      counterfactual: "Hätten Sie nach dem Umfang gefragt, hätte ich ihn genannt.",
      source: "model",
    },
  });
  assert.equal(fromKey.turnId, "t1");
  assert.equal(fromKey.clickable, true);
  assert.equal(fromKey.isTrainee, true);
  assert.equal(fromKey.quote, "Was umfasst das andere Angebot genau?");

  const missing = resolveDebriefMoment(turns, {
    importantMomentTurnId: "ghost",
    keyMoment: {
      turnId: "ghost",
      quote: "<b>kein HTML</b>",
      whatHappened: "x",
      counterfactual: "y",
      source: "model",
    },
  });
  assert.equal(missing.clickable, false);
  assert.equal(missing.turnId, null);
  assert.equal(missing.quote, "<b>kein HTML</b>");

  const systemOnly = resolveDebriefMoment(turns, { importantMomentTurnId: "sys" });
  assert.equal(systemOnly.clickable, false);
  assert.equal(systemOnly.turnId, null);
});

test("Sprung setzt Fokus und Hash nur wenn die Turn-Zeile existiert", () => {
  const calls: string[] = [];
  const target = {
    scrollIntoView(arg?: ScrollIntoViewOptions) {
      calls.push(`scroll:${arg?.block ?? ""}`);
    },
    focus(arg?: { preventScroll?: boolean }) {
      calls.push(`focus:${arg?.preventScroll ?? false}`);
    },
  };
  const hashes: string[] = [];
  const ok = jumpToDebriefTurn("t1", {
    getElementById: (id) => (id === "turn-t1" ? target : null),
    replaceHash: (hash) => hashes.push(hash),
  });
  assert.equal(ok, true);
  assert.deepEqual(calls, ["scroll:center", "focus:true"]);
  assert.deepEqual(hashes, ["#turn-t1"]);

  const miss = jumpToDebriefTurn("missing", {
    getElementById: () => null,
    replaceHash: (hash) => hashes.push(hash),
  });
  assert.equal(miss, false);
  assert.equal(hashes.length, 1);
});

test("Helper ändert das Evaluator-Schema nicht — nur vorhandene Felder", () => {
  const keys = Object.keys({
    turnId: null,
    quote: "",
    isTrainee: false,
    whatHappened: "",
    counterfactual: "",
    clickable: false,
  } satisfies Record<keyof ReturnType<typeof resolveDebriefMoment>, unknown>);
  assert.deepEqual(keys.sort(), ["clickable", "counterfactual", "isTrainee", "quote", "turnId", "whatHappened"].sort());
  const ev: Pick<Evaluation, "keyMoment" | "importantMomentTurnId"> = { importantMomentTurnId: null };
  assert.equal(resolveDebriefMoment([], ev).clickable, false);
});
