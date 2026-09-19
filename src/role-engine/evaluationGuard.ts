import { oneSentence } from "@/lib/spotlight";
import { classifyTraineeTurn, describeShift, ruleCounterfactual, type CallContext } from "./callContext";
import { RUBRIC_ANCHORS, RUBRIC_DIMENSIONS } from "./rubricAnchors";
import type {
  DimensionScore,
  Evaluation,
  EvaluationCalibration,
  KeyMoment,
  RubricDimension,
  TranscriptTurn,
} from "./types";
import {
  TRUTHFULNESS_CLAIM_MAX_SCORE,
  claimKindLabel,
  detectUnverifiableClaim,
  findUnverifiableClaimTurns,
  type UnverifiableClaimHit,
} from "./unverifiableClaims";

/**
 * Kritiker im Code: prüft Belege, setzt N/A durch, deckelt kurze Gespräche.
 * Läuft nach jeder Auswertung — Modell oder Regel-Fallback — und ist deterministisch.
 */

export const ABSTAIN_NOTE = "N/A heißt: keine Gelegenheit oder kein Beleg im eigenen Wortlaut — nicht Note 0.";

function countLabel(n: number) {
  return n === 1 ? "1 klarer Beitrag" : `${n} klare Beiträge`;
}

/** Unter drei klaren Beiträgen trägt kein Satz eine hohe Note (Handbuch §5). */
export function calibrationFor(clearTraineeTurns: number, unclearTraineeTurns: number): EvaluationCalibration {
  const maxScore = clearTraineeTurns === 0 ? null : clearTraineeTurns === 1 ? 2 : clearTraineeTurns === 2 ? 3 : 4;
  let note: string | null = null;
  if (maxScore === null) {
    note =
      unclearTraineeTurns > 0
        ? `Kein verständlicher eigener Beitrag (${unclearTraineeTurns} unklar oder Transkript-Artefakt) — keine Bewertung, nur Wiederholung.`
        : "Kein eigener Beitrag — keine Bewertung, nur Wiederholung.";
  } else if (maxScore < 4) {
    note = `Kurzes Gespräch: ${countLabel(clearTraineeTurns)} — Scores gedeckelt bei ${maxScore}. Ein Satz trägt keine hohe Note.`;
  }
  return { clearTraineeTurns, unclearTraineeTurns, maxScore, note };
}

function normalize(text: string) {
  return text.replace(/[„“"‚‘'»«]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Liefert das Zitat in Originalschreibung, wenn es wörtlich im Turn steht — sonst null. */
export function verbatimQuote(quote: string, turnText: string): string | null {
  const q = normalize(quote);
  if (!q) return null;
  const t = normalize(turnText);
  if (t === q) return turnText.trim();
  const at = t.indexOf(q);
  if (at < 0) return null;
  // Position im normalisierten Text zurück auf den Originaltext mappen (grob, aber wörtlich).
  const original = turnText.replace(/[„“"‚‘'»«]/g, "").replace(/\s+/g, " ").trim();
  const lower = original.toLowerCase();
  const start = lower.indexOf(q);
  return start >= 0 ? original.slice(start, start + q.length) : turnText.trim();
}

export type ResolvedEvidence = { turnIds: string[]; quote: string; valid: boolean };

/** Nur klare Trainee-Turns sind Belege; das Zitat muss wörtlich darin stehen. */
export function resolveEvidence(
  evidenceTurnIds: string[] | undefined,
  quote: string | undefined,
  transcript: TranscriptTurn[],
): ResolvedEvidence {
  const trainee = transcript.filter((t) => t.speaker === "trainee" && classifyTraineeTurn(t.text).clear);
  const ids = [...new Set((evidenceTurnIds ?? []).filter((id) => trainee.some((t) => t.id === id)))];
  let resolvedQuote = "";
  if (quote?.trim()) {
    const preferred = ids.map((id) => trainee.find((t) => t.id === id)!);
    const pool = [...preferred, ...trainee.filter((t) => !ids.includes(t.id))];
    for (const turn of pool) {
      const hit = verbatimQuote(quote, turn.text);
      if (hit) {
        resolvedQuote = hit;
        if (!ids.includes(turn.id)) ids.unshift(turn.id);
        break;
      }
    }
  }
  if (!resolvedQuote && ids.length > 0) {
    resolvedQuote = trainee.find((t) => t.id === ids[0])?.text.trim() ?? "";
  }
  return { turnIds: ids, quote: resolvedQuote, valid: ids.length > 0 && resolvedQuote.length > 0 };
}

function clampScore(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(4, Math.round(value)));
}

/** Halo: „nichts Falsches gefunden“ ist keine Note 3, sondern N/A. */
export function isAbsenceOnlyRationale(rationale: string): boolean {
  const t = normalize(rationale);
  if (!t) return false;
  const absence = /^(keine (grob )?unbelegte|keine erfundenen)/.test(t);
  if (!absence) return false;
  return /(erkennbar|vordergrund|transkript|in diesem fall)/.test(t);
}

function finalizeScore(
  dimension: RubricDimension,
  raw: Partial<DimensionScore> | undefined,
  transcript: TranscriptTurn[],
  calibration: EvaluationCalibration,
): DimensionScore {
  const anchor = RUBRIC_ANCHORS[dimension];
  if (!raw) {
    return {
      dimension,
      score: null,
      evidenceTurnIds: [],
      quote: "",
      rationale: `Keine Gelegenheit in diesem Gespräch. ${anchor.abstain}`,
    };
  }
  let score = clampScore(raw.score);
  let rationale = (raw.rationale ?? "").trim();
  if (score !== null && isAbsenceOnlyRationale(rationale)) {
    return {
      dimension,
      score: null,
      evidenceTurnIds: [],
      quote: "",
      rationale,
    };
  }
  const evidence = resolveEvidence(raw.evidenceTurnIds, raw.quote, transcript);

  if (score !== null && calibration.maxScore === null) {
    score = null;
    rationale = "Kein klarer eigener Beitrag — nichts zu bewerten.";
  } else if (score !== null && !evidence.valid) {
    score = null;
    rationale = `Nicht belegbar: kein eigener Wortlaut als Beleg.${rationale ? ` (${rationale})` : ""}`;
  } else if (score !== null && calibration.maxScore !== null && score > calibration.maxScore) {
    rationale = `${rationale} Gedeckelt auf ${calibration.maxScore}: nur ${countLabel(calibration.clearTraineeTurns)}.`.trim();
    score = calibration.maxScore;
  }

  return {
    dimension,
    score,
    evidenceTurnIds: score === null && !evidence.valid ? [] : evidence.turnIds,
    quote: score === null && !evidence.valid ? "" : evidence.quote,
    rationale: rationale || (score === null ? `Keine Gelegenheit. ${anchor.abstain}` : anchor.observes),
  };
}

function finalizeKeyMoment(
  raw: KeyMoment | null | undefined,
  transcript: TranscriptTurn[],
  ctx: CallContext | null,
): KeyMoment | null {
  const trainee = transcript.filter((t) => t.speaker === "trainee");
  if (trainee.length === 0) return null;

  const affectMoment: KeyMoment | null = ctx?.turningPoint
    ? {
        turnId: ctx.turningPoint.turnId,
        quote: ctx.turningPoint.text.trim(),
        whatHappened: describeShift(ctx.turningPoint, ctx.counterpartName),
        counterfactual: ruleCounterfactual(ctx.turningPoint, ctx.remainingHidden),
        source: "affect",
      }
    : null;

  if (raw && typeof raw.turnId === "string") {
    const turn = trainee.find((t) => t.id === raw.turnId);
    if (turn) {
      const quote = verbatimQuote(raw.quote ?? "", turn.text) ?? turn.text.trim();
      const sameAsAffect = affectMoment?.turnId === turn.id;
      if (!classifyTraineeTurn(turn.text).clear) {
        // Unverständlicher Turn: keine Deutung des Modells („entspannte sich“) durchlassen.
        const trace = ctx?.traces.find((t) => t.turnId === turn.id);
        return {
          turnId: turn.id,
          quote,
          whatHappened: trace
            ? describeShift(trace, ctx!.counterpartName)
            : "Am Hörer kam kein verständlicher Satz an — die Gegenseite hatte nichts, worauf sie antworten konnte.",
          counterfactual:
            "Ich habe nicht verstanden, was Sie von mir wollen — ein klarer Satz, warum Sie anrufen, und ich hätte zugehört.",
          source: "rule",
        };
      }
      const whatHappened =
        raw.whatHappened?.trim() ||
        (sameAsAffect ? affectMoment!.whatHappened : "") ||
        "An dieser Stelle drehte das Gespräch.";
      const counterfactual =
        raw.counterfactual?.trim() ||
        (sameAsAffect ? affectMoment!.counterfactual : "") ||
        (affectMoment?.counterfactual ?? "");
      return { turnId: turn.id, quote, whatHappened, counterfactual, source: "model" };
    }
  }
  if (affectMoment) return affectMoment;

  // Regel-Fallback: letzter klarer Beitrag, sonst der letzte überhaupt.
  const lastClear = [...trainee].reverse().find((t) => classifyTraineeTurn(t.text).clear);
  const last = lastClear ?? trainee[trainee.length - 1];
  return {
    turnId: last.id,
    quote: last.text.trim(),
    whatHappened: lastClear
      ? "Danach kam von der Gegenseite nichts mehr, was das Gespräch weitergebracht hätte."
      : "Am Hörer kam kein verständlicher Satz an — die Gegenseite hatte nichts, worauf sie antworten konnte.",
    counterfactual: lastClear
      ? "Eine Frage zu meiner Lage statt einer Aussage über Ihr Angebot — dann wäre ich dran geblieben."
      : "Ich habe nicht verstanden, was Sie von mir wollen — ein klarer Satz, warum Sie anrufen, und ich hätte zugehört.",
    source: "rule",
  };
}

function repeatPromptFor(raw: string | undefined, transcript: TranscriptTurn[], nextStep: string, rubricRule?: string) {
  const trimmed = (raw ?? "").trim();
  const echoesRule = rubricRule ? normalize(trimmed) === normalize(rubricRule) : false;
  if (trimmed && !echoesRule && trimmed.length > 15) return trimmed;
  const lastCounterpart = [...transcript].reverse().find((t) => t.speaker === "counterpart")?.text;
  return lastCounterpart
    ? `Dieselbe Stelle: antworten Sie erneut auf „${lastCounterpart}“. Ziel: ${nextStep}`
    : nextStep;
}

/**
 * Ein einzelner Satz darf nicht auf allen sechs Dimensionen gleichzeitig zählen
 * (Handbuch: kein Doppelabzug). Bei einem klaren Beitrag bleiben höchstens zwei
 * Dimensionen bewertet: die Fokus-Dimension und die erste weitere in Rubrikreihenfolge.
 */
export function capScoredDimensions(
  scores: DimensionScore[],
  clearTraineeTurns: number,
  focusDimension?: RubricDimension,
): DimensionScore[] {
  if (clearTraineeTurns !== 1) return scores;
  const scored = scores.filter((s) => s.score !== null);
  if (scored.length <= 2) return scores;
  const keep = new Set<RubricDimension>();
  if (focusDimension && scored.some((s) => s.dimension === focusDimension)) keep.add(focusDimension);
  for (const s of scored) {
    if (keep.size >= 2) break;
    keep.add(s.dimension);
  }
  return scores.map((s) =>
    s.score === null || keep.has(s.dimension)
      ? s
      : {
          ...s,
          score: null,
          rationale: `Nicht separat bewertet: derselbe Satz trägt schon ${[...keep].map((d) => RUBRIC_ANCHORS[d].label).join(" und ")}. ${s.rationale}`.trim(),
        },
  );
}

/**
 * Härtetest Wahrhaftigkeit: Superlative, Marktführer-Claims, Druck-Verknappung
 * und erfundene Fakten → Note höchstens 0; nie Stärke-Credit für denselben Turn.
 */
export function applyTruthfulnessClaimCap(
  scores: DimensionScore[],
  hits: UnverifiableClaimHit[],
): DimensionScore[] {
  if (hits.length === 0) return scores;
  const hit = hits[0]!;
  const snippet = hit.text.length > 90 ? `${hit.text.slice(0, 87)}…` : hit.text;
  const rationale = `${claimKindLabel(hit.kind)} („${snippet}“) — Wahrhaftigkeit höchstens ${TRUTHFULNESS_CLAIM_MAX_SCORE}, kein Stärke-Credit.`;
  return scores.map((s) => {
    if (s.dimension !== "truthfulness") return s;
    if (s.score !== null && s.score <= TRUTHFULNESS_CLAIM_MAX_SCORE) {
      return {
        ...s,
        score: TRUTHFULNESS_CLAIM_MAX_SCORE,
        evidenceTurnIds: s.evidenceTurnIds.length > 0 ? s.evidenceTurnIds : [hit.turnId],
        quote: s.quote || hit.text,
        rationale: s.rationale?.trim() || rationale,
      };
    }
    return {
      dimension: "truthfulness",
      score: TRUTHFULNESS_CLAIM_MAX_SCORE,
      evidenceTurnIds: [hit.turnId],
      quote: hit.text,
      rationale,
    };
  });
}

export function finalizeEvaluation(
  raw: Partial<Evaluation>,
  transcript: TranscriptTurn[],
  ctx: CallContext | null,
  opts: { engine: Evaluation["engine"]; rubricRule?: string; focusDimension?: RubricDimension },
): Evaluation {
  const spoken = transcript.filter((t) => t.speaker !== "system");
  const trainee = spoken.filter((t) => t.speaker === "trainee");
  const clear = trainee.filter((t) => classifyTraineeTurn(t.text).clear).length;
  const calibration = calibrationFor(clear, trainee.length - clear);

  const claimHits = findUnverifiableClaimTurns(spoken);
  const scores = applyTruthfulnessClaimCap(
    capScoredDimensions(
      RUBRIC_DIMENSIONS.map((dim) =>
        finalizeScore(dim, (raw.scores ?? []).find((s) => s?.dimension === dim), spoken, calibration),
      ),
      clear,
      opts.focusDimension,
    ),
    claimHits,
  );

  const keyMoment = finalizeKeyMoment(raw.keyMoment, spoken, ctx);
  const rawMoment = trainee.find((t) => t.id === raw.importantMomentTurnId);
  const importantMomentTurnId = rawMoment?.id ?? keyMoment?.turnId ?? null;

  const correction = (raw.correction ?? "").trim();
  const nextStep = oneSentence(raw.nextStep?.trim() || correction);
  const nextLine = raw.nextLine?.trim() || null;

  const noContribution = calibration.maxScore === null;
  const strengthTurn = trainee.find((t) => t.id === raw.strengthTurnId && classifyTraineeTurn(t.text).clear);
  const strengthOnClaim = strengthTurn ? detectUnverifiableClaim(strengthTurn.text) !== null : false;
  const onlyClaimTurns =
    claimHits.length > 0 &&
    !strengthTurn &&
    trainee.filter((t) => classifyTraineeTurn(t.text).clear).every((t) => detectUnverifiableClaim(t.text) !== null);
  const denyStrength = strengthOnClaim || onlyClaimTurns;
  const strengthTurnId = noContribution
    ? null
    : denyStrength
      ? null
      : (strengthTurn?.id ?? (raw.strengthTurnId === undefined ? undefined : null));
  const strength = noContribution
    ? "Kein verständlicher eigener Beitrag — hier gibt es nichts zu loben. Die Lehre sitzt im ersten Satz."
    : denyStrength
      ? "Keine belastbare Stärke: der Beitrag enthält unbelegte oder übertriebene Behauptungen."
      : (raw.strength ?? "").trim() || "In diesem Ausschnitt ist keine einzelne Stärke belastbar belegt.";
  const summary = noContribution
    ? "Am Hörer kam kein verständlicher Satz von Ihnen an. Es gibt nichts zu bewerten — nur dieselbe Stelle noch einmal, mit einem klaren ersten Satz."
    : (raw.summary ?? "").trim() || "Belegte Auswertung auf Basis des Transkripts.";

  const mustNotice = (raw.mustNotice ?? [])
    .filter((m): m is string => typeof m === "string" && m.trim().length > 0)
    .slice(0, 3);
  if (claimHits.length > 0 && !mustNotice.some((m) => /unbelegt|übertrieb|superlat|druck|verknapp/i.test(m))) {
    mustNotice.unshift(claimKindLabel(claimHits[0]!.kind));
    if (mustNotice.length > 3) mustNotice.length = 3;
  }

  return {
    engine: opts.engine,
    summary,
    strength,
    scores,
    importantMomentTurnId,
    correction,
    nextStep,
    repeatPrompt: repeatPromptFor(raw.repeatPrompt, spoken, nextStep, opts.rubricRule),
    mustNotice,
    abstainNote: scores.some((s) => s.score === null) ? ABSTAIN_NOTE : null,
    keyMoment,
    strengthTurnId,
    nextLine,
    calibration,
  };
}
