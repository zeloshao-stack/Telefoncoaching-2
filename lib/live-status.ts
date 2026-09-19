/** A03-Live-Copy: Status wie am Hörer. Tipp-Modus behält Chat-Chrome. */

export type LiveUiStatus = "off" | "connecting" | "live" | "failed";

export function hangupStatusLine(session: {
  counterpartName: string;
  turns: Array<{ speaker: string; text: string }>;
}): string {
  const system = [...session.turns].reverse().find((turn) => turn.speaker === "system");
  const text = system?.text?.trim() ?? "";
  if (/Sie haben aufgelegt/i.test(text)) return "Sie haben aufgelegt.";
  if (/hat aufgelegt/i.test(text)) return `${session.counterpartName} hat aufgelegt.`;
  if (text) return /[.!?]$/.test(text) ? text : `${text}.`;
  return "Gespräch beendet.";
}

export function callStatusLine(opts: {
  session: {
    status: string;
    counterpartName: string;
    voiceFeel: string;
    turns: Array<{ speaker: string; text: string }>;
  };
  liveStatus: LiveUiStatus;
  phase: string;
  liveLine: boolean;
  liveOnly: boolean;
  liveVoice?: boolean;
  typedOnly?: boolean;
  interruptFlash: boolean;
  hangupBeat: string | null;
}): string {
  const {
    session,
    liveStatus,
    phase,
    liveLine,
    liveOnly,
    liveVoice = false,
    typedOnly = false,
    interruptFlash,
    hangupBeat,
  } = opts;
  if (session.status === "ended") return hangupStatusLine(session);
  if (hangupBeat) return hangupBeat;
  const liveAudio = liveVoice && !typedOnly;
  if (liveAudio && liveStatus === "failed") return "Die Leitung ist weggefallen.";
  if (liveAudio) {
    if (liveStatus === "connecting") return "LIVE wird verbunden — gleich können Sie sprechen.";
    if (phase === "speaking") return `${session.counterpartName} spricht.`;
    if (phase === "thinking") return "Die Leitung ist noch da.";
    return "Leitung offen.";
  }
  if (liveStatus === "connecting") return "LIVE wird verbunden — gleich können Sie sprechen.";
  if (interruptFlash) return "Unterbrochen. Sie haben das Wort.";
  if (!liveLine) return "Leitung aus. Mikrofon: tippen, sprechen, nochmal tippen.";
  if (phase === "speaking") {
    return liveStatus === "live"
      ? `${session.counterpartName} spricht — einfach reinreden.`
      : `${session.counterpartName} ${session.voiceFeel} — auf Sprechen tippen oder reinreden.`;
  }
  if (phase === "thinking") return `${session.counterpartName} überlegt…`;
  if (phase === "listening") {
    return liveStatus === "live"
      ? "LIVE. Einfach sprechen, ohne Senden."
      : "Leitung offen. Sprechen — oder den Knopf Sprechen antippen.";
  }
  if (liveOnly) return "LIVE · zuerst Leitung öffnen, dann einfach sprechen.";
  if (liveStatus === "failed") return "Live nicht möglich — Aufnahme als Fallback.";
  return `${session.counterpartName} ${session.voiceFeel}.`;
}

export function orbButtonLabel(
  phase: string,
  counterpartName: string,
  ended: boolean,
  liveAudio = false,
): string {
  if (ended) return "Gespräch beendet";
  if (phase === "speaking") return `${counterpartName} spricht`;
  if (phase === "thinking") return liveAudio ? "Leitung offen" : `${counterpartName} überlegt`;
  return "Jetzt sprechen";
}
