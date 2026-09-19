import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COACH_PROMPTS,
  classifyCoachQuestion,
  groupCoachPrompts,
  playbooksForQuestion,
} from "../coach-canon";
import { VERTICALS } from "../verticals";
import { mockCoachReply } from "../../src/role-engine/coachAnswer";

test("gängige Gesprächslagen sind branchenübergreifend dieselben", () => {
  assert.equal(classifyCoachQuestion("Wie gehe ich mit dem Einwand um, das sei zu teuer?"), "einwand");
  assert.equal(classifyCoachQuestion("Wie fasse ich nach, wenn keine Rückmeldung kommt?"), "nachfassen");
  assert.equal(
    classifyCoachQuestion("Der Bestandskunde ist weg, zur Konkurrenz. Wie reaktiviere ich?"),
    "reaktivierung",
  );
  assert.equal(classifyCoachQuestion("Wie eröffne ich einen Erstkontakt, Kaltakquise?"), "erstkontakt");
  assert.equal(
    classifyCoachQuestion("Wie schließe ich eine Haushaltsversicherung ab?"),
    "abschluss",
  );
  assert.equal(classifyCoachQuestion("Mieter meldet Wasserschaden und will eine Zusage."), "service");
});

test("jede live-Branche hat Einstiegsfragen zu den Kernlagen", () => {
  for (const id of ["immobilien", "versicherung", "hausverwaltung", "finanzierung"] as const) {
    const groups = groupCoachPrompts(VERTICALS[id].coachPrompts);
    assert.ok(groups.length >= 5, `${id} braucht mehrere Gesprächslagen`);
    assert.equal(VERTICALS[id].coachPrompts, COACH_PROMPTS[id]);
  }
  assert.ok(VERTICALS.versicherung.coachPrompts.some((p) => /Haushaltsversicherung/.test(p.text)));
  assert.ok(VERTICALS.immobilien.coachPrompts.some((p) => /Bauträger|Reservierung/.test(p.title + p.text)));
  assert.ok(VERTICALS.hausverwaltung.coachPrompts.some((p) => /Betriebskosten|Schaden|Wasserschaden/.test(p.title + p.text)));
});

test("Coach zur Haushaltsversicherung zieht Bedarf und Abschlussreife, kein Closing-Skript", () => {
  const reply = mockCoachReply({
    question: "Wie schließe ich eine Haushaltsversicherung ab?",
    properties: VERTICALS.versicherung.salesProperties,
  });
  assert.match(reply.text, /PB-CLOSE-001|Bedarf|P-bedarf/);
  assert.doesNotMatch(reply.text.toLowerCase(), /always be closing/);
  const books = playbooksForQuestion("Wie schließe ich eine Haushaltsversicherung ab?");
  assert.equal(books[0]?.situation, "abschluss");
});

test("Coach zur Kaltakquise nutzt Erlaubnis, nicht Druck", () => {
  const reply = mockCoachReply({
    question: "Wie mache ich Kaltakquise beim Erstkontakt?",
    properties: VERTICALS.immobilien.salesProperties,
  });
  assert.match(reply.text, /PB-OPEN-001|Erlaubnis|P-erlaubnis/);
  assert.doesNotMatch(reply.text.toLowerCase(), /always be closing/);
  assert.match(reply.text, /Darf ich Ihnen in 20 Sekunden/);
});
