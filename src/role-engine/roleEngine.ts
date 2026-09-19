import { defaultFocusForScenario, getFocus } from "@/lib/focus";
import type { VerticalId } from "@/lib/verticals";
import { buildCallContext } from "./callContext";
import { characterForScenario } from "./characters";
import { commitDisclosures, proposeDisclosures } from "./disclosure";
import { finalizeEvaluation } from "./evaluationGuard";
import { mockEvaluate } from "./mockEvaluator";
import { mockRolePlay } from "./mockPlayer";
import { extractObservations } from "./observationExtractor";
import { hasOpenAiKey, openaiEvaluate, openaiRolePlay } from "./openaiAdapter";
import { reduceState } from "./stateReducer";
import { extractVocal } from "./vocalChannel";
import type {
  AcousticSample,
  CharacterState,
  Evaluation,
  HiddenFact,
  Observation,
  RoleCharacter,
  RolePlayerAction,
  TranscriptTurn,
} from "./types";

export type EngineMode = "openai" | "mock";

export function engineMode(): EngineMode {
  return hasOpenAiKey() ? "openai" : "mock";
}

export async function playTraineeTurn(args: {
  sessionId: string;
  character: RoleCharacter;
  hiddenFacts: HiddenFact[];
  state: CharacterState;
  transcript: TranscriptTurn[];
  traineeTurn: TranscriptTurn;
  signal?: AbortSignal;
  interrupted?: boolean;
  acoustic?: AcousticSample | null;
}): Promise<{ action: RolePlayerAction; hiddenFacts: HiddenFact[]; mode: EngineMode }> {
  const observations = extractObservations(args.character, args.traineeTurn, args.transcript, {
    interrupted: args.interrupted,
  });
  const vocal = extractVocal(args.traineeTurn.text, args.acoustic, { interrupted: args.interrupted });
  const proposed = proposeDisclosures(args.character, observations, args.hiddenFacts, args.state);
  const nextFacts = commitDisclosures(args.hiddenFacts, proposed);
  const state = reduceState(args.character, args.state, observations, vocal);

  const mode = engineMode();
  let action: RolePlayerAction;
  if (mode === "openai") {
    // Provider failures propagate to the transport; never silently swap to a mock.
    action = await openaiRolePlay({
        sessionId: args.sessionId,
        turnId: args.traineeTurn.id,
        character: args.character,
        hiddenFacts: nextFacts,
        state,
        observations,
        proposedDisclosures: proposed,
        transcript: [...args.transcript, args.traineeTurn],
        traineeText: args.traineeTurn.text,
        signal: args.signal,
      });
      // Affekt/Beobachtungen aus dem Reducer; Auflege-Felder vom Spieler nicht überschreiben.
      action.state = {
        ...state,
        status: action.action === "end_call" ? "ending" : state.status,
        hangupReason: action.state.hangupReason,
        hangupTrigger: action.state.hangupTrigger,
      };
      action.observations = observations;
      action.proposedDisclosures = proposed;
  } else {
    action = mockRolePlay({
      sessionId: args.sessionId,
      turnId: args.traineeTurn.id,
      character: args.character,
      hiddenFacts: nextFacts,
      state,
      observations,
      proposedDisclosures: proposed,
      traineeText: args.traineeTurn.text,
      transcript: args.transcript,
    });
  }

  if (action.action === "end_call") {
    action.state = { ...action.state, status: "ended" };
  }

  return { action, hiddenFacts: nextFacts, mode };
}

function verticalForScenario(scenarioId: string): VerticalId {
  if (scenarioId.startsWith("V")) return "versicherung";
  if (scenarioId.startsWith("F")) return "finanzierung";
  return "immobilien";
}

/**
 * Auswertung nach dem Auflegen.
 * Reihenfolge: verdeckten Verlauf rekonstruieren → Modell (oder Regel-Fallback) →
 * Kritiker im Code (Belege, N/A, Kalibrierung, Schlüsselmoment).
 * `character`, `storedObservations`, `initialState` und `finalState` sind optional; fehlen sie,
 * wird die Figur aus dem Szenario abgeleitet (bei echten Gesprächen gibt es keine).
 * `finalState` liefert den Auflege-Grund, wenn die Figur selbst aufgelegt hat.
 */
export async function evaluateSession(args: {
  scenarioId: string;
  publicBrief: string;
  acceptableOutcome: string;
  rubricRule: string;
  transcript: TranscriptTurn[];
  signal?: AbortSignal;
  focusId?: string;
  verticalId?: VerticalId;
  character?: RoleCharacter | null;
  storedObservations?: Map<string, Observation[]>;
  initialState?: CharacterState;
  finalState?: CharacterState;
}): Promise<{ evaluation: Evaluation; mode: EngineMode }> {
  const transcript = args.transcript.filter((t) => t.speaker !== "system");
  let character: RoleCharacter | null = args.character ?? null;
  if (!character) {
    try {
      character = characterForScenario(args.scenarioId);
    } catch {
      character = null;
    }
  }
  const context = character
    ? buildCallContext(character, transcript, args.storedObservations, args.initialState, args.finalState)
    : null;
  const vertical = args.verticalId ?? verticalForScenario(args.scenarioId);
  const focus = getFocus(vertical, args.focusId ?? defaultFocusForScenario(args.scenarioId, vertical));

  const mode = engineMode();
  if (mode === "openai") {
    try {
      const raw = await openaiEvaluate({
        ...args,
        transcript,
        context,
        focus: { label: focus.label, hint: focus.hint, dimension: focus.dimension },
        hardConstraints: character?.hardConstraints ?? [],
      });
      return {
        evaluation: finalizeEvaluation(raw, transcript, context, {
          engine: "openai",
          rubricRule: args.rubricRule,
          focusDimension: focus.dimension,
        }),
        mode,
      };
    } catch (error) {
      if (args.signal?.aborted) throw error;
      const raw = mockEvaluate(args.scenarioId, transcript, args.focusId);
      return {
        evaluation: finalizeEvaluation(raw, transcript, context, {
          engine: "mock",
          rubricRule: args.rubricRule,
          focusDimension: focus.dimension,
        }),
        mode: "mock",
      };
    }
  }
  const raw = mockEvaluate(args.scenarioId, transcript, args.focusId);
  return {
    evaluation: finalizeEvaluation(raw, transcript, context, {
      engine: "mock",
      rubricRule: args.rubricRule,
      focusDimension: focus.dimension,
    }),
    mode,
  };
}

export { characterForScenario };
