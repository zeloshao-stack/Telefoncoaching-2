import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTranscriptText } from "../call-ingest";
import { findMoments } from "../moments";
import { recurringPatterns } from "../patterns";

const TRANSCRIPT = `[00:01] Kunde: Ja, Berger.
Ich: Grüß Gott Herr Berger, mein Name ist Manzl von Manzl Immobilien. Ich rufe an, weil Ihr Haus in der Wallnerstraße
in unserer Käuferliste nachgefragt wird.
Kunde: Kein Interesse, wir haben schon einen Makler.
Ich: Wir bieten Ihnen eine kostenlose Bewertung und haben über zwanzig Jahre Erfahrung im Bezirk, das ist ein echter Vorteil für Sie, weil wir die Käufer schon kennen und Ihnen den ganzen Aufwand abnehmen können, von der Besichtigung bis zum Notar.
Kunde: Was kostet das denn bei Ihnen?
Ich: Das hängt vom Objekt ab, aber wir sind sehr fair.
Kunde: Na gut, ich überlege mir das.
Ich: Danke, schönen Tag noch.`;

test("Transkript mit Sprechermarken wird in Züge zerlegt, Zeitmarken fallen weg", () => {
  const turns = parseTranscriptText(TRANSCRIPT, "Herr Berger");
  assert.equal(turns[0].speaker, "counterpart");
  assert.equal(turns[0].text, "Ja, Berger.");
  assert.equal(turns[1].speaker, "trainee");
  assert.match(turns[1].text, /Käuferliste nachgefragt wird\.$/);
  assert.equal(turns.length, 8);
  assert.equal(turns.filter((t) => t.speaker === "trainee").length, 4);
});

test("Namens-Label und Herr/Frau zählen als Gegenseite", () => {
  const turns = parseTranscriptText("Frau Sommer: Wer sind Sie?\nMakler: Manzl, guten Tag.", "Sommer");
  assert.deepEqual(
    turns.map((t) => t.speaker),
    ["counterpart", "trainee"],
  );
});

test("Ohne Marken wird geraten und abgewechselt", () => {
  const turns = parseTranscriptText("Kein Interesse, nicht verkaufen.\nMein Name ist Manzl, ich rufe an wegen Ihres Hauses.");
  assert.deepEqual(
    turns.map((t) => t.speaker),
    ["counterpart", "trainee"],
  );
});

test("Momente: Einwand mit Pitch, unbeantwortete Frage, offenes Ende", () => {
  const turns = parseTranscriptText(TRANSCRIPT, "Herr Berger");
  const moments = findMoments(turns);
  const kinds = moments.map((m) => m.kind);
  assert.ok(kinds.includes("einwand"), "Einwand erkannt");
  assert.ok(kinds.includes("frage"), "direkte Frage erkannt");
  // „ich überlege mir das“ ist Einwand und Ende zugleich — eine Karte, nicht zwei
  const ende = moments.find((m) => m.quote === "Na gut, ich überlege mir das.")!;
  assert.equal(moments.filter((m) => m.turnId === ende.turnId).length, 1);
  assert.match(ende.kindLabel, /Offenes Ende/);
  assert.match(ende.reason, /ohne Termin/);

  const frage = moments.find((m) => m.kind === "frage")!;
  assert.match(frage.suggestedLine, /^Konkret: \[Zahl\]/);

  const einwand = moments.find((m) => m.kind === "einwand")!;
  assert.equal(einwand.quote, "Kein Interesse, wir haben schon einen Makler.");
  assert.match(einwand.reason, /nicht aufgenommen/);
  assert.equal(einwand.skillId, "B3");
  assert.match(einwand.suggestedLine, /nachvollziehen/);

  assert.equal(frage.quote, "Was kostet das denn bei Ihnen?");
  assert.match(frage.reason, /unbeantwortet|Rückfrage/);

  // schwerster Moment zuerst
  assert.ok(moments[0].weight >= moments[moments.length - 1].weight);
});

test("Der Satz zum Probieren spiegelt die Gegenseite in der zweiten Person", () => {
  const turns = parseTranscriptText(TRANSCRIPT, "Herr Berger");
  const einwand = findMoments(turns).find((m) => m.kind === "einwand")!;
  assert.match(einwand.suggestedLine, /Sie haben schon einen Makler/);
  assert.doesNotMatch(einwand.suggestedLine, /Kein Interesse/);
});

test("Gute Antwort erzeugt keinen Einwand-Moment", () => {
  const turns = parseTranscriptText(
    "Kunde: Kein Interesse, wir haben schon einen Makler.\nIch: Verstehe. Was macht der für Sie konkret — Besichtigungen oder auch die Käuferprüfung?\nKunde: Beides.\nIch: Dann vermerke ich das und rufe nicht mehr an. Auf Wiederhören.",
  );
  const moments = findMoments(turns);
  assert.equal(moments.filter((m) => m.kind === "einwand").length, 0);
  assert.equal(moments.filter((m) => m.kind === "abschluss").length, 0);
});

test("Muster über Gespräche: dieselbe Lücke und derselbe Einwand werden gezählt", () => {
  const a = parseTranscriptText(TRANSCRIPT, "Herr Berger");
  const b = parseTranscriptText(
    "Kundin: Sommer.\nIch: Manzl, ich rufe an wegen Ihrer Wohnung.\nKundin: Das ist zu teuer bei Maklern, kein Interesse.\nIch: Wir sind Marktführer und sehr günstig.\nKundin: Ich überlege mir das.\nIch: Gut, danke.",
  );
  const patterns = recurringPatterns([
    { id: "a", title: "A", kind: "echt", turns: a },
    { id: "b", title: "B", kind: "echt", turns: b },
  ]);
  assert.equal(patterns.calls, 2);
  const nein = patterns.objections.find((o) => o.id === "nein");
  assert.equal(nein?.count, 2);
  const b3 = patterns.gaps.find((g) => g.id === "B3");
  assert.equal(b3?.luecke, 2);
  assert.match(patterns.reading, /Widerstand fehlt in 2 von 2/);
});
