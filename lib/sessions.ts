import { randomUUID } from "node:crypto";
import { SCENARIO_VERSION } from "@/lib/content/pack";
import { db, type SessionRow, type TurnRow } from "@/lib/db";
import { reevaluateSession } from "@/lib/evaluation";
import { loadReplayCheckpoints, saveReplayCheckpoint, type ReplayCheckpoint } from "@/lib/replay-checkpoints";
import { commitDisclosures, proposeDisclosures } from "@/src/role-engine/disclosure";
import { getScenario } from "@/lib/scenarios";
import type { PracticeCue, SessionDTO } from "@/lib/session-types";
import { voiceIdForScenario } from "@/lib/voices";
import { analyzeCall } from "@/lib/call-analytics";
import { oneSentence, spotlightFromEvaluation } from "@/lib/spotlight";
import { heardFromRows } from "@/lib/heard";
import { isDuplicateUtterance, normalizeLiveText, similarLiveText } from "@/lib/live-text";
import { advanceLiveState } from "@/lib/live-turn";
import { realtimeInstructions } from "@/lib/openai-realtime";
import { fallbackRepeatTurnId, sliceForRepeat } from "@/lib/practice-loop";
import { defaultFocusForScenario, getFocus, isFocusId } from "@/lib/focus";
import { type VerticalId } from "@/lib/verticals";
import { callIdFromScenario, getRealCall, realScenarioId } from "@/lib/real-calls";
import { characterForScenario, engineMode, playTraineeTurn } from "@/src/role-engine/roleEngine";
import { hydrateAffect, voiceFeelLabel } from "@/src/role-engine/affect";
import { clampState } from "@/src/role-engine/characters";
import { hangupPolicy, hangupReasonLabel, withHangup } from "@/src/role-engine/hangup";
import { extractObservations } from "@/src/role-engine/observationExtractor";
import { reduceState } from "@/src/role-engine/stateReducer";
import { extractVocal } from "@/src/role-engine/vocalChannel";
import {
  ROLE_SCHEMA_VERSION,
  type CharacterState,
  type Evaluation,
  type HangupReason,
  type HiddenFact,
  type RoleCharacter,
  type TranscriptTurn,
  type AcousticSample,
} from "@/src/role-engine/types";

function mapTurns(rows: TurnRow[]): TranscriptTurn[] {
  return rows.map((r) => ({
    id: r.id,
    speaker: r.speaker as TranscriptTurn["speaker"],
    text: r.text,
  }));
}

function normalizeEvaluation(ev: Evaluation): Evaluation {
  const scored = [...(ev.scores ?? [])].filter((s) => s.score != null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return {
    ...ev,
    strength:
      ev.strength ||
      scored[0]?.rationale ||
      "In diesem Ausschnitt ist keine einzelne Stärke belastbar benannt.",
    nextStep: ev.nextStep?.trim() || oneSentence(ev.correction || ""),
  };
}

function loadSession(id: string): SessionRow {
  const row = db().prepare("SELECT * FROM sessions WHERE id = ?").get(id) as SessionRow | undefined;
  if (!row) throw new Error("Sitzung nicht gefunden");
  return row;
}

function loadTurns(id: string): TurnRow[] {
  return db()
    .prepare("SELECT * FROM turns WHERE session_id = ? ORDER BY seq ASC")
    .all(id) as TurnRow[];
}

export function toDto(row: SessionRow): SessionDTO {
  const scenario = getScenario(row.scenario_id);
  const turnRows = loadTurns(row.id);
  const turns = mapTurns(turnRows);
  const evalRow = db()
    .prepare("SELECT evaluation_json FROM evaluations WHERE session_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(row.id) as { evaluation_json: string } | undefined;
  const character = JSON.parse(row.character_json) as RoleCharacter;
  const verticalId = (row.vertical_id || "immobilien") as VerticalId;
  const focusId = isFocusId(row.focus_id)
    ? row.focus_id
    : defaultFocusForScenario(row.scenario_id, verticalId);
  const focus = getFocus(verticalId, focusId);
  const realCallId = callIdFromScenario(row.scenario_id);
  let scenarioTitle = scenario?.title ?? row.scenario_id;
  if (realCallId) {
    try {
      scenarioTitle = getRealCall(realCallId).title;
    } catch {
      scenarioTitle = `Echtes Gespräch mit ${character.identity.name}`;
    }
  }
  const affect = hydrateAffect(character, JSON.parse(row.state_json) as CharacterState);
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    scenarioTitle,
    realCallId,
    status: row.status,
    mode: row.mode,
    parentSessionId: row.parent_session_id,
    repeatFromTurnId: row.repeat_from_turn_id,
    engineMode: row.engine_mode,
    counterpartName: character.identity.name,
    voiceId: voiceIdForScenario(row.scenario_id, character.identity.name),
    voiceMood: affect.voice.mood,
    voiceDelivery: affect.voice,
    voiceFeel: voiceFeelLabel(affect),
    publicBrief: character.publicBrief,
    opening: character.opening,
    turns,
    evaluation: evalRow ? normalizeEvaluation(JSON.parse(evalRow.evaluation_json) as Evaluation) : null,
    createdAt: row.created_at,
    verticalId,
    focusId,
    focusLabel: focus.label,
    practiceCue: cueFromParent(row),
    heard: heardFromRows(turnRows),
  };
}

function cueFromRealCall(row: SessionRow): PracticeCue | null {
  const callId = callIdFromScenario(row.scenario_id);
  if (!callId) return null;
  try {
    const call = getRealCall(callId);
    const moment =
      call.moments.find((m) => m.turnId === row.repeat_from_turn_id) ??
      call.moments[0] ??
      null;
    if (!moment) return null;
    return {
      parentId: "",
      lever: `${moment.kindLabel} · ${moment.skillLabel}`,
      nextStep: moment.reason,
      quote: moment.quote,
      gapLabel: moment.skillLabel,
      suggestedLine: moment.suggestedLine,
    };
  } catch {
    return null;
  }
}

function spokenTurns(turns: TranscriptTurn[]): TranscriptTurn[] {
  return turns.filter((turn) => turn.speaker !== "system");
}

/**
 * Repeat-Start: Transkript schneiden und Zustand aus initialState nachspielen.
 * Der Endzustand der Elternsitzung (inkl. Auflegen) wird nicht kopiert.
 */
export function seedRepeatFromParent(
  character: RoleCharacter,
  parentTurns: TranscriptTurn[],
  untilTurnId?: string,
  checkpoints: ReadonlyMap<string, ReplayCheckpoint> = new Map(),
): { copied: TranscriptTurn[]; state: CharacterState; hiddenFacts: HiddenFact[] } {
  const copied = untilTurnId
    ? sliceForRepeat(spokenTurns(parentTurns), untilTurnId)
    : spokenTurns(parentTurns);

  let state: CharacterState = {
    ...character.initialState,
    status: "active",
    disclosedFacts: [],
    affect: hydrateAffect(character, character.initialState),
  };
  delete state.hangupReason;
  delete state.hangupTrigger;

  let hiddenFacts = character.hiddenFacts.map((fact) => ({ ...fact }));
  copied.forEach((turn, index) => {
    if (turn.speaker !== "trainee") return;
    const checkpoint = checkpoints.get(turn.id);
    if (checkpoint) {
      state = structuredClone(checkpoint.state);
      hiddenFacts = structuredClone(checkpoint.hiddenFacts);
      return;
    }
    const prior = copied.slice(0, index);
    const observations = extractObservations(character, turn, prior);
    const vocal = extractVocal(turn.text, null);
    // Legacy sessions have no checkpoints. Replay authorization before reduction,
    // in the same order as live/text turns; never infer it from literal speech.
    hiddenFacts = commitDisclosures(hiddenFacts, proposeDisclosures(character, observations, hiddenFacts, state));
    state = reduceState(character, state, observations, vocal);
    state = { ...state, disclosedFacts: hiddenFacts.filter((fact) => fact.status === "disclosed").map((fact) => fact.id) };
  });

  const disclosedIds = hiddenFacts.filter((fact) => fact.status === "disclosed").map((fact) => fact.id);
  delete state.hangupReason;
  delete state.hangupTrigger;
  state = {
    ...state,
    status: "active",
    disclosedFacts: disclosedIds,
  };

  return { copied, state, hiddenFacts };
}

function cueFromParent(row: SessionRow): PracticeCue | null {
  if (!row.parent_session_id) return cueFromRealCall(row);
  try {
    const parent = getSessionDto(row.parent_session_id);
    if (!parent.evaluation) return null;
    const moment = parent.turns.find((turn) => turn.id === parent.evaluation?.importantMomentTurnId);
    const quote = moment?.text || parent.evaluation.scores.find((score) => score.quote)?.quote || "";
    const spotlight = spotlightFromEvaluation(parent.evaluation, quote);
    const analytics = analyzeCall(parent.turns);
    return {
      parentId: parent.id,
      lever: spotlight.lever,
      nextStep: spotlight.nextStep,
      quote: spotlight.quote,
      gapLabel: analytics.gapSkill?.label ?? null,
      suggestedLine: analytics.suggestedLine,
    };
  } catch {
    return null;
  }
}

export function createSession(
  scenarioId: string,
  opts?: { parentId?: string; untilTurnId?: string; verticalId?: string; focusId?: string },
) {
  const parentRow = opts?.parentId ? loadSession(opts.parentId) : null;
  let character: RoleCharacter;
  if (parentRow) {
    // Wiederholung: dieselbe Figur wie im Original, auch bei echten Gesprächen
    character = JSON.parse(parentRow.character_json) as RoleCharacter;
  } else {
    const scenario = getScenario(scenarioId);
    if (!scenario) throw new Error("Szenario nicht freigegeben");
    character = characterForScenario(scenarioId);
  }
  const now = new Date().toISOString();
  const id = randomUUID();
  const openingId = randomUUID();

  let hiddenFacts = character.hiddenFacts;
  let state: CharacterState = {
    ...character.initialState,
    affect: hydrateAffect(character, character.initialState),
  };
  let copied: TranscriptTurn[] = [];
  let parentCheckpoints = new Map<string, ReplayCheckpoint>();
  let parentObservations = new Map<string, string | null>();
  let verticalId = (opts?.verticalId || "immobilien") as VerticalId;
  let focusId = isFocusId(opts?.focusId)
    ? opts.focusId
    : defaultFocusForScenario(scenarioId, verticalId);

  if (opts?.parentId && parentRow) {
    const parent = parentRow;
    verticalId = (parent.vertical_id || verticalId) as VerticalId;
    focusId = isFocusId(parent.focus_id) ? parent.focus_id : focusId;
    const parentRows = loadTurns(opts.parentId);
    const parentTurns = mapTurns(parentRows);
    parentObservations = new Map(parentRows.map((turn) => [turn.id, turn.observations_json]));
    parentCheckpoints = loadReplayCheckpoints(parentTurns.map((turn) => turn.id));
    const seeded = seedRepeatFromParent(character, parentTurns, opts.untilTurnId, parentCheckpoints);
    copied = seeded.copied;
    state = seeded.state;
    hiddenFacts = seeded.hiddenFacts;
  }

  db()
    .prepare(
      `INSERT INTO sessions (id, scenario_id, scenario_version, status, mode, parent_session_id, repeat_from_turn_id, character_json, hidden_facts_json, state_json, engine_mode, created_at, vertical_id, focus_id)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      scenarioId,
      SCENARIO_VERSION,
      opts?.parentId ? "repeat" : "live",
      opts?.parentId ?? null,
      opts?.untilTurnId ?? null,
      JSON.stringify(character),
      JSON.stringify(hiddenFacts),
      JSON.stringify(state),
      engineMode(),
      now,
      verticalId,
      focusId,
    );

  if (copied.length === 0) {
    db()
      .prepare("INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, 0, 'counterpart', ?, NULL, ?)")
      .run(openingId, id, character.opening, now);
  } else {
    const insert = db().prepare(
      "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    copied.forEach((t, i) => {
      const copiedId = randomUUID();
      insert.run(copiedId, id, i, t.speaker, t.text, parentObservations.get(t.id) ?? null, now);
      const checkpoint = parentCheckpoints.get(t.id);
      if (checkpoint) saveReplayCheckpoint(copiedId, checkpoint);
    });
  }

  return toDto(loadSession(id));
}

function characterFromRealCall(call: ReturnType<typeof getRealCall>, quote: string): RoleCharacter {
  const guarded = /kein interesse|nicht verkaufen|keine anrufe|kein bedarf/i.test(quote);
  return {
    schemaVersion: ROLE_SCHEMA_VERSION,
    scenarioId: realScenarioId(call.id),
    scenarioVersion: SCENARIO_VERSION,
    synthetic: true,
    identity: {
      name: call.counterpartName,
      region: "Österreich",
      profession: "Gegenseite aus einem echten Gespräch",
      ownershipContext: "Nachgestellt aus Ihrem Transkript — die Person selbst spricht hier nicht.",
      marketExperience: "medium",
      decisionAuthority: /partner|frau|mann|schwester|bruder|besprechen/i.test(quote) ? "partial" : "full",
    },
    traits: {
      talkativeness: 4,
      skepticism: guarded ? 8 : 6,
      dominance: 5,
      patience: guarded ? 3 : 5,
      humor: 2,
      detailOrientation: 6,
      conflictAvoidance: 4,
      riskTolerance: 3,
      controlNeed: 6,
    },
    behaviour: {
      sentenceLength: "short",
      directness: 8,
      emotionalExpression: 5,
      interruptionTendency: 3,
      questionFrequency: 3,
      selfDisclosure: 3,
      smalltalkAffinity: 1,
      toleranceForSalesLanguage: 1,
      needForSpecificity: 8,
      decisionSpeed: 5,
    },
    hiddenFacts: [],
    hardConstraints: [
      "Bleiben Sie bei dem, was im echten Gespräch gesagt wurde. Erfinden Sie keine neuen Fakten über sich.",
      "Reagieren Sie auf das, was der Anrufer jetzt sagt — nicht auf das, was er im Original gesagt hat.",
    ],
    opening: quote,
    publicBrief: `Echtes Gespräch, nachgestellt. Sie steigen an der Stelle ein, an der es kippte: „${quote}“. Alles davor kennen Sie aus dem Transkript.`,
    acceptableOutcome:
      "Der Einwand wird aufgenommen, eine konkrete Rückfrage folgt, und am Ende steht ein nächster Schritt oder ein klares Nein.",
    initialState: clampState({
      status: "active",
      trust: guarded ? 25 : 40,
      interest: guarded ? 15 : 40,
      irritation: guarded ? 35 : 20,
      timeWillingness: guarded ? 20 : 45,
      perceivedCompetence: 38,
      salesPressure: 30,
      disclosedFacts: [],
      stateRevision: 0,
    }),
  };
}

/**
 * Übung aus einem echten Gespräch: das Transkript bis zum Kipp-Moment wird übernommen,
 * die Figur spricht den echten Einwand, Sie antworten neu.
 */
export function createSessionFromRealCall(callId: string, momentTurnId?: string, focusId?: string) {
  const call = getRealCall(callId);
  const moment = call.moments.find((m) => m.turnId === momentTurnId) ?? call.moments[0];
  const anchorId = moment?.turnId ?? [...call.turns].reverse().find((t) => t.speaker === "counterpart")?.id;
  if (!anchorId) throw new Error("In diesem Gespräch spricht die Gegenseite nicht — nichts zum Üben.");
  const anchorIndex = call.turns.findIndex((t) => t.id === anchorId);
  const copied = call.turns.slice(0, anchorIndex + 1);
  const quote = call.turns[anchorIndex].text;
  const character = characterFromRealCall(call, quote);
  const resolvedFocus = isFocusId(focusId)
    ? focusId
    : moment?.skillId === "B4"
      ? "diagnosis"
      : moment?.skillId === "B3" && /partner|frau|mann|schwester|bruder/i.test(quote)
        ? "authority"
        : "diagnosis";
  const now = new Date().toISOString();
  const id = randomUUID();

  db()
    .prepare(
      `INSERT INTO sessions (id, scenario_id, scenario_version, status, mode, parent_session_id, repeat_from_turn_id, character_json, hidden_facts_json, state_json, engine_mode, created_at, vertical_id, focus_id)
       VALUES (?, ?, ?, 'active', 'real', NULL, ?, ?, '[]', ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      realScenarioId(call.id),
      SCENARIO_VERSION,
      anchorId,
      JSON.stringify(character),
      JSON.stringify(character.initialState),
      engineMode(),
      now,
      call.verticalId,
      resolvedFocus,
    );
  const insert = db().prepare(
    "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)",
  );
  copied.forEach((t, i) => insert.run(randomUUID(), id, i, t.speaker, t.text, now));
  return toDto(loadSession(id));
}

export function getSessionDto(id: string) {
  return toDto(loadSession(id));
}

export async function appendTraineeTurn(
  sessionId: string,
  text: string,
  signal?: AbortSignal,
  opts?: { interrupted?: boolean; acoustic?: AcousticSample | null },
) {
  const row = loadSession(sessionId);
  if (row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Bitte eine Aussage schreiben.");

  const character = JSON.parse(row.character_json) as RoleCharacter;
  const hiddenFacts = JSON.parse(row.hidden_facts_json) as HiddenFact[];
  const state = JSON.parse(row.state_json) as CharacterState;
  const prior = mapTurns(loadTurns(sessionId));
  const traineeTurn: TranscriptTurn = { id: randomUUID(), speaker: "trainee", text: trimmed };
  const seqBase = prior.length;
  const now = new Date().toISOString();

  const { action, hiddenFacts: nextFacts, mode } = await playTraineeTurn({
    sessionId,
    character,
    hiddenFacts,
    state,
    transcript: prior,
    traineeTurn,
    signal,
    interrupted: opts?.interrupted,
    acoustic: opts?.acoustic,
  });
  if (signal?.aborted) throw new Error("Abgebrochen.");

  const tx = db().transaction(() => {
    db()
      .prepare(
        "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, 'trainee', ?, ?, ?)",
      )
      .run(traineeTurn.id, sessionId, seqBase, trimmed, JSON.stringify(action.observations), now);
    saveReplayCheckpoint(traineeTurn.id, { state: action.state, hiddenFacts: nextFacts });

    if (action.utterance) {
      db()
        .prepare(
          "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, 'counterpart', ?, NULL, ?)",
        )
        .run(randomUUID(), sessionId, seqBase + 1, action.utterance, now);
    }

    let nextState = action.state;
    let nextStatus = action.action === "end_call" ? "ended" : "active";
    let seq = seqBase + (action.utterance ? 2 : 1);
    if (action.action === "end_call") {
      const reason = action.endReason ?? nextState.hangupReason ?? "character_choice";
      const trigger = nextState.hangupTrigger ?? hangupReasonLabel(reason);
      nextState = withHangup({ ...nextState, status: "ended" }, reason, trigger);
      insertSystemHangup(character.identity.name, reason, sessionId, seq, now);
    }
    db()
      .prepare("UPDATE sessions SET hidden_facts_json = ?, state_json = ?, engine_mode = ?, status = ? WHERE id = ?")
      .run(JSON.stringify(nextFacts), JSON.stringify(nextState), mode, nextStatus, sessionId);
    return nextStatus;
  });
  const nextStatus = tx();

  if (nextStatus === "ended") {
    // Client-Abort (Navigation zur Auswertung) darf die Bewertung nicht abbrechen.
    await runEvaluation(sessionId);
  }

  return getSessionDto(sessionId);
}

function insertSystemHangup(
  name: string,
  reason: HangupReason,
  sessionId: string,
  seq: number,
  now: string,
) {
  db()
    .prepare(
      "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, 'system', ?, NULL, ?)",
    )
    .run(randomUUID(), sessionId, seq, `${name} hat aufgelegt — ${hangupReasonLabel(reason)}.`, now);
}

export type HangupInfo = {
  /** Wer aufgelegt hat — Standard: der Trainee über den Auflegen-Knopf. */
  by?: "trainee" | "counterpart";
  /** Grund aus dem end_call-Werkzeug der Figur. */
  reason?: HangupReason;
  /** Letzter Satz der Figur (end_call.last_line) — landet als counterpart-Zug, falls nicht schon per Transkript da. */
  lastLine?: string;
};

/**
 * Der Schlusssatz aus end_call.last_line gehört nur ins Protokoll, wenn er nicht schon per
 * Transkript da ist. Ob die Figur in der Schlussantwort überhaupt gesprochen hat, weiß der Client
 * und lässt last_line dann weg.
 */
function alreadySpokenByCounterpart(turns: TurnRow[], line: string) {
  return turns
    .filter((turn) => turn.speaker === "counterpart")
    .slice(-3)
    .some((turn) => similarLiveText(turn.text, line));
}

export async function hangUp(sessionId: string, signal?: AbortSignal, info: HangupInfo = {}) {
  const row = loadSession(sessionId);
  if (row.status === "ended") return getSessionDto(sessionId);
  const now = new Date().toISOString();
  const turns = loadTurns(sessionId);
  const character = JSON.parse(row.character_json) as RoleCharacter;
  const state = JSON.parse(row.state_json) as CharacterState;
  const insert = db().prepare(
    "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)",
  );

  const tx = db().transaction(() => {
    let seq = turns.length;
    let nextState: CharacterState;
    if (info.by === "counterpart") {
      const reason = info.reason ?? "character_choice";
      const lastLine = normalizeLiveText(info.lastLine ?? "");
      if (lastLine && !alreadySpokenByCounterpart(turns, lastLine)) {
        insert.run(randomUUID(), sessionId, seq, "counterpart", lastLine, now);
        seq += 1;
      }
      insert.run(
        randomUUID(),
        sessionId,
        seq,
        "system",
        `${character.identity.name} hat aufgelegt — ${hangupReasonLabel(reason)}.`,
        now,
      );
      // Trigger aus der Policy, wenn sie denselben Grund sieht — sonst schlicht der Live-Grund.
      const policy = hangupPolicy(character, state, { prior: mapTurns(turns) });
      const trigger = policy.reason === reason && policy.trigger ? policy.trigger : `Live: ${hangupReasonLabel(reason)}`;
      nextState = withHangup(state, reason, trigger);
    } else {
      insert.run(randomUUID(), sessionId, seq, "system", "Sie haben aufgelegt.", now);
      nextState = { ...state, status: "ended" };
    }
    db()
      .prepare("UPDATE sessions SET status = 'ended', state_json = ?, live_call_id = NULL, live_call_at = NULL WHERE id = ?")
      .run(JSON.stringify(nextState), sessionId);
  });
  tx();
  // Client-Abort (Navigation zur Auswertung) darf die Bewertung nicht abbrechen —
  // die Sitzung ist schon beendet; ohne Signal nachziehen.
  await runEvaluation(sessionId);
  return getSessionDto(sessionId);
}

export type LiveTurnResult = {
  session: SessionDTO;
  /** Neue Instructions für session.update — null, wenn sich nichts Relevantes verschoben hat. */
  instructions: string | null;
  /** Gesetzt, wenn die Policy jetzt auflegen will. */
  hangup: { reason: HangupReason; closingLine: string; trigger: string | null } | null;
};

/**
 * Trainee-Transkript aus der Live-Leitung: protokollieren, Zustand ohne LLM fortschreiben
 * und bei Bedarf frische Instructions für die Leitung liefern.
 */
export function appendLiveTraineeTurn(sessionId: string, text: string): LiveTurnResult {
  const trimmed = normalizeLiveText(text);
  const idle = (): LiveTurnResult => ({ session: getSessionDto(sessionId), instructions: null, hangup: null });
  if (!trimmed) return idle();
  const row = loadSession(sessionId);
  if (row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");
  const priorRows = loadTurns(sessionId);
  if (isDuplicateUtterance(priorRows, "trainee", trimmed)) return idle();

  const character = JSON.parse(row.character_json) as RoleCharacter;
  const hiddenFacts = JSON.parse(row.hidden_facts_json) as HiddenFact[];
  const stored = JSON.parse(row.state_json) as CharacterState;
  const state: CharacterState = { ...stored, affect: hydrateAffect(character, stored) };
  const prior = mapTurns(priorRows);
  const traineeTurn: TranscriptTurn = { id: randomUUID(), speaker: "trainee", text: trimmed };
  const advance = advanceLiveState(character, state, prior, traineeTurn);
  const now = new Date().toISOString();

  db().transaction(() => {
    db()
      .prepare(
        "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, 'trainee', ?, ?, ?)",
      )
      .run(traineeTurn.id, sessionId, priorRows.length, trimmed, JSON.stringify(advance.observations), now);
    saveReplayCheckpoint(traineeTurn.id, {
      state: advance.state,
      hiddenFacts: commitDisclosures(hiddenFacts, advance.state.disclosedFacts),
    });
    db().prepare("UPDATE sessions SET state_json = ? WHERE id = ?").run(JSON.stringify(advance.state), sessionId);
  })();

  // Die laufende Leitung kennt den Verlauf selbst — kein BISHER-Block, damit der Patch kurz bleibt.
  const instructions = advance.refresh
    ? realtimeInstructions(character, hiddenFacts, advance.state, [...prior, traineeTurn], {
        observations: advance.observations,
        historyTurns: 0,
      })
    : null;
  return {
    session: getSessionDto(sessionId),
    instructions,
    // V2: the character chooses end_call from conversational meaning. A keyword
    // observer may inform replay, but must never force a live disconnect.
    hangup: null,
  };
}

export function appendLiveUtterance(sessionId: string, speaker: "trainee" | "counterpart", text: string) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return getSessionDto(sessionId);
  const row = loadSession(sessionId);
  if (row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");
  const prior = loadTurns(sessionId);
  if (isDuplicateUtterance(prior, speaker, trimmed)) return getSessionDto(sessionId);
  const now = new Date().toISOString();
  db()
    .prepare(
      "INSERT INTO turns (id, session_id, seq, speaker, text, observations_json, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)",
    )
    .run(randomUUID(), sessionId, prior.length, speaker, trimmed, now);
  return getSessionDto(sessionId);
}

/**
 * Auswertung nach dem Auflegen — mit vollem Kontext (gespeicherte Figur, Beobachtungen je Turn,
 * Startzustand bei Wiederholungen, Branche, Auflege-Grund). Eine Implementierung für Live- und
 * Textpfad: lib/evaluation.ts.
 */
async function runEvaluation(sessionId: string, signal?: AbortSignal) {
  await reevaluateSession(sessionId, signal);
}

export function sessionCount(verticalId?: string) {
  if (verticalId) {
    const row = db()
      .prepare("SELECT COUNT(*) AS n FROM sessions WHERE vertical_id = ?")
      .get(verticalId) as { n: number };
    return row.n;
  }
  const row = db().prepare("SELECT COUNT(*) AS n FROM sessions").get() as { n: number };
  return row.n;
}

export function listRecentSessions(limit = 20, verticalId?: string): SessionDTO[] {
  const rows = (
    verticalId
      ? (db()
          .prepare("SELECT * FROM sessions WHERE vertical_id = ? ORDER BY created_at DESC LIMIT ?")
          .all(verticalId, limit) as SessionRow[])
      : (db().prepare("SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?").all(limit) as SessionRow[])
  );
  return rows.map(toDto);
}

export function repeatSession(sessionId: string, fromTurnId?: string) {
  const dto = getSessionDto(sessionId);
  const until = fallbackRepeatTurnId(dto.turns, fromTurnId || dto.evaluation?.importantMomentTurnId);
  return createSession(dto.scenarioId, { parentId: sessionId, untilTurnId: until ?? undefined });
}
