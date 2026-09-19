import assert from "node:assert/strict";
import { test } from "node:test";
import { homeStartAction, secondaryDrillHref, splitNameLage, toPersonCard } from "../featured-drill";

test("Featured-Karte: Name, Lage, eine gesprochene Linie, Aufgabe — keine Win-Rate", () => {
  const card = toPersonCard({
    id: "S01",
    counterpart: "Elisabeth Leitner · Zinshaus, Wien",
    spokenLine: "Ein anderer Makler macht das um 36.000 Euro. Warum sollte ich Ihnen 48.000 zahlen?",
    task: "Leistungsumfang klären, bevor Sie den Preis verteidigen.",
    callLabel: "Bestand / Vergleich",
    cold: false,
  });
  assert.ok(card);
  assert.equal(card.name, "Elisabeth Leitner");
  assert.equal(card.location, "Zinshaus, Wien");
  assert.match(card.spokenLine, /36\.000/);
  assert.match(card.task, /Leistung/);
  assert.equal("winRate" in card, false);
  assert.equal("score" in card, false);
  assert.equal(homeStartAction("featured"), "start");
});

test("Leere Linie oder Aufgabe ergibt keine Karte", () => {
  assert.equal(
    toPersonCard({
      id: "S01",
      counterpart: "Elisabeth Leitner",
      spokenLine: "   ",
      task: "Eine Sache.",
      callLabel: "Bestand",
    }),
    null,
  );
  assert.equal(
    toPersonCard({
      id: "S01",
      counterpart: "Elisabeth Leitner",
      spokenLine: "Ja?",
      task: "  ",
      callLabel: "Bestand",
    }),
    null,
  );
});

test("Rest startet, eigene Fälle bleiben Briefing", () => {
  assert.equal(homeStartAction("rest"), "start");
  assert.equal(homeStartAction("own"), "briefing");
  assert.equal(secondaryDrillHref("S02"), "/szenario/S02");
});

test("Cold-Karte behält Härte als Flag, nicht als Score", () => {
  const card = toPersonCard({
    id: "S02",
    counterpart: "Franz Berger · klare Absage",
    spokenLine: "Ich will nicht verkaufen und möchte auch nicht mehr von Ihnen angerufen werden.",
    task: "Absage respektieren und sauber beenden.",
    callLabel: "Kaltakquise",
    cold: true,
  });
  assert.ok(card);
  assert.equal(card.cold, true);
  assert.equal(splitNameLage("Franz Berger · klare Absage").location, "klare Absage");
});
