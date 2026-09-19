import type { TranscriptTurn } from "@/src/role-engine/types";

export function extractSpokenLine(text: string): string | null {
  const quoted = text.match(/[„«"“]([^"»”]{12,200})[»”"“]/);
  if (quoted?.[1]) return quoted[1].replace(/\s+/g, " ").trim();
  const lines = text
    .split(/\n/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  const candidate = lines.find(
    (line) =>
      line.length >= 20 &&
      line.length <= 180 &&
      /[?.!]$/.test(line) &&
      !/^(Recap|Hebel|Next Step|Zusammenfassung)\b/i.test(line),
  );
  return candidate ?? null;
}

/** Gegenseite bleibt im Schnitt, eigene schwache Zeile wird neu gesprochen. */
export function sliceForRepeat<T extends { id: string; speaker: string }>(
  turns: T[],
  untilTurnId: string,
): T[] {
  const spoken = turns.filter((turn) => turn.speaker !== "system");
  const untilIdx = spoken.findIndex((turn) => turn.id === untilTurnId);
  if (untilIdx < 0) return spoken;
  const moment = spoken[untilIdx];
  const end = moment.speaker === "counterpart" ? untilIdx + 1 : untilIdx;
  return spoken.slice(0, end);
}

export function fallbackRepeatTurnId(
  turns: { id: string; speaker: string }[],
  preferred?: string | null,
): string | null {
  if (preferred && turns.some((turn) => turn.id === preferred)) return preferred;
  const lastCounterpart = [...turns].reverse().find((turn) => turn.speaker === "counterpart");
  if (lastCounterpart) return lastCounterpart.id;
  const lastSpoken = [...turns].reverse().find((turn) => turn.speaker !== "system");
  return lastSpoken?.id ?? null;
}

export function skillHistory<T extends { id: string; scenarioTitle: string; status: string; turns: TranscriptTurn[] }>(
  sessions: T[],
  analyze: (turns: TranscriptTurn[]) => { skills: { id: string; label: string; state: string }[] },
) {
  return sessions
    .filter((session) => session.status === "ended")
    .slice(0, 8)
    .map((session) => ({
      id: session.id,
      title: session.scenarioTitle,
      skills: analyze(session.turns).skills,
    }));
}
