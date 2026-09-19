import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildCallContext,
  classifyTraineeTurn,
  contextForPrompt,
  describeShift,
  findTurningPoint,
  ruleCounterfactual,
} from "../callContext";
import { characterForScenario } from "../characters";
import { calibrationFor, capScoredDimensions, finalizeEvaluation, isAbsenceOnlyRationale, resolveEvidence, verbatimQuote } from "../evaluationGuard";
import { mockEvaluate } from "../mockEvaluator";
import type { Evaluation, TranscriptTurn } from "../types";

const opening = (id: string, text: string): TranscriptTurn => ({ id, speaker: "counterpart", text });
const sie = (id: string, text: string): TranscriptTurn => ({ id, speaker: "trainee", text });

test("Klarheit: Artefakte, Einwortäußerungen und Buchstabensalat sind keine Beiträge", () => {
  assert.equal(classifyTraineeTurn("Untertitel im Auftrag des ZDF für funk, 2017").reason, "transkript_artefakt");
  assert.equal(classifyTraineeTurn("Untertitel der Amara.org-Community").reason, "transkript_artefakt");
  assert.equal(classifyTraineeTurn("dcvxvfvdsf").reason, "unverstaendlich");
  assert.equal(classifyTraineeTurn("Mhm.").reason, "zu_kurz");
  assert.equal(classifyTraineeTurn("Ja.").reason, "zu_kurz");
  assert.equal(classifyTraineeTurn("Feiertabeln... !... ... .... ...").reason, "zu_kurz");
  assert.equal(classifyTraineeTurn("Wo von dabei?").reason, "unverstaendlich");
  assert.equal(classifyTraineeTurn("Mag ich dir kurz.").reason, "unverstaendlich");
  assert.equal(classifyTraineeTurn("Ein paar Krimsoseletsch.").reason, "unverstaendlich");
  assert.equal(classifyTraineeTurn("Damit Semmen wurde").reason, "unverstaendlich");
  assert.equal(classifyTraineeTurn("Was umfasst das andere Angebot genau?").clear, true);
  assert.equal(classifyTraineeTurn("Verstanden. Ich vermerke das. Auf Wiederhören.").clear, true);
});

test("Kalibrierung: kein Beitrag → keine Scores; ein Satz → maximal 2; zwei → 3; ab drei → 4", () => {
  assert.equal(calibrationFor(0, 0).maxScore, null);
  assert.equal(calibrationFor(0, 3).maxScore, null);
  assert.match(calibrationFor(0, 3).note ?? "", /Transkript-Artefakt/);
  assert.equal(calibrationFor(1, 0).maxScore, 2);
  assert.equal(calibrationFor(2, 0).maxScore, 3);
  assert.equal(calibrationFor(3, 0).maxScore, 4);
  assert.equal(calibrationFor(3, 0).note, null);
});

test("Zitat muss wörtlich im Trainee-Turn stehen — Anführungszeichen und Leerraum sind egal", () => {
  assert.equal(verbatimQuote("„Was umfasst das Angebot?“", "Ja. Was umfasst   das Angebot? Danke."), "Was umfasst das Angebot?");
  assert.equal(verbatimQuote("Mehrwert erklären", "Was umfasst das Angebot?"), null);
});

test("Belege: nur Trainee-Turns zählen, Gegenseite fällt raus", () => {
  const transcript = [opening("c1", "Warum sollte ich Ihnen 48.000 zahlen?"), sie("t1", "Was umfasst das andere Angebot genau?")];
  const fromCounterpart = resolveEvidence(["c1"], "Warum sollte ich Ihnen 48.000 zahlen?", transcript);
  assert.equal(fromCounterpart.valid, false);
  const fromTrainee = resolveEvidence(["t1"], "Was umfasst das andere Angebot", transcript);
  assert.equal(fromTrainee.valid, true);
  assert.equal(fromTrainee.quote, "Was umfasst das andere Angebot");
  const quoteOnly = resolveEvidence([], "das andere Angebot genau", transcript);
  assert.deepEqual(quoteOnly.turnIds, ["t1"]);
});

test("N/A-Regel: Score ohne eigenen Beleg wird null, Score der Gegenseite fliegt", () => {
  const transcript = [
    opening("c1", "Ein anderer Makler macht das um 36.000 Euro."),
    sie("t1", "Was umfasst das Angebot des anderen Maklers genau?"),
    opening("c2", "Nur Vermittlung."),
    sie("t2", "Dann ist der Unterschied die Aufbereitung und die Käuferqualifizierung."),
    sie("t3", "Passt es Ihnen, wenn ich das am Dienstag um zehn vorbeibringe?"),
  ];
  const raw: Partial<Evaluation> = {
    scores: [
      { dimension: "diagnosis", score: 4, evidenceTurnIds: ["t1"], quote: "Was umfasst das Angebot", rationale: "Konkrete Frage." },
      { dimension: "truthfulness", score: 5, evidenceTurnIds: ["c2"], quote: "Nur Vermittlung.", rationale: "Kunde war ehrlich." },
      { dimension: "contextual_fit", score: 3, evidenceTurnIds: [], quote: "", rationale: "Passt." },
    ],
  };
  const ev = finalizeEvaluation(raw, transcript, null, { engine: "openai" });
  const diagnosis = ev.scores.find((s) => s.dimension === "diagnosis")!;
  assert.equal(diagnosis.score, 4);
  assert.equal(diagnosis.quote, "Was umfasst das Angebot");
  const truth = ev.scores.find((s) => s.dimension === "truthfulness")!;
  assert.equal(truth.score, null);
  assert.deepEqual(truth.evidenceTurnIds, []);
  assert.match(truth.rationale, /Nicht belegbar/);
  const fit = ev.scores.find((s) => s.dimension === "contextual_fit")!;
  assert.equal(fit.score, null);
  const decision = ev.scores.find((s) => s.dimension === "decision_process")!;
  assert.equal(decision.score, null);
  assert.match(decision.rationale, /Keine Gelegenheit/);
  assert.equal(ev.scores.length, 6);
  assert.ok(ev.abstainNote);
});

test("Kalibrierung greift: ein Satz kann kein 4/4 tragen", () => {
  const transcript = [opening("c1", "Ich will nicht verkaufen."), sie("t1", "Verstanden. Ich vermerke das. Auf Wiederhören.")];
  const raw: Partial<Evaluation> = {
    scores: [{ dimension: "contextual_fit", score: 4, evidenceTurnIds: ["t1"], quote: "Verstanden.", rationale: "Grenze respektiert." }],
  };
  const ev = finalizeEvaluation(raw, transcript, null, { engine: "mock" });
  const fit = ev.scores.find((s) => s.dimension === "contextual_fit")!;
  assert.equal(fit.score, 2);
  assert.match(fit.rationale, /Gedeckelt auf 2/);
  assert.equal(ev.calibration?.maxScore, 2);
});

test("Ohne verständlichen Beitrag: alles N/A, keine erfundene Stärke, kein Schlüsselmoment aus Artefakten", () => {
  const transcript = [
    opening("c1", "Warum rufen Sie an?"),
    sie("t1", "Untertitel der Amara.org-Community"),
    opening("c2", "Ich habe Sie nicht verstanden."),
    sie("t2", "Ich höre…"),
  ];
  const raw: Partial<Evaluation> = {
    strength: "Die Kundin blieb geduldig.",
    scores: [{ dimension: "contextual_fit", score: 1, evidenceTurnIds: ["t2"], quote: "Ich höre…", rationale: "Unpassend." }],
  };
  const ev = finalizeEvaluation(raw, transcript, null, { engine: "openai" });
  assert.ok(ev.scores.every((s) => s.score === null));
  assert.equal(ev.calibration?.maxScore, null);
  assert.match(ev.strength, /Kein verständlicher eigener Beitrag/);
  assert.doesNotMatch(ev.strength, /Kundin/);
  assert.ok(ev.keyMoment);
  assert.match(ev.keyMoment!.counterfactual, /nicht verstanden/);
});

test("Wendepunkt aus dem verdeckten Verlauf: Druck nach der Preisfrage kippt die Eigentümerin", () => {
  const character = characterForScenario("S01");
  const transcript = [
    opening("c1", character.opening),
    sie("t1", "Verstehe. Was umfasst das Angebot des anderen Maklers genau?"),
    opening("c2", "Das weiß ich nicht so genau."),
    sie("t2", "Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen."),
    opening("c3", "Das ist mir zu viel Druck."),
  ];
  const ctx = buildCallContext(character, transcript);
  assert.equal(ctx.clearTraineeTurns, 2);
  assert.ok(ctx.turningPoint);
  assert.equal(ctx.turningPoint!.turnId, "t2");
  assert.ok(ctx.turningPoint!.shift < 0);
  assert.ok(ctx.traces[0].disclosed.includes("competitor_scope"));
  assert.equal(ctx.remainingHidden.length, 0);
  const reading = describeShift(ctx.turningPoint!, character.identity.name);
  assert.match(reading, /kippte Elisabeth Leitner/);
  assert.match(reading, /Gereiztheit \d+ → \d+/);
  assert.match(ruleCounterfactual(ctx.turningPoint!, ctx.remainingHidden), /gedrängt|drängen/);
});

test("Ohne Einbruch zählt die Öffnung — und der Öffner bleibt ohne Fakteninhalt", () => {
  const character = characterForScenario("S03");
  const transcript = [
    opening("c1", character.opening),
    sie("t1", "Guten Tag, ich bin Makler. Danke für die Offenheit."),
    opening("c2", "Gern."),
    sie("t2", "Was müsste für Ihre Schwester passen, damit Sie beide entscheiden können?"),
  ];
  const ctx = buildCallContext(character, transcript);
  assert.equal(ctx.turningPoint?.turnId, "t2");
  assert.ok(ctx.turningPoint!.disclosed.includes("sister_concern"));
  assert.match(describeShift(ctx.turningPoint!, "Andreas Huber"), /öffnete sich Andreas Huber/);
  const untouched = buildCallContext(character, [opening("c1", character.opening), sie("t1", "Dann haben wir den Auftrag. Ich schicke Ihnen die Bestätigung.")]);
  assert.equal(untouched.remainingHidden[0]?.opener, "dem, was die Schwester zögern lässt");
  assert.doesNotMatch(JSON.stringify(untouched.remainingHidden), /Bindungsdauer/);
  const hiddenState = JSON.stringify(contextForPrompt(untouched, (id) => id));
  assert.doesNotMatch(hiddenState, /innerLife|INNERES|zu lange gebunden|Bindungsdauer/);
});

test("Auflege-Grund der Figur landet im Auswertungskontext — ohne Fakteninhalt", () => {
  const character = characterForScenario("S01");
  const transcript = [
    opening("c1", character.opening),
    sie("t1", "Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen."),
  ];
  const ended = buildCallContext(character, transcript, undefined, undefined, {
    ...character.initialState,
    status: "ended",
    hangupReason: "boundary_ignored",
    hangupTrigger: "Live: Grenze übergangen",
  });
  assert.equal(ended.hangup?.reason, "boundary_ignored");
  assert.equal(ended.hangup?.label, "Grenze übergangen");
  const prompt = contextForPrompt(ended, (id) => id);
  assert.equal(prompt.hangup?.reading, "Die Figur hat aufgelegt: Grenze übergangen.");
  assert.equal(prompt.hangup?.trigger, "Live: Grenze übergangen");
  assert.doesNotMatch(JSON.stringify(prompt), /Bindungsdauer|Provision|innerLife|INNERES|Magda/);

  // Trainee hat aufgelegt oder Sitzung läuft: kein hangup im Kontext.
  const traineeEnded = buildCallContext(character, transcript, undefined, undefined, { ...character.initialState, status: "ended" });
  assert.equal(traineeEnded.hangup, null);
  assert.equal(contextForPrompt(traineeEnded, (id) => id).hangup, null);
  assert.equal(buildCallContext(character, transcript).hangup, null);
});

test("Ein Satz zählt nicht auf sechs Dimensionen: Fokus bleibt, Rest wird N/A", () => {
  const transcript = [opening("c1", "Warum 48.000?"), sie("t1", "Dann mache ich es auch um 36.000 Euro.")];
  const mk = (dimension: Evaluation["scores"][number]["dimension"]) => ({
    dimension,
    score: 0,
    evidenceTurnIds: ["t1"],
    quote: "36.000",
    rationale: "Konzession ohne Diagnose.",
  });
  const ev = finalizeEvaluation(
    { scores: [mk("diagnosis"), mk("contextual_fit"), mk("commercial_judgment"), mk("next_step")] },
    transcript,
    null,
    { engine: "openai", focusDimension: "commercial_judgment" },
  );
  const scored = ev.scores.filter((s) => s.score !== null).map((s) => s.dimension);
  assert.deepEqual(scored, ["diagnosis", "commercial_judgment"]);
  const fit = ev.scores.find((s) => s.dimension === "contextual_fit")!;
  assert.match(fit.rationale, /Nicht separat bewertet/);
  assert.deepEqual(capScoredDimensions(ev.scores, 3), ev.scores);
});

test("Stärke: ohne Beleg-Turn wird strengthTurnId null, Regelpfad lässt das Feld offen", () => {
  const transcript = [opening("c1", "Warum?"), sie("t1", "Was umfasst das andere Angebot genau, damit ich vergleichen kann?")];
  const none = finalizeEvaluation({ strength: "Keine Stärke.", strengthTurnId: null }, transcript, null, { engine: "openai" });
  assert.equal(none.strengthTurnId, null);
  const belegt = finalizeEvaluation({ strength: "Konkrete Frage.", strengthTurnId: "t1" }, transcript, null, { engine: "openai" });
  assert.equal(belegt.strengthTurnId, "t1");
  const counterpart = finalizeEvaluation({ strength: "x", strengthTurnId: "c1" }, transcript, null, { engine: "openai" });
  assert.equal(counterpart.strengthTurnId, null);
  const mock = finalizeEvaluation({ strength: "Regel-Stärke." }, transcript, null, { engine: "mock" });
  assert.equal(mock.strengthTurnId, undefined);
});

test("findTurningPoint: kein Turn → null", () => {
  assert.equal(findTurningPoint([]), null);
});

test("finalizeEvaluation übernimmt den Modell-Schlüsselmoment nur mit gültigem Trainee-Turn", () => {
  const character = characterForScenario("S01");
  const transcript = [
    opening("c1", character.opening),
    sie("t1", "Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen."),
    opening("c2", "Das ist mir zu viel Druck."),
  ];
  const ctx = buildCallContext(character, transcript);
  const fromCounterpart = finalizeEvaluation(
    { keyMoment: { turnId: "c1", quote: "", whatHappened: "", counterfactual: "", source: "model" } },
    transcript,
    ctx,
    { engine: "openai" },
  );
  assert.equal(fromCounterpart.keyMoment?.turnId, "t1");
  assert.equal(fromCounterpart.keyMoment?.source, "affect");
  assert.equal(fromCounterpart.importantMomentTurnId, "t1");

  const fromModel = finalizeEvaluation(
    {
      keyMoment: { turnId: "t1", quote: "Letzte Chance", whatHappened: "Sie hat den Druck gehört.", counterfactual: "Hätten Sie mich gefragt, was der andere macht, hätte ich es gesagt.", source: "model" },
      repeatPrompt: "Nur beobachtbare Aspekte bewerten.",
      nextStep: "Fragen Sie nach dem Leistungsumfang des anderen Angebots.",
    },
    transcript,
    ctx,
    { engine: "openai", rubricRule: "Nur beobachtbare Aspekte bewerten." },
  );
  assert.equal(fromModel.keyMoment?.quote, "Letzte Chance");
  assert.equal(fromModel.keyMoment?.source, "model");
  assert.match(fromModel.repeatPrompt, /Dieselbe Stelle/);
  assert.match(fromModel.repeatPrompt, /zu viel Druck/);
});

test("Wahrhaftigkeit: Abwesenheit ist N/A, erfundene Käufer bleiben 0", () => {
  const clean = mockEvaluate("S01", [
    opening("c1", "Warum sollte ich 48.000 zahlen?"),
    sie("t1", "Was umfasst das andere Angebot genau?"),
  ]);
  assert.equal(clean.scores.find((s) => s.dimension === "truthfulness")?.score, null);

  const fake = mockEvaluate("S01", [
    opening("c1", "Warum sollte ich 48.000 zahlen?"),
    sie("t1", "Ich habe drei Käufer, die fixen."),
  ]);
  assert.equal(fake.scores.find((s) => s.dimension === "truthfulness")?.score, 0);
});

test("Guard: rationale die nur Abwesenheit behauptet wird N/A", () => {
  assert.equal(isAbsenceOnlyRationale("Keine grob unbelegte Käuferzahl im Transkript erkennbar."), true);
  assert.equal(isAbsenceOnlyRationale("Käufer und Mehrerlös sind im Fall nicht belegt."), false);
  const transcript = [opening("c1", "Warum?"), sie("t1", "Was umfasst das andere Angebot genau?")];
  const ev = finalizeEvaluation(
    {
      scores: [
        {
          dimension: "truthfulness",
          score: 3,
          evidenceTurnIds: ["t1"],
          quote: "Was umfasst",
          rationale: "Keine grob unbelegte Käuferzahl im Transkript erkennbar.",
        },
      ],
    },
    transcript,
    null,
    { engine: "openai" },
  );
  assert.equal(ev.scores.find((s) => s.dimension === "truthfulness")?.score, null);
});

test("Härtetest Wahrhaftigkeit: Superlativ-Pitch → max 0, keine Stärke", () => {
  const pitch =
    "Guten Tag Herr Berger, wir sind das größte Maklerhaus in Wien mit tollen Referenzen und einzigartigen Angeboten.";
  const transcript = [opening("c1", "Ich will nicht verkaufen."), sie("t1", pitch)];
  const ev = finalizeEvaluation(
    {
      scores: [
        {
          dimension: "truthfulness",
          score: 3,
          evidenceTurnIds: ["t1"],
          quote: "größte Maklerhaus",
          rationale: "Die Aussage über das Maklerhaus ist wahrheitsgemäß und belegt.",
        },
      ],
      strength: "Klare Positionierung als Marktführer.",
      strengthTurnId: "t1",
    },
    transcript,
    null,
    { engine: "openai" },
  );
  const truth = ev.scores.find((s) => s.dimension === "truthfulness")!;
  assert.equal(truth.score, 0);
  assert.match(truth.rationale, /Superlativ|Marktführer|höchstens 0/i);
  assert.equal(ev.strengthTurnId, null);
  assert.match(ev.strength, /Keine belastbare Stärke/);
});

test("Härtetest Wahrhaftigkeit: großes Maklerhaus / Marktführer → max 0", () => {
  const transcript = [
    opening("c1", "Wer sind Sie?"),
    sie("t1", "Grüß Gott, wir sind ein großes Maklerhaus mit tollen Referenzen und vielen zufriedenen Kunden."),
    sie("t2", "Unsere Kunden sind begeistert, wir sind Marktführer in der Region."),
  ];
  const ev = finalizeEvaluation(
    {
      scores: [
        {
          dimension: "truthfulness",
          score: 2,
          evidenceTurnIds: ["t1"],
          quote: "großes Maklerhaus",
          rationale: "Vage, aber nicht erfunden.",
        },
      ],
    },
    transcript,
    null,
    { engine: "openai" },
  );
  assert.equal(ev.scores.find((s) => s.dimension === "truthfulness")?.score, 0);
});

test("Härtetest Wahrhaftigkeit: letzte Chance → max 0, keine Stärke", () => {
  const transcript = [
    opening("c1", "Ich überlege noch."),
    sie("t1", "Sie müssen sofort abschließen. Letzte Chance, packen wir das fix abschließen."),
  ];
  const ev = finalizeEvaluation(
    {
      scores: [
        {
          dimension: "truthfulness",
          score: 2,
          evidenceTurnIds: ["t1"],
          quote: "Letzte Chance",
          rationale: "Entschlossenheit zeigt Wahrhaftigkeit.",
        },
      ],
      strength: "Sie zeigen Entschlossenheit beim Abschluss.",
      strengthTurnId: "t1",
    },
    transcript,
    null,
    { engine: "openai" },
  );
  assert.equal(ev.scores.find((s) => s.dimension === "truthfulness")?.score, 0);
  assert.equal(ev.strengthTurnId, null);
  assert.match(ev.strength, /Keine belastbare Stärke/);
});

test("Härtetest Wahrhaftigkeit: saubere Diagnose-Frage bleibt N/A", () => {
  const transcript = [
    opening("c1", "Warum 48.000?"),
    sie("t1", "Was umfasst das Angebot des anderen Maklers genau?"),
  ];
  const ev = finalizeEvaluation(
    {
      scores: [
        {
          dimension: "truthfulness",
          score: 3,
          evidenceTurnIds: ["t1"],
          quote: "Was umfasst",
          rationale: "Keine grob unbelegte Käuferzahl im Transkript erkennbar.",
        },
      ],
      strength: "Sie klären den Leistungsumfang.",
      strengthTurnId: "t1",
    },
    transcript,
    null,
    { engine: "openai" },
  );
  assert.equal(ev.scores.find((s) => s.dimension === "truthfulness")?.score, null);
  assert.equal(ev.strengthTurnId, "t1");
});
