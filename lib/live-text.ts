export function normalizeLiveText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function foldLiveText(text: string) {
  return normalizeLiveText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
    }
  }
  return row[b.length] ?? Math.max(a.length, b.length);
}

/** Gleiche Aussage trotz ASR-Varianten: „Sinn?“ vs „hin?“ — nur noch zur Anzeige, nicht zum Verwerfen. */
export function similarLiveText(a: string, b: string) {
  const sa = foldLiveText(a);
  const sb = foldLiveText(b);
  if (!sa || !sb) return false;
  if (sa === sb) return true;
  const shorter = sa.length <= sb.length ? sa : sb;
  const longer = sa.length <= sb.length ? sb : sa;
  if (longer.includes(shorter) && shorter.length / longer.length >= 0.72) return true;
  return levenshtein(sa, sb) / longer.length <= 0.28;
}

/** Sicherheitsnetz: nur wortgleicher Text innerhalb dieses Fensters gilt als Doppel. */
export const LIVE_DEDUPE_WINDOW_MS = 3000;

/** Gleicher Wortlaut (Groß/Klein, Satzzeichen egal) — kein Fuzzy, damit „Ja.“ zweimal erlaubt bleibt. */
export function sameLiveText(a: string, b: string) {
  const sa = foldLiveText(a);
  const sb = foldLiveText(b);
  return Boolean(sa) && sa === sb;
}

export function isDuplicateUtterance(
  prior: Array<{ speaker: string; text: string; created_at?: string }>,
  speaker: string,
  text: string,
  now = Date.now(),
  windowMs = LIVE_DEDUPE_WINDOW_MS,
) {
  const needle = normalizeLiveText(text);
  if (!needle) return true;
  return prior.slice(-8).some((turn) => {
    if (turn.speaker !== speaker) return false;
    if (turn.created_at) {
      const at = Date.parse(turn.created_at);
      if (Number.isFinite(at) && now - at > windowMs) return false;
    }
    return sameLiveText(turn.text, needle);
  });
}

/**
 * Dedupe für Realtime-Events: genau einmal pro item_id, dazu ein kurzes Netz
 * gegen wortgleiche Wiederholungen ohne/mit anderer item_id.
 */
export function createLiveDedupe(windowMs = LIVE_DEDUPE_WINDOW_MS) {
  const items = new Set<string>();
  const recent: Array<{ text: string; at: number }> = [];
  return {
    /** true = neu, übernehmen; false = schon gesehen. */
    take(itemId: string | undefined, text: string, now = Date.now()) {
      const spoken = normalizeLiveText(text);
      if (!spoken) return false;
      if (itemId) {
        if (items.has(itemId)) return false;
        items.add(itemId);
      }
      for (let i = recent.length - 1; i >= 0; i -= 1) {
        if (now - recent[i].at > windowMs) {
          recent.splice(0, i + 1);
          break;
        }
      }
      if (recent.some((entry) => sameLiveText(entry.text, spoken))) return false;
      recent.push({ text: spoken, at: now });
      return true;
    },
    seenItem(itemId: string) {
      return items.has(itemId);
    },
  };
}

/** Der Satz, mit dem die Gegenseite eröffnet, solange der Anrufer noch nichts gesagt hat — sonst null. */
export function liveGreetingLine(
  opening: string,
  turns: Array<{ speaker: string; text: string }>,
): string | null {
  if (turns.some((turn) => turn.speaker === "trainee")) return null;
  const lastCounterpart = [...turns].reverse().find((turn) => turn.speaker === "counterpart");
  return normalizeLiveText(lastCounterpart?.text || opening) || null;
}

/** Einmalige Anweisung für das erste response.create — statt einer Zeile im Session-Prompt. */
export function liveGreetingInstructions(firstLine: string) {
  return `Sag jetzt genau diesen einen Satz und dann nichts mehr: ${firstLine}`;
}

/** Überwiegend nicht-lateinische Buchstaben (Kyrillisch, Griechisch, CJK …) — kein Deutsch, nicht protokollieren. */
export function isMostlyNonLatin(text: string) {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const latin = letters.filter((ch) => /\p{Script=Latin}/u.test(ch)).length;
  return latin / letters.length < 0.5;
}

/**
 * Mindestens so viele Buchstaben nach Fold — „Ja“/„Nein“ bleiben, Ein-Laut-Müll fliegt.
 * Zusätzlich: bekannte Whisper-Phantome und englische Halluzinationen.
 */
export const LIVE_MIN_TRANSCRIPT_LETTERS = 2;

const ENGLISH_WHISPER_OPENERS =
  /^(what's|whats|what is|what're|thank you|thanks for|thanks\.|i'm |i am |subtitle|please subscribe|bye\.?$|you$|the end\.?$|music\.?$)/i;

const SHORT_PHANTOM_UTTERANCES = new Set([
  "bereit",
  "ok",
  "okay",
  "mhm",
  "mm",
  "hmm",
  "ah",
  "äh",
  "uhm",
  "um",
  "yeah",
  "yep",
  "bye",
  "hi",
  "hello",
  "thanks",
  "thank you",
  "untertitel",
  "music",
  "applause",
]);

/** Typische Realtime/Whisper-Müllzeilen, die nicht als Trainee-Zug zählen dürfen. */
export function isPhantomLiveTranscript(text: string) {
  const raw = normalizeLiveText(text);
  if (!raw) return true;
  if (isMostlyNonLatin(raw)) return true;
  const folded = foldLiveText(raw);
  if (!folded) return true;
  const letters = folded.match(/\p{L}/gu) ?? [];
  if (letters.length < LIVE_MIN_TRANSCRIPT_LETTERS) return true;
  if (SHORT_PHANTOM_UTTERANCES.has(folded)) return true;
  if (ENGLISH_WHISPER_OPENERS.test(raw)) return true;
  // Englisch ohne deutsche Marker (Umlaute/ß oder häufige DE-Funktionswörter).
  if (looksLikeEnglishWhisperHallucination(raw, folded)) return true;
  return false;
}

function looksLikeEnglishWhisperHallucination(raw: string, folded: string) {
  if (/[äöüß]/i.test(raw)) return false;
  if (/\b(ich|sie|und|oder|nicht|bitte|grüß|gruss|hallo|frau|herr|euro|zeit|haus)\b/i.test(folded)) {
    return false;
  }
  const enHits = folded.match(
    /\b(what|whats|what's|the|this|that|with|from|have|has|been|were|your|you|thanks|thank|please|sorry|hello|ready|because)\b/g,
  );
  if (!enHits || enHits.length < 1) return false;
  // Mindestens ein englisches Funktionswort und kaum deutsche Substanz → Phantom.
  const words = folded.split(/\s+/).filter(Boolean);
  return words.length <= 6 && enHits.length / words.length >= 0.34;
}

/** Latenzreihe: min / Median / max aus Rohwerten in ms. */
export function summarizeLatencyMs(samples: number[]) {
  if (!samples.length) return null;
  const sorted = [...samples].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1
      ? sorted[mid]!
      : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
  return { n: sorted.length, min: sorted[0]!, median, max: sorted[sorted.length - 1]! };
}

/** Zeit von lokalem Mute bis Provider-Clear/Cancel (ms). */
export function bargeInTimingMs(localMuteAt: number, providerAt: number) {
  if (!Number.isFinite(localMuteAt) || !Number.isFinite(providerAt)) return null;
  return Math.max(0, Math.round(providerAt - localMuteAt));
}

/** VAD-Puffer, die OpenAI in audio_start_ms/audio_end_ms einrechnet — Werte wie in realtimeSessionConfig. */
export const LIVE_VAD_PREFIX_MS = 300;
export const LIVE_VAD_SILENCE_MS = 500;
export const LIVE_MIN_SPEECH_MS = 350;

/** Netto-Sprechdauer eines VAD-Segments ohne Vor-/Nachlauf. */
export function netSpeechMs(audioStartMs: number, audioEndMs: number) {
  return audioEndMs - audioStartMs - LIVE_VAD_PREFIX_MS - LIVE_VAD_SILENCE_MS;
}

export function isTooShortSpeech(audioStartMs: number, audioEndMs: number, minMs = LIVE_MIN_SPEECH_MS) {
  return netSpeechMs(audioStartMs, audioEndMs) < minMs;
}

/**
 * Lokaler Barge-in auf dem WebRTC-Pfad: hörbares Audio kappen, ohne auf Provider-RTT
 * zu warten. `phase === "speaking"` fängt den Fall, in dem das UI schon spricht und
 * das Buffer-Flag nachzieht. Thinking/Listening ohne Audio wird nicht gemutet.
 */
export function shouldMuteOnUserSpeech(phase: string, audioPlaying: boolean): boolean {
  return audioPlaying || phase === "speaking";
}

/** Lücke nach Nutzerende / vor hörbarem Audio — nicht während die Figur schon spielt. */
export function shouldShowThinking(audioPlaying: boolean): boolean {
  return !audioPlaying;
}

/** Barge-in-Sperre: lokal kappen, bis speech_stopped und Cancel/Clear der Cut-ID da sind. GO-2 Unlock nur Stufe B. */
/** Assistant-Heard nach Stufe-B-Freeze oder Playout-Complete. Nie Nutzer-`audio_end_ms`. Fail = unknown. */
export type LiveHeardAck = {
  generation_id: string | null;
  playback_cursor_ms: number | "unknown";
  heard_ms: number | "unknown";
};

export type LivePlaybackGate = {
  suppressPlayback: boolean;
  cutResponseId: string | null;
  speechStoppedAfterCut: boolean;
  cutAcked: boolean;
  heardAck: LiveHeardAck | null;
};

export function createLivePlaybackGate(): LivePlaybackGate {
  return {
    suppressPlayback: false,
    cutResponseId: null,
    speechStoppedAfterCut: false,
    cutAcked: false,
    heardAck: null,
  };
}

export function livePlaybackAfterLocalCut(
  gate: LivePlaybackGate,
  cutResponseId: string | null,
): LivePlaybackGate {
  return {
    ...gate,
    suppressPlayback: true,
    cutResponseId,
    speechStoppedAfterCut: false,
    cutAcked: false,
  };
}

export function livePlaybackWithHeardAck(gate: LivePlaybackGate, heardAck: LiveHeardAck): LivePlaybackGate {
  return { ...gate, heardAck };
}

/** `response.created` darf die Sperre nicht lösen — Folgeantwort ≠ Cut-Ack. */
export function livePlaybackAfterResponseCreated(gate: LivePlaybackGate): LivePlaybackGate {
  return gate;
}

export function shouldReleasePlaybackSuppress(gate: LivePlaybackGate): boolean {
  return gate.suppressPlayback && gate.speechStoppedAfterCut && gate.cutAcked;
}

function releasePlaybackSuppressIfReady(gate: LivePlaybackGate): LivePlaybackGate {
  if (!shouldReleasePlaybackSuppress(gate)) return gate;
  return {
    ...gate,
    suppressPlayback: false,
    speechStoppedAfterCut: false,
    cutAcked: false,
  };
}

export function livePlaybackAfterSpeechStopped(gate: LivePlaybackGate): LivePlaybackGate {
  if (!gate.suppressPlayback) return gate;
  return releasePlaybackSuppressIfReady({ ...gate, speechStoppedAfterCut: true });
}

/** Cancel oder `output_audio_buffer.clear` zählt als Ack der Cut-ID. */
export function livePlaybackAfterCutAck(
  gate: LivePlaybackGate,
  ackedResponseId?: string | null,
): LivePlaybackGate {
  if (!gate.suppressPlayback) return gate;
  const matchesCut = !gate.cutResponseId || !ackedResponseId || ackedResponseId === gate.cutResponseId;
  if (!matchesCut) return gate;
  return releasePlaybackSuppressIfReady({ ...gate, cutAcked: true });
}

/**
 * Nach lokalem Cut: Altpuffer nicht anspielen. `activeResponseId` gesetzt:
 * nur die laufende Antwort darf starten — und nur wenn die Sperre offen ist.
 */
export function shouldSuppressStartedAudio(
  suppressPlayback: boolean,
  startedResponseId: string | undefined,
  cutResponseId: string | null,
  activeResponseId?: string | null,
): boolean {
  if (suppressPlayback) return true;
  if (startedResponseId && cutResponseId && startedResponseId === cutResponseId) return true;
  if (activeResponseId !== undefined) {
    if (!startedResponseId || startedResponseId !== activeResponseId) return true;
  }
  return false;
}

/**
 * `output_audio_buffer.started` der Folgeantwort kam während der Sperre:
 * nach Release nachholen, sonst bleibt der Turn stumm.
 */
export function shouldDeferSuppressedStart(
  suppressPlayback: boolean,
  startedResponseId: string | undefined,
  activeResponseId: string | null,
  cutResponseId: string | null,
): boolean {
  if (!suppressPlayback || !startedResponseId || !activeResponseId) return false;
  if (startedResponseId === cutResponseId) return false;
  return startedResponseId === activeResponseId;
}

/** Auflegen oder Cut: play() darf Mute/Gain nicht wieder aufdrehen. */
export function shouldHoldClientPlayback(suppressPlayback: boolean, holdPlayback: boolean): boolean {
  return suppressPlayback || holdPlayback;
}

export type HardCutAudio = {
  muted: boolean;
  volume: number;
  currentTime?: number;
  srcObject?: unknown;
  pause: () => void;
};

function audioTracksOf(src: unknown): Array<{ enabled: boolean }> {
  if (!src || typeof src !== "object" || !("getAudioTracks" in src)) return [];
  const getTracks = (src as { getAudioTracks?: () => Array<{ enabled: boolean }> }).getAudioTracks;
  return typeof getTracks === "function" ? getTracks.call(src) : [];
}

/**
 * Harter Playback-Cut ohne A06-Truncate: erst Mute/Gain/Remote-Track,
 * dann pause — damit der Jitter-Buffer nicht als Restton auskippt.
 * `currentTime` bleibt unangetastet (kein Heard-Ack).
 */
export function applyHardPlaybackCut(audio: HardCutAudio): void {
  audio.muted = true;
  audio.volume = 0;
  for (const track of audioTracksOf(audio.srcObject)) track.enabled = false;
  audio.pause();
}

export function restoreHardPlaybackCut(audio: HardCutAudio, userMuted: boolean): void {
  for (const track of audioTracksOf(audio.srcObject)) track.enabled = true;
  audio.volume = 1;
  audio.muted = userMuted;
}

/**
 * Hume EVI min_interruption / 006-Gate: eine belegte Zahl für den Stufe-A-Watchdog.
 * Cap ohne Inhalt ist release_A (Hold lösen), nicht Barge-in. Keine zweite Magic-Number.
 */
export const LIVE_STAGE_B_MIN_MS = 800;

/** de-AT Backchannel am Wort — mehr als diese Liste ist Inhalt (Stufe B). */
export const LIVE_BACKCHANNEL_WORDS = [
  "mhm",
  "mmh",
  "aha",
  "genau",
  "ja",
  "jo",
  "ok",
  "okay",
  "hm",
  "ähm",
  "äh",
] as const;

const LIVE_BACKCHANNEL_SET = new Set<string>(LIVE_BACKCHANNEL_WORDS);

export type LiveBargeStage = "none" | "A" | "B";

export type LivePlaybackClock = {
  generation_id: string | null;
  /** performance.now() solange wirklich hörbar; null = gehalten/gefroren/nicht gestartet */
  audibleSince: number | null;
  /** aufgelaufene hörbare ms; null = Instrument nie gelaufen */
  accruedMs: number | null;
};

export function createLivePlaybackClock(): LivePlaybackClock {
  return { generation_id: null, audibleSince: null, accruedMs: null };
}

export function startLivePlaybackClock(
  clock: LivePlaybackClock,
  generationId: string | null | undefined,
  now: number,
): LivePlaybackClock {
  if (!generationId) return clock;
  if (clock.generation_id === generationId) {
    if (clock.audibleSince !== null) return clock;
    return { ...clock, audibleSince: now };
  }
  return { generation_id: generationId, audibleSince: now, accruedMs: 0 };
}

export function readLivePlaybackCursor(clock: LivePlaybackClock, now: number): number | "unknown" {
  if (!clock.generation_id) return "unknown";
  if (clock.audibleSince === null && clock.accruedMs === null) return "unknown";
  const running = clock.audibleSince !== null ? Math.max(0, now - clock.audibleSince) : 0;
  return Math.round((clock.accruedMs ?? 0) + running);
}

export function freezeLivePlaybackClock(
  clock: LivePlaybackClock,
  now: number,
): { clock: LivePlaybackClock; cursor: number | "unknown" } {
  const cursor = readLivePlaybackCursor(clock, now);
  if (clock.audibleSince === null) return { clock, cursor };
  const accrued = cursor === "unknown" ? clock.accruedMs : cursor;
  return { clock: { ...clock, audibleSince: null, accruedMs: accrued }, cursor };
}

export function thawLivePlaybackClock(clock: LivePlaybackClock, now: number): LivePlaybackClock {
  if (!clock.generation_id || clock.audibleSince !== null) return clock;
  if (clock.accruedMs === null) return clock;
  return { ...clock, audibleSince: now };
}

export function heardMsFromCursor(cursor: number | "unknown"): number | "unknown" {
  if (cursor === "unknown" || cursor <= 0) return "unknown";
  return cursor;
}

export function makeLiveHeardAck(
  generationId: string | null,
  cursor: number | "unknown",
): LiveHeardAck {
  return {
    generation_id: generationId,
    playback_cursor_ms: cursor,
    heard_ms: heardMsFromCursor(cursor),
  };
}

/** Alle Wörter nach Fold in der Backchannel-Liste — leer ist unbekannt, nicht mhm. */
export function isLiveBackchannelTranscript(text: string): boolean {
  const folded = foldLiveText(text);
  if (!folded) return false;
  const words = folded.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => LIVE_BACKCHANNEL_SET.has(word));
}

/**
 * 006-Gate: Inhalt fördert A→B. Leeres Transcript und reine Backchannel-Wörter tun das nicht.
 * `elapsedMs` bleibt in der Signatur (Watchdog ruft dieselbe Funktion), zählt aber nicht als Promoter.
 */
export function hasLiveContentWord(text: string): boolean {
  const folded = foldLiveText(text);
  if (!folded) return false;
  if (isLiveBackchannelTranscript(text)) return false;
  const words = folded.split(/\s+/).filter(Boolean);
  // Delta-Fragment „m“ ist kein Inhalt — mindestens zwei Zeichen in einem Nicht-Backchannel-Wort.
  return words.some((word) => !LIVE_BACKCHANNEL_SET.has(word) && word.length >= 2);
}

export function shouldPromoteLiveStageAToB(_elapsedMs: number, interimTranscript = ""): boolean {
  return hasLiveContentWord(interimTranscript);
}

export type LiveBargeAction = "none" | "stay_A" | "promote_B" | "resume_A" | "release_A";

export function nextLiveBargeAction(opts: {
  stage: LiveBargeStage;
  elapsedMs: number;
  interimTranscript: string;
  speechStopped: boolean;
}): LiveBargeAction {
  if (opts.stage !== "A") return "none";
  if (shouldPromoteLiveStageAToB(opts.elapsedMs, opts.interimTranscript)) return "promote_B";
  if (opts.speechStopped && isLiveBackchannelTranscript(opts.interimTranscript)) return "resume_A";
  // S4: 800 ms ohne Inhalt ist Watchdog gegen ewiges Mute, nicht Barge-in.
  if (opts.elapsedMs >= LIVE_STAGE_B_MIN_MS && !hasLiveContentWord(opts.interimTranscript)) {
    return "release_A";
  }
  return "stay_A";
}

/**
 * Hangup-Tx (S2): natürliches Buffer-Ende schließt auch in Stufe A.
 * Close erst nach diesem Stop — nicht bei speech_started/Cap.
 */
export function shouldFireHangupOnOutputStopped(opts: {
  pendingEndCall: boolean;
}): boolean {
  return opts.pendingEndCall;
}

/**
 * end_call-Werkzeug: Close wartet, solange der Schlusssatz noch läuft
 * (hörbar oder Stufe-A-Hold). Schon gestopptes Buffer → now. Cap/mhm allein schließen nicht.
 */
export function hangupCloseOnEndCallTool(opts: {
  audioPlaying: boolean;
  bargeStage: LiveBargeStage;
}): "now" | "wait" {
  if (opts.audioPlaying || opts.bargeStage === "A") return "wait";
  return "now";
}

export type LiveCallTransport = {
  gate: LivePlaybackGate;
  clock: LivePlaybackClock;
  bargeStage: LiveBargeStage;
};

/** Repeat / neuer Call: frische Uhr und Gate. Keine Cut-Sperre, kein Heard der Vor-Session. */
export function remountLiveCallTransport(): LiveCallTransport {
  return {
    gate: createLivePlaybackGate(),
    clock: createLivePlaybackClock(),
    bargeStage: "none",
  };
}

export function liveCallTransportIsFresh(transport: LiveCallTransport): boolean {
  return (
    transport.bargeStage === "none" &&
    transport.gate.suppressPlayback === false &&
    transport.gate.cutResponseId === null &&
    transport.gate.heardAck === null &&
    transport.clock.generation_id === null &&
    transport.clock.audibleSince === null &&
    transport.clock.accruedMs === null
  );
}

export function liveStageAOnSpeechStarted(phase: string, audioPlaying: boolean, stage: LiveBargeStage): boolean {
  if (stage === "B" || stage === "A") return false;
  return shouldMuteOnUserSpeech(phase, audioPlaying);
}

/** Folge-`response.created` / neues `output_audio_buffer.started` dürfen die gehaltene generation_id nicht stehlen. */
export function shouldKeepHeldGeneration(stage: LiveBargeStage): boolean {
  return stage === "A";
}

export function liveStageARestoreIsSafe(opts: {
  suppressPlayback: boolean;
  holdPlayback: boolean;
  hasRemote: boolean;
}): boolean {
  if (opts.suppressPlayback || opts.holdPlayback || !opts.hasRemote) return false;
  return true;
}

/**
 * Stufe A: lokal halten ohne Cut. Kein pause, keine Track-Sperre —
 * Resume ist Unmute derselben generation_id. Restore unsicher → kein Fake-Resume
 * (009: Cap→B nur hier, nicht bei wortlosem Watchdog).
 */
export function applySoftPlaybackHold(audio: Pick<HardCutAudio, "muted" | "volume">): void {
  audio.muted = true;
  audio.volume = 0;
}

export function restoreSoftPlaybackHold(audio: Pick<HardCutAudio, "muted" | "volume">, userMuted: boolean): void {
  audio.volume = 1;
  audio.muted = userMuted;
}

export const LIVE_STAGE_B_ORDER = ["freeze", "cut", "cancel_clear", "heard_ack"] as const;

export function planLiveStageBCut(
  clock: LivePlaybackClock,
  now: number,
  responseId: string | null,
): {
  stage: "B";
  order: typeof LIVE_STAGE_B_ORDER;
  clock: LivePlaybackClock;
  cursor: number | "unknown";
  interruptEvents: ReadonlyArray<{ type: string; response_id?: string }>;
  heardAck: LiveHeardAck;
} {
  const frozen = freezeLivePlaybackClock(clock, now);
  return {
    stage: "B",
    order: LIVE_STAGE_B_ORDER,
    clock: frozen.clock,
    cursor: frozen.cursor,
    interruptEvents: liveInterruptClientEvents(responseId),
    heardAck: makeLiveHeardAck(responseId ?? clock.generation_id, frozen.cursor),
  };
}

/** Verspätete DC-Events nach Teardown/Reconnect gehören nicht zur aktiven Generation. */
export function isLiveEventCurrent(eventGeneration: number, activeGeneration: number): boolean {
  return eventGeneration > 0 && eventGeneration === activeGeneration;
}

/**
 * Nach Auflegen: keine neuen Nutzer-Transkripte. Schlusssatz der Figur darf
 * noch landen, solange die Generation lebt (settleInflight vor /end).
 */
export function shouldPostLiveTranscript(opts: {
  eventGeneration: number;
  activeGeneration: number;
  ended: boolean;
  speaker: "trainee" | "counterpart";
}): boolean {
  if (!isLiveEventCurrent(opts.eventGeneration, opts.activeGeneration)) return false;
  if (opts.ended && opts.speaker === "trainee") return false;
  return true;
}

/**
 * Client-Events nur Stufe B. `response.cancel` zielt auf die hörbare Antwort;
 * ohne `response_id` könnte ein schon gestarteter Folge-Turn sterben.
 * Client ist Stufe-B-Owner (`interrupt_response: false` im server_vad-Default).
 * Truncate bleibt verboten.
 */
export function liveInterruptClientEvents(
  responseId?: string | null,
): ReadonlyArray<{ type: string; response_id?: string }> {
  const cancel: { type: string; response_id?: string } = { type: "response.cancel" };
  if (responseId) cancel.response_id = responseId;
  return [cancel, { type: "output_audio_buffer.clear" }];
}

/**
 * Provider-Fehler nach Barge-in/Cancel, die die Leitung nicht töten dürfen —
 * oft „Cancellation failed: no active response found“, wenn Server-VAD schon gekappt hat.
 */
export function isBenignLiveCancelError(code: string | undefined, detail: string | undefined): boolean {
  const hint = `${code ?? ""} ${detail ?? ""}`;
  return /response\.cancel|cannot cancel|cancellation failed|no active response|output_audio_buffer\.clear/i.test(
    hint,
  );
}

/** Terminal-Event einer gekappten Antwort, nachdem die Folgeantwort schon `created` ist. */
export function isStaleResponseTerminal(doneId: string | undefined, activeResponseId: string | null): boolean {
  return Boolean(doneId && activeResponseId && doneId !== activeResponseId);
}

/** GA: Cancel kommt als `response.done` mit status=cancelled; älteres `response.cancelled` bleibt gültig. */
export function isCancelledResponse(type: string, status: string | undefined): boolean {
  return type === "response.cancelled" || status === "cancelled";
}
