import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PRACTICE_LANE_LABEL,
  buildPracticePipeline,
  hebelSentence,
  practiceFamilyRootId,
  practiceHref,
  practiceLane,
} from "../practice-pipeline";
import type { PracticePipelineInput } from "../practice-pipeline";

function session(partial: Partial<PracticePipelineInput> & Pick<PracticePipelineInput, "id">): PracticePipelineInput {
  return {
    status: "ended",
    mode: "live",
    parentSessionId: null,
    counterpartName: "Elisabeth Leitner",
    focusLabel: "Lage zuerst",
    scenarioTitle: "Honorarvergleich",
    createdAt: "2026-09-19T08:00:00.000Z",
    evaluation: { nextStep: "Fragen Sie nach dem Umfang, bevor Sie die Zahl halten." },
    practiceCue: null,
    ...partial,
  };
}

test("aktive Erstsitzung landet in Offen und öffnet die Leitung", () => {
  const open = session({ id: "s-open", status: "active", evaluation: null, createdAt: "2026-09-19T10:00:00.000Z" });
  const cards = buildPracticePipeline([open]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].lane, "offen");
  assert.equal(cards[0].laneLabel, "Offen");
  assert.equal(cards[0].href, "/sitzung/s-open");
  assert.equal(cards[0].hebel, "Zurück ins Gespräch.");
});

test("beendete Erstsitzung mit Hebel landet in Ausgewertet und öffnet Debrief", () => {
  const ended = session({ id: "s-eval" });
  const cards = buildPracticePipeline([ended]);
  assert.equal(cards[0].lane, "ausgewertet");
  assert.equal(cards[0].laneLabel, "Ausgewertet");
  assert.equal(cards[0].href, "/sitzung/s-eval/auswertung");
  assert.equal(cards[0].hebel, "Fragen Sie nach dem Umfang, bevor Sie die Zahl halten.");
  assert.doesNotMatch(cards[0].hebel, /win|forecast|€|4\.2|7\.9/i);
});

test("drei beendete S01-Repeats werden eine Karte Denselben Moment", () => {
  const a = session({ id: "s-a", createdAt: "2026-09-19T08:00:00.000Z" });
  const b = session({
    id: "s-b",
    mode: "repeat",
    parentSessionId: "s-a",
    createdAt: "2026-09-19T09:00:00.000Z",
    evaluation: { nextStep: "Denselben Einwand stehen lassen." },
  });
  const c = session({
    id: "s-c",
    mode: "repeat",
    parentSessionId: "s-b",
    createdAt: "2026-09-19T10:00:00.000Z",
    evaluation: { nextStep: "Die Stelle noch einmal mit einer Lagefrage." },
  });
  const cards = buildPracticePipeline([c, b, a]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].lane, "denselben_moment");
  assert.equal(cards[0].laneLabel, "Denselben Moment");
  assert.equal(cards[0].attemptCount, 3);
  assert.deepEqual(new Set(cards[0].sessionIds), new Set(["s-a", "s-b", "s-c"]));
  assert.equal(cards[0].href, "/sitzung/s-c/auswertung");
  assert.equal(cards[0].hebel, "Die Stelle noch einmal mit einer Lagefrage.");
});

test("drei unabhängige S01 ohne Eltern bleiben drei Karten", () => {
  const cards = buildPracticePipeline([
    session({ id: "x", createdAt: "2026-09-19T08:00:00.000Z" }),
    session({ id: "y", createdAt: "2026-09-19T09:00:00.000Z" }),
    session({ id: "z", createdAt: "2026-09-19T10:00:00.000Z" }),
  ]);
  assert.equal(cards.length, 3);
  assert.ok(cards.every((card) => card.lane === "ausgewertet"));
  assert.ok(cards.every((card) => card.attemptCount === 1));
});

test("aktiver Repeat steht in Denselben Moment, nicht in Offen", () => {
  const parent = session({ id: "p", createdAt: "2026-09-19T08:00:00.000Z" });
  const child = session({
    id: "r",
    status: "active",
    mode: "repeat",
    parentSessionId: "p",
    evaluation: null,
    practiceCue: { nextStep: "Lage zuerst, dann die Zahl." },
    createdAt: "2026-09-19T11:00:00.000Z",
  });
  const cards = buildPracticePipeline([parent, child]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].lane, "denselben_moment");
  assert.equal(cards[0].href, "/sitzung/r");
  assert.equal(cards[0].hebel, "Lage zuerst, dann die Zahl.");
});

test("not_assessable ohne nächsten Schritt ist Ruhend, kein Lost-Deal-Wort", () => {
  const parked = session({
    id: "na",
    evaluation: { calibration: { maxScore: null }, nextStep: "", repeatPrompt: "" },
  });
  const cards = buildPracticePipeline([parked]);
  assert.equal(cards[0].lane, "ruhend");
  assert.equal(cards[0].laneLabel, "Ruhend");
  assert.equal(cards[0].href, "/sitzung/na/auswertung");
  assert.doesNotMatch(cards[0].hebel, /lost|won|forecast|abschluss/i);
});

test("Lane ist nur Funktion — keine A01- oder A10-Aliase", () => {
  const members = [session({ id: "one" })];
  assert.equal(practiceLane(members), "ausgewertet");
  assert.deepEqual(Object.values(PRACTICE_LANE_LABEL), ["Offen", "Denselben Moment", "Ausgewertet", "Ruhend"]);
  assert.equal(JSON.stringify(PRACTICE_LANE_LABEL).includes("waiting_note"), false);
  assert.equal(JSON.stringify(PRACTICE_LANE_LABEL).includes("briefing"), false);
  assert.equal(JSON.stringify(PRACTICE_LANE_LABEL).includes("repeat_open"), false);
});

test("ein Klick geht nur auf Leitung oder Debrief, nie auf Forecast", () => {
  assert.equal(practiceHref({ id: "a", status: "active" }), "/sitzung/a");
  assert.equal(practiceHref({ id: "b", status: "ended" }), "/sitzung/b/auswertung");
  assert.doesNotMatch(practiceHref({ id: "b", status: "ended" }), /forecast|board|radar/i);
});

test("Theater-Hebel (Win-Rate) wird verworfen", () => {
  const text = hebelSentence([
    session({
      id: "t",
      evaluation: { nextStep: "Win-Rate 40 % — Commit diese Woche." },
      practiceCue: { nextStep: "Den Einwand wörtlich stehen lassen." },
    }),
  ]);
  assert.equal(text, "Den Einwand wörtlich stehen lassen.");
});

test("Geschwister gruppieren, wenn die Elternsitzung außerhalb des Fensters liegt", () => {
  const byId = new Map<string, { id: string; parentSessionId: string | null }>();
  const b = { id: "b", parentSessionId: "missing-a" };
  const c = { id: "c", parentSessionId: "missing-a" };
  byId.set("b", b);
  byId.set("c", c);
  assert.equal(practiceFamilyRootId(b, byId), "missing-a");
  assert.equal(practiceFamilyRootId(c, byId), "missing-a");
  const cards = buildPracticePipeline([
    session({ id: "b", mode: "repeat", parentSessionId: "missing-a", createdAt: "2026-09-19T09:00:00.000Z" }),
    session({ id: "c", mode: "repeat", parentSessionId: "missing-a", createdAt: "2026-09-19T10:00:00.000Z" }),
  ]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].lane, "denselben_moment");
  assert.equal(cards[0].attemptCount, 2);
});

test("Stärke/Recap aus practiceCue.lever wird nicht als Hebel verkauft", () => {
  const text = hebelSentence([
    session({
      id: "strength",
      status: "active",
      mode: "repeat",
      parentSessionId: "p",
      evaluation: null,
      practiceCue: { lever: "Sie haben in T2 eine konkrete Frage gestellt." },
    }),
  ]);
  assert.equal(text, "Denselben Moment liegt noch in der Leitung.");
});

test("Karte trägt Figur, Fokus, Hebel — keine Score-Galerie", () => {
  const cards = buildPracticePipeline([session({ id: "fig" })]);
  assert.equal(cards[0].counterpartName, "Elisabeth Leitner");
  assert.equal(cards[0].focusLabel, "Lage zuerst");
  assert.ok(cards[0].hebel.length > 0);
  assert.equal("score" in cards[0], false);
  assert.equal("winProbability" in cards[0], false);
});
