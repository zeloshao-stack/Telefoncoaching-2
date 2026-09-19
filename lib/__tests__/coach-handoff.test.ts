import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Evaluation, TranscriptTurn } from "../../src/role-engine/types";
import { ENABLEMENT_CARDS, groupEnablementPrompts, playbookFor } from "../coach-canon";
import { debriefTurnDomId } from "../debrief-moments";
import {
  coachHandoffHref,
  handoffLeaksScorecard,
  handoffPublicContext,
  handoffSellsIsolation,
  parseCoachHandoffSearchParams,
  playbookHeading,
  resolveCoachHandoff,
  reviewQuestionsForHandoff,
  situationForHandoff,
  spotlightFromHandoff,
  type CoachHandoffSource,
} from "../coach-handoff";
import { formatSpotlight, parseSpotlight } from "../spotlight";
import { VERTICALS } from "../verticals";

const leakyEval: Evaluation = {
  engine: "mock",
  summary: "Diagnosis 2/4 — Rubrik verfehlt, Isolation halten.",
  strength: "Sie haben den Umfang gefragt.",
  scores: [
    { dimension: "diagnosis", score: 2, evidenceTurnIds: ["t1"], quote: "x", rationale: "fehlende Lagefrage" },
  ],
  importantMomentTurnId: "t1",
  correction: "Fragen Sie nach der Lage.",
  nextStep: "Fragen Sie, was das andere Angebot umfasst.",
  repeatPrompt: "nochmal",
  mustNotice: ["Isolation halten"],
  abstainNote: null,
  keyMoment: {
    turnId: "t1",
    quote: "Was umfasst das Angebot?",
    whatHappened: "Die Zahl blieb zu.",
    counterfactual: "Den Umfang nennen.",
    source: "rule",
  },
  nextLine: "Was genau umfasst das andere Angebot — und woran messen Sie den Unterschied?",
};

function session(partial: Partial<CoachHandoffSource> = {}): CoachHandoffSource {
  const turns: TranscriptTurn[] = [
    { id: "c1", speaker: "counterpart", text: "36.000 Euro. Warum so teuer?" },
    { id: "t1", speaker: "trainee", text: "Was umfasst das Angebot?" },
  ];
  return {
    id: "s1",
    status: "ended",
    scenarioId: "S01",
    scenarioTitle: "Honorarvergleich am Tisch",
    counterpartName: "Elisabeth Leitner",
    publicBrief: "12.000 Euro Unterschied, 36.000 Vergleich.",
    verticalId: "immobilien",
    focusId: "diagnosis",
    focusLabel: "Lage zuerst",
    turns,
    evaluation: leakyEval,
    ...partial,
  };
}

test("Deep-Link trägt dieselbe turnId wie der Debrief-Anker", () => {
  const href = coachHandoffHref({ sessionId: "s1", turnId: "t1", focusId: "diagnosis" });
  assert.equal(href, "/coach?session=s1&turn=t1&focus=diagnosis");
  assert.equal(debriefTurnDomId("t1"), "turn-t1");
  assert.equal(parseCoachHandoffSearchParams({}), null);
  assert.deepEqual(parseCoachHandoffSearchParams({ session: "s1", turn: "t1" }), {
    sessionId: "s1",
    turnId: "t1",
    focusId: null,
  });
});

test("erster Coach-Satz ist 1+1+Zitat+Phrase, keine Rubrik, keine Isolation", () => {
  const handoff = resolveCoachHandoff(session(), "t1");
  assert.equal(handoff.turnId, "t1");
  assert.equal(handoff.quote, "Was umfasst das Angebot?");
  assert.match(handoff.recap, /Umfang gefragt/);
  assert.match(handoff.phrase, /umfasst das andere Angebot/);
  const text = formatSpotlight(spotlightFromHandoff(handoff));
  assert.equal(handoffLeaksScorecard(text), false);
  assert.equal(handoffSellsIsolation(text), false);
  assert.doesNotMatch(text, /2\s*\/\s*4|Diagnosis|Isolation|Rubrik|verdeckter Zustand/);
  const parsed = parseSpotlight(text);
  assert.ok(parsed?.phrase);
});

test("S01/S02/S03 mappen auf eine Enablement-Situation", () => {
  assert.equal(situationForHandoff("diagnosis", "Honorar 36.000 Leistungsumfang"), "konditionen");
  assert.equal(situationForHandoff("boundary", "Ich verkaufe nicht"), "absage");
  assert.equal(situationForHandoff("authority", "Wer muss zustimmen"), "entscheidung");
  assert.equal(situationForHandoff("boundary", "zu teuer Einwand"), "einwand");
});

test("Einwand-Review nur bei Einwand, 12 Karten keine 12 Screens", () => {
  const einwand = reviewQuestionsForHandoff({
    quote: "Zu teuer",
    focusLabel: "Grenze halten",
    situation: "einwand",
    phrase: "Ist das der Hauptpunkt?",
  });
  assert.ok(einwand.some((item) => item.title === "Einwand aufnehmen"));
  const price = reviewQuestionsForHandoff({
    quote: "36.000",
    focusLabel: "Lage zuerst",
    situation: "konditionen",
    phrase: "Was umfasst das Angebot?",
  });
  assert.ok(!price.some((item) => /Einwand/.test(item.title)));
  assert.equal(ENABLEMENT_CARDS.length, 12);
  assert.equal(ENABLEMENT_CARDS.filter((card) => card.situation === null).length, 1);
  const groups = groupEnablementPrompts(VERTICALS.immobilien.coachPrompts, { includeEinwand: false });
  assert.ok(!groups.some((group) => group.id === "einwand"));
  assert.ok(groups.some((group) => group.prompts.some((p) => p.title === "Nächster angemessener Schritt")));
});

test("Deficit-Stärke und Affektlabel kommen nicht in den ersten Coach-Satz", () => {
  const handoff = resolveCoachHandoff(
    session({
      evaluation: {
        ...leakyEval,
        strength: "Es gibt keine Stärke, da kein respektvolles Ende erreicht wurde.",
        keyMoment: {
          ...leakyEval.keyMoment!,
          whatHappened: "Die Gegenseite wurde gereizt.",
        },
      },
    }),
    "t1",
  );
  assert.doesNotMatch(handoff.recap, /keine Stärke|gereizt/i);
  assert.match(handoff.recap, /Elisabeth Leitner|Lage zuerst/);
  assert.doesNotMatch(handoff.lever, /gereizt/i);
});

test("Playbook-Titel ohne Trainerakronym; publicContext ohne Scorecard", () => {
  assert.equal(playbookHeading(playbookFor("erstkontakt")), "Wer, weshalb, Nein ist erlaubt");
  const handoff = resolveCoachHandoff(session());
  const ctx = handoffPublicContext(session(), handoff);
  assert.doesNotMatch(ctx, /2\s*\/\s*4|Isolation|Rubrik|verdeckter Zustand/);
  assert.match(ctx, /Stelle: „Was umfasst das Angebot\?“/);
  assert.match(handoff.goal, /Leistungsumfang/);
  assert.equal(handoff.beats.length, 3);
  assert.match(ctx, /TRAININGSZIELE/);
  assert.match(ctx, /Leistungsumfang klären/);
});

test("Talk-Track und Handoff liegen nicht im Role Player", () => {
  const files = [
    "components/training/liveCall.ts",
    "components/training/bargeIn.ts",
    "lib/live-text.ts",
    "lib/openai-realtime.ts",
    "src/role-engine/persona-prompt.ts",
    "src/role-engine/characters.ts",
  ];
  for (const file of files) {
    const text = readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(text, /coach-handoff|ENABLEMENT_CARDS|formatPlaybooks/);
  }
});
