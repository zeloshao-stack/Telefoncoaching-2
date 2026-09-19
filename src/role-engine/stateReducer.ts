import { affectDeltas, hydrateAffect, reduceAffect } from "./affect";
import { clampState } from "./characters";
import type { CharacterState, Observation, RoleCharacter, VocalChannel } from "./types";

const DEFAULT_RULES: Record<string, Partial<Record<keyof CharacterState, number>>> = {
  ignored_boundary: { trust: -4, interest: -6, irritation: 8, salesPressure: 7 },
  continued_after_final_no: { irritation: 12, trust: -8, timeWillingness: -20 },
  asked_specific_question: { interest: 2, perceivedCompetence: 3 },
  referenced_previous_statement: { trust: 4 },
  unsupported_claim: { trust: -4, perceivedCompetence: -5, irritation: 2 },
  made_false_or_unverifiable_claim: { trust: -8, perceivedCompetence: -10, irritation: 6 },
  showed_relevant_market_knowledge: { perceivedCompetence: 7, interest: 4 },
  acknowledged_concern: { trust: 5, irritation: -6 },
  respected_no: { irritation: -4, trust: 2 },
  created_pressure: { irritation: 10, salesPressure: 12, timeWillingness: -15 },
  interrupted_character: { irritation: 6, trust: -2, timeWillingness: -8 },
  premature_concession: { perceivedCompetence: -6, interest: -3 },
  premature_close: { trust: -10, irritation: 8 },
  clarified_decision_authority: { trust: 5, interest: 6, perceivedCompetence: 5 },
  generic_pitch: { interest: -4, irritation: 3, timeWillingness: -5 },
};

export function reduceState(
  character: RoleCharacter,
  state: CharacterState,
  observations: Observation[],
  vocal?: VocalChannel,
): CharacterState {
  const next: CharacterState = {
    ...state,
    disclosedFacts: [...state.disclosedFacts],
    affect: hydrateAffect(character, state),
  };
  const skepticism = character.traits.skepticism / 10;
  const patience = character.traits.patience / 10;
  const previousAffect = next.affect!;

  for (const obs of observations) {
    let delta = DEFAULT_RULES[obs.type];
    if (!delta) continue;
    if (obs.type === "referenced_previous_statement" && obs.confidence === "low") {
      delta = { trust: 1 };
    }
    const weight = 0.7 + skepticism * 0.4 + (1 - patience) * 0.2;
    for (const [key, value] of Object.entries(delta)) {
      if (typeof value !== "number") continue;
      const k = key as keyof CharacterState;
      const current = next[k];
      if (typeof current === "number") {
        (next[k] as number) = current + value * weight;
      }
    }
  }

  if (vocal) {
    const affect = reduceAffect(character, next, observations, vocal);
    const extra = affectDeltas(affect, previousAffect);
    next.affect = affect;
    for (const [key, value] of Object.entries(extra)) {
      if (typeof value !== "number") continue;
      const k = key as keyof CharacterState;
      const current = next[k];
      if (typeof current === "number") {
        (next[k] as number) = current + value;
      }
    }
  }

  next.stateRevision = state.stateRevision + 1;
  return clampState(next);
}
