/**
 * Live-Präsentation auf /sitzung. Transport und FSM bleiben in ConversationView-Hooks.
 * typedOnly behält die Chatwand (Vertrag live-status.ts).
 */

export type LiveStage = "phone" | "chat";

export function liveStage(input: { liveOnly: boolean; typedOnly: boolean }): LiveStage {
  if (input.typedOnly || !input.liveOnly) return "chat";
  return "phone";
}

/** Chatwand immer im Tipp-Modus. Audio-Leitung: nur wenn Untertitel an. */
export function showTranscriptWall(stage: LiveStage, captionsOn: boolean): boolean {
  if (stage === "chat") return true;
  return captionsOn;
}

/**
 * Score, Rubrik, Moments, Waveform, Talk-Ratio: nicht auf der Leitung.
 * Auch nicht im Hangup-Beat — Examiner sitzt auf /auswertung.
 */
export function liveExamUiAllowed(): false {
  return false;
}
