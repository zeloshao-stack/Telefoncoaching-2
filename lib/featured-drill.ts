/**
 * Featured-Drill auf /: eine Personenkarte, eine Handlung.
 * Keine Win-Rate, keine Score-Galerie, keine Bereichs-Radios.
 */

export type PersonCardInput = {
  id: string;
  counterpart: string;
  location?: string;
  spokenLine: string;
  task: string;
  callLabel: string;
  cold?: boolean;
};

export type PersonCard = {
  id: string;
  name: string;
  location: string;
  spokenLine: string;
  task: string;
  callLabel: string;
  cold: boolean;
};

export type HomeStartKind = "featured" | "rest" | "own";

export function splitNameLage(
  counterpart: string,
  locationOverride?: string,
): { name: string; location: string } {
  const parts = counterpart
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const name = parts[0] ?? counterpart.trim();
  const fromCounterpart = parts.slice(1).join(" · ");
  const location = (locationOverride ?? fromCounterpart).trim();
  return { name, location };
}

/** Null, wenn die Karte keine gesprochene Linie oder keine Aufgabe hat — nichts erfinden. */
export function toPersonCard(input: PersonCardInput): PersonCard | null {
  const spokenLine = input.spokenLine.trim();
  const task = input.task.trim();
  if (!spokenLine || !task) return null;
  const { name, location } = splitNameLage(input.counterpart, input.location);
  if (!name) return null;
  return {
    id: input.id,
    name,
    location,
    spokenLine,
    task,
    callLabel: input.callLabel,
    cold: Boolean(input.cold),
  };
}

/** Frozen- und Pack-Karten starten. Eigene Fälle bleiben Briefing. */
export function homeStartAction(kind: HomeStartKind): "start" | "briefing" {
  return kind === "own" ? "briefing" : "start";
}

export function secondaryDrillHref(id: string): string {
  return `/szenario/${id}`;
}
