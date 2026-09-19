import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeCall } from "../call-analytics";

test("Redeanteil ist Kontext, kein 43/57-Ziel", () => {
  const stats = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Warum rufen Sie an?" },
    {
      id: "2",
      speaker: "trainee",
      text: "Wir sind die Besten in Wien und ich erkläre Ihnen jetzt unser komplettes Honorarmodell mit allen Leistungen und Referenzen und warum Sie uns beauftragen müssen.",
    },
  ]);
  assert.ok(stats.traineeShare > 70);
  assert.match(stats.shareReading, /größeren Redeanteil|Lage/i);
  assert.equal(stats.skills.find((s) => s.id === "B2")?.state, "luecke");
});

test("offene Frage und Spiegel zählen als Zuhören", () => {
  const stats = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ein Verkauf ist für die Familie ausgeschlossen." },
    {
      id: "2",
      speaker: "trainee",
      text: "Für die Familie. Was macht den Verkauf für Sie im Moment so unpassend?",
    },
  ]);
  assert.equal(stats.openQuestions, 1);
  assert.equal(stats.skills.find((s) => s.id === "B2")?.state, "sichtbar");
});

test("klares Nein mit Vermerk ist Verbindlichkeit, nicht Misserfolg", () => {
  const stats = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ich verkaufe nicht. Keine Anrufe mehr." },
    {
      id: "2",
      speaker: "trainee",
      text: "Verstanden. Ich vermerke, dass Sie keine weiteren Anrufe wünschen. Auf Wiederhören.",
    },
  ]);
  assert.equal(stats.skills.find((s) => s.id === "B3")?.state, "sichtbar");
  assert.equal(stats.skills.find((s) => s.id === "B4")?.state, "sichtbar");
});

test("ohne eigenen Beitrag bleibt jede Skill-Zeile Enthaltung", () => {
  const stats = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro. Warum sollte ich Ihnen 48.000 zahlen?" },
  ]);
  assert.equal(stats.traineeTurns, 0);
  for (const skill of stats.skills) {
    assert.equal(skill.state, "keine_gelegenheit");
    assert.match(skill.evidence, /Kein eigener Beitrag|Kein klarer Widerstand/);
  }
  assert.match(stats.suggestedLine, /36\.?000|Euro/i);
});

test("nächster Satz hängt am letzten Satz der Gegenseite", () => {
  const stats = analyzeCall([
    { id: "1", speaker: "counterpart", text: "Ein anderer Makler macht das um 36.000 Euro. Warum sollte ich Ihnen 48.000 zahlen?" },
    {
      id: "2",
      speaker: "trainee",
      text: "Wir sind die Besten in Wien und ich erkläre Ihnen jetzt unser komplettes Honorarmodell mit allen Leistungen.",
    },
  ]);
  assert.equal(stats.gapSkill?.id, "B2");
  assert.match(stats.suggestedLine, /36\.?000/i);
  assert.match(stats.suggestedLine, /umfasst|Angebot/i);
});
