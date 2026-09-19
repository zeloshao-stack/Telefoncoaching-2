import { hangupPolicy, type HangupPolicy } from "@/src/role-engine/hangup";
import { extractObservations } from "@/src/role-engine/observationExtractor";
import { reduceState } from "@/src/role-engine/stateReducer";
import type { CharacterState, Observation, RoleCharacter, TranscriptTurn } from "@/src/role-engine/types";
import { extractVocal } from "@/src/role-engine/vocalChannel";

export type LiveTurnAdvance = {
  /** Fortgeschriebener Zustand — ohne LLM, nur Beobachtungen + Reducer. */
  state: CharacterState;
  observations: Observation[];
  policy: HangupPolicy;
  /** Ob die Live-Leitung neue Instructions bekommen soll. */
  refresh: boolean;
  /** Warum (für Dev-Logs). */
  refreshReason: "disclosure" | null;
};

/**
 * Trainee-Transkript aus der Live-Leitung: Zustand leichtgewichtig fortschreiben und
 * entscheiden, ob sich Auflege-Neigung oder Register so verändert haben, dass die
 * Leitung ein session.update braucht. Pure Funktion, kein Netz.
 */
export function advanceLiveState(
  character: RoleCharacter,
  state: CharacterState,
  prior: TranscriptTurn[],
  traineeTurn: TranscriptTurn,
): LiveTurnAdvance {
  const observations = extractObservations(character, traineeTurn, prior);
  const vocal = extractVocal(traineeTurn.text, null);
  const reduced = reduceState(character, state, observations, vocal);
  // Disclosure authority belongs to recallMemory. Keyword observations are
  // diagnostic only and cannot authorize private knowledge for the audio model.
  const nextState = { ...reduced, disclosedFacts: [...state.disclosedFacts] };

  const after = hangupPolicy(character, nextState, { prior: [...prior, traineeTurn], observations });
  // The realtime model already heard the turn. Do not overwrite its contextual
  // reaction every two turns with a keyword-derived emotional instruction.
  // On-demand recall supplies exact authorized facts through its tool result.
  const refreshReason: LiveTurnAdvance["refreshReason"] = null;

  return {
    state: nextState,
    observations,
    policy: after,
    refresh: refreshReason !== null,
    refreshReason,
  };
}
