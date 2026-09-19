import assert from "node:assert/strict";
import { test } from "node:test";
import { leaksPrivate, mockGenerateScenario, sanitizeGeneratedDraft } from "../scenario-generator";
import { decodeDictationAudio, transcribeDictation } from "../dictate";
import {
  appendChip,
  appendSpoken,
  CHIP_GROUP_ORDER,
  chipIsSelected,
  classifySituation,
  composePublicBrief,
  HINT_CHIP_GROUPS,
  HINT_CHIPS,
  inferFemale,
  normalizeSeed,
  pickHiddenHinge,
  seedHasContent,
  toggleChip,
} from "../scenario-seed";

const DECLINED =
  "Verhandlungsgespräch mit Zinshauseigentümer, der bereits einmal abgelehnt hat. Ich möchte doch mal reinkommen.";

test("Chips hängen an den Situationstext an, ersetzen ihn nicht", () => {
  const next = appendChip("Lage unklar.", "Es gibt eine Erbschaft.");
  assert.match(next, /Lage unklar/);
  assert.match(next, /Erbschaft/);
  assert.equal(appendChip(next, "Es gibt eine Erbschaft."), next);
});

test("Auswahl-Chips sind gruppiert und lassen sich an- und abwählen", () => {
  const labels: string[] = HINT_CHIPS.map((chip) => chip.label);
  for (const needed of [
    "Nachbar-Tipp",
    "Empfehlung Kollege",
    "Einfach mal vorbeigefahren",
    "Empfehlung (allgemein)",
    "Erbschaft",
    "Honorarvergleich",
    "Schon einmal abgelehnt",
    "Grundbuch",
    "Miteigentum / Erben",
    "Bewertung nachfassen",
    "Alleinauftrag / Bindung",
    "Inserat gesehen",
    "Sanierung / Fassade / Stiegenhaus",
    "Hausverwaltung kennt uns",
    "Bank / Finanzierung im Spiel",
    "Kein Verkauf gesagt",
    "Privat verkaufen",
    "Provision zu hoch",
    "Schicken Sie etwas",
    "Schon einen Makler",
    "Muss mit Familie reden",
    "Kaltkontakt Zinshaus",
    "Wieder reinkommen nach Absage",
    "Termin vor Ort wollen",
  ]) {
    assert.equal(labels.includes(needed), true, needed);
  }
  assert.deepEqual(
    HINT_CHIP_GROUPS.map((group) => group.label),
    CHIP_GROUP_ORDER.map((group) => group.label),
  );
  assert.equal(
    HINT_CHIP_GROUPS.reduce((sum, group) => sum + group.chips.length, 0),
    HINT_CHIPS.length,
  );
  const phrases = HINT_CHIPS.map((chip) => chip.text.toLowerCase());
  assert.equal(new Set(phrases).size, phrases.length);

  const chip = HINT_CHIPS.find((row) => row.id === "erbschaft")!;
  const on = toggleChip("Lage unklar.", chip.text);
  assert.equal(chipIsSelected(on, chip.text), true);
  assert.match(on, /Lage unklar/);
  const off = toggleChip(on, chip.text);
  assert.equal(chipIsSelected(off, chip.text), false);
  assert.doesNotMatch(off, /Erbschaft/);
  assert.match(off, /Lage unklar/);
});

test("Diktat hängt an, ersetzt den Text nicht", () => {
  assert.equal(appendSpoken("", "Kaltkontakt Zinshaus."), "Kaltkontakt Zinshaus.");
  assert.equal(
    appendSpoken("Lage unklar.", "Ich bin vorbeigefahren."),
    "Lage unklar. Ich bin vorbeigefahren.",
  );
});

test("Diktat ohne Audio oder ohne Whisper-Schlüssel bleibt klar", async () => {
  assert.throws(() => decodeDictationAudio(""), /Keine Aufnahme/);
  const prev = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      () => transcribeDictation(Buffer.alloc(2000), "audio/webm"),
      /OPENAI_API_KEY|Whisper|tippen/,
    );
  } finally {
    if (prev !== undefined) process.env.OPENAI_API_KEY = prev;
  }
});

test("Absage-Wiedereinstieg wird als reentry erkannt", () => {
  const seed = normalizeSeed({ situation: DECLINED });
  assert.equal(classifySituation(seed), "reentry");
  assert.equal(inferFemale(seed), false);
  assert.equal(pickHiddenHinge({ ...seed, rollHidden: false }).id, "reentry");
});

test("Mock-Generator: öffentliche Akte bleibt die Nutzereingabe, Leitfaden ist da, Wille leakt nicht", () => {
  const draft = mockGenerateScenario({ situation: DECLINED, rollHidden: false });
  assert.match(draft.public_brief, /abgelehnt/i);
  assert.match(draft.public_brief, /reinkommen|Nur das dürfen Sie/i);
  assert.equal(draft.public_brief.includes(DECLINED.split(".")[0]!), true);
  assert.doesNotMatch(draft.public_brief, /Schwester|unentschlossen|eigentlich verkaufen|Treppen langsamer/i);
  assert.ok(draft.guide);
  assert.ok(draft.guide.lines.length >= 4);
  assert.ok(draft.guide.avoid.some((line) => /nein|absage|pitch/i.test(line)));
  assert.match(draft.opening, /warum rufen sie noch einmal an/i);
  assert.match(draft.private_state.sell_will, /nicht verkaufen|abgelehnt/i);
  assert.equal(leaksPrivate(draft.public_brief, draft.private_state), false);
  assert.equal(leaksPrivate(draft.guide.presumed, draft.private_state), false);
  assert.match(draft.acceptable_outcome, /nächsten schritt|nein|auftrag/i);
});

test("Dieselbe Akte, gewürfeltes Verdecktes ändert nicht das Briefing", () => {
  const a = mockGenerateScenario({ situation: DECLINED, rollHidden: true, variant: 0 });
  const b = mockGenerateScenario({ situation: DECLINED, rollHidden: true, variant: 1 });
  assert.equal(a.public_brief, b.public_brief);
  assert.equal(composePublicBrief(normalizeSeed({ situation: DECLINED })), a.public_brief);
  assert.notEqual(a.private_state.sell_will, b.private_state.sell_will);
});

test("Ohne Situationstext gibt es keinen Entwurf", () => {
  assert.equal(seedHasContent(normalizeSeed({ situation: "", objekt: "Wallnerstraße" })), false);
  assert.equal(seedHasContent(normalizeSeed({ situation: DECLINED })), true);
});

test("Modell-Entwurf darf Hidden Facts nicht in die öffentliche Akte oder den Leitfaden kippen", () => {
  const mock = mockGenerateScenario({ situation: DECLINED, rollHidden: false });
  const sanitized = sanitizeGeneratedDraft(
    {
      public_brief: "Otto Sommer will eigentlich verkaufen. Die Schwester ist unentschlossen.",
      opening: mock.private_state.sell_will,
      acceptable_outcome: mock.private_state.sell_will,
      private_state: mock.private_state,
      guide: {
        occasion: mock.private_state.sell_will,
        presumed: mock.private_state.wellbeing,
        lines: mock.guide!.lines,
        avoid: mock.guide!.avoid,
        questions: mock.guide!.questions,
      },
    },
    mock,
  );
  assert.equal(sanitized.public_brief, mock.public_brief);
  assert.match(sanitized.public_brief, /abgelehnt/i);
  assert.doesNotMatch(sanitized.public_brief, /eigentlich verkaufen|Schwester/i);
  assert.equal(sanitized.opening, mock.opening);
  assert.equal(sanitized.acceptable_outcome, mock.acceptable_outcome);
  assert.equal(sanitized.guide?.occasion, mock.guide?.occasion);
  assert.equal(leaksPrivate(sanitized.public_brief, sanitized.private_state, sanitized.public_brief), false);
});
