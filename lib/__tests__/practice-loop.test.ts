import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeCall, compareAttempts } from "../call-analytics";
import { extractSpokenLine, fallbackRepeatTurnId, sliceForRepeat } from "../practice-loop";
import { heardFromRows } from "../heard";
import { splitSentences } from "../speech-chunks";

test("Antwort wird satzweise gesprochen, Kurzstücke bleiben zusammen", () => {
  const parts = splitSentences(
    "Herr Maier, das passt mir jetzt nicht. Wir haben ja schon einen Makler. Was wollen Sie eigentlich? Nein.",
  );
  assert.deepEqual(parts, [
    "Herr Maier, das passt mir jetzt nicht.",
    "Wir haben ja schon einen Makler.",
    "Was wollen Sie eigentlich? Nein.",
  ]);
  assert.deepEqual(splitSentences("Ja."), ["Ja."]);
  assert.deepEqual(splitSentences("   "), []);
});

test("Wiederholung behält den Einwand der Gegenseite", () => {
  const turns = [
    { id: "c1", speaker: "counterpart" },
    { id: "t1", speaker: "trainee" },
    { id: "c2", speaker: "counterpart" },
    { id: "t2", speaker: "trainee" },
  ];
  const kept = sliceForRepeat(turns, "c2").map((turn) => turn.id);
  assert.deepEqual(kept, ["c1", "t1", "c2"]);
});

test("eigene schwache Zeile wird neu gesprochen", () => {
  const turns = [
    { id: "c1", speaker: "counterpart" },
    { id: "t1", speaker: "trainee" },
  ];
  const kept = sliceForRepeat(turns, "t1").map((turn) => turn.id);
  assert.deepEqual(kept, ["c1"]);
});

test("Systemzüge bleiben außerhalb des Repeat-Schnitts", () => {
  const turns = [
    { id: "c1", speaker: "counterpart" },
    { id: "t1", speaker: "trainee" },
    { id: "c2", speaker: "counterpart" },
    { id: "sys", speaker: "system" },
  ];
  const kept = sliceForRepeat(turns, "c2").map((turn) => turn.id);
  assert.deepEqual(kept, ["c1", "t1", "c2"]);
});

test("ohne markierten Moment gilt der letzte Satz der Gegenseite", () => {
  const turns = [
    { id: "c1", speaker: "counterpart" },
    { id: "t1", speaker: "trainee" },
    { id: "sys", speaker: "system" },
  ];
  assert.equal(fallbackRepeatTurnId(turns, null), "c1");
  assert.equal(fallbackRepeatTurnId(turns, "t1"), "t1");
});

test("zweiter Versuch mit offener Frage gilt als hörbar besser", () => {
  const before = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro." },
    {
      id: "2",
      speaker: "trainee",
      text: "Dann mache ich es auch um 36.000. Wir sind die Besten in Wien.",
    },
  ]);
  const after = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro." },
    {
      id: "2",
      speaker: "trainee",
      text: "36.000 Euro. Was genau umfasst das Angebot, das Sie vergleichen?",
    },
  ]);
  const delta = compareAttempts(before, after);
  assert.ok(delta.improved.includes("Zuhören"));
  assert.match(delta.reading, /Besser|Hörbar/i);
});

test("Coach-Formulierung in Anführungszeichen wird der nächste Satz", () => {
  const line = extractSpokenLine(
    'Recap\nKurz.\n\nHebel\nLage zuerst.\n\nNext Step\nFragen Sie nach dem Umfang.\n\nSagen Sie: „Was genau umfasst das Angebot zu 36.000 Euro?“',
  );
  assert.equal(line, "Was genau umfasst das Angebot zu 36.000 Euro?");
});

test("Beobachtungen der Figur werden nach dem Call lesbar", () => {
  const heard = heardFromRows([
    {
      speaker: "trainee",
      observations_json: JSON.stringify([
        { type: "generic_pitch", turnId: "t1", evidence: "Wir sind die Besten in Wien.", confidence: "medium" },
        { type: "premature_concession", turnId: "t1", evidence: "Dann mache ich es um 36.000.", confidence: "high" },
      ]),
    },
  ]);
  assert.equal(heard.length, 2);
  assert.ok(heard.some((row) => /Pitch/.test(row.label)));
  assert.ok(heard.some((row) => /Preis/.test(row.label)));
});
