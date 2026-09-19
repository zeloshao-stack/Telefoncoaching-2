import { authoredToPack, getAuthored } from "@/lib/authored";
import { getScenario as getFrozenScenario, SCENARIO_VERSION, type PackScenario } from "@/lib/content/pack";

export { SCENARIO_VERSION };

export function getScenario(id: string): PackScenario | undefined {
  const frozen = getFrozenScenario(id);
  if (frozen) return frozen;
  const authored = getAuthored(id);
  return authored ? authoredToPack(authored) : undefined;
}
