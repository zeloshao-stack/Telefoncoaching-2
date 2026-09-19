"use client";

import { useEffect, useRef, useState } from "react";
import type { OrbPhase } from "@/components/training/VoiceOrb";
import { saveLiveTiming, type LiveTiming } from "@/lib/live-metrics";
import {
  dropLiveSecret,
  registerLiveCall,
  releaseLiveCall,
  takeLiveSecret,
  LiveBusyError,
} from "@/components/training/liveToken";
import {
  applyHardPlaybackCut,
  applySoftPlaybackHold,
  bargeInTimingMs,
  createLiveDedupe,
  freezeLivePlaybackClock,
  isLiveEventCurrent,
  isPhantomLiveTranscript,
  isTooShortSpeech,
  liveGreetingInstructions,
  isBenignLiveCancelError,
  livePlaybackAfterCutAck,
  livePlaybackAfterLocalCut,
  livePlaybackAfterResponseCreated,
  livePlaybackAfterSpeechStopped,
  livePlaybackWithHeardAck,
  hangupCloseOnEndCallTool,
  liveStageAOnSpeechStarted,
  liveStageARestoreIsSafe,
  remountLiveCallTransport,
  shouldFireHangupOnOutputStopped,
  shouldKeepHeldGeneration,
  LIVE_STAGE_B_MIN_MS,
  makeLiveHeardAck,
  netSpeechMs,
  nextLiveBargeAction,
  planLiveStageBCut,
  restoreHardPlaybackCut,
  restoreSoftPlaybackHold,
  sameLiveText,
  shouldDeferSuppressedStart,
  shouldHoldClientPlayback,
  shouldMuteOnUserSpeech,
  shouldPostLiveTranscript,
  shouldShowThinking,
  shouldSuppressStartedAudio,
  startLivePlaybackClock,
  thawLivePlaybackClock,
  isCancelledResponse,
  isStaleResponseTerminal,
  summarizeLatencyMs,
  type LiveBargeStage,
  type LiveHeardAck,
  type LivePlaybackClock,
} from "@/lib/live-text";

/** Orb-Phasen plus kurzer Barge-in-Puls. A04 rendert Statuscopy. */
export type LivePhase = OrbPhase | "interrupted";

type LiveEvent = {
  type?: string;
  transcript?: string;
  delta?: string;
  name?: string;
  call_id?: string;
  item_id?: string;
  response_id?: string;
  audio_start_ms?: number;
  audio_end_ms?: number;
  error?: { message?: string; code?: string } | string;
  response?: { id?: string; status?: string };
  item?: {
    id?: string;
    type?: string;
    name?: string;
    call_id?: string;
    arguments?: string;
  };
};

export type LiveStatus = "off" | "connecting" | "live" | "failed";

/** Argumente des end_call-Werkzeugs, wie die Figur sie mitgibt. */
export type LiveEndCall = { reason?: string; lastLine?: string };

/** Die Policy will auflegen — kommt mit den Instructions aus der Turns-Route. */
export type LiveHangupHint = { reason: string; closingLine: string };

const HEARTBEAT_MS = 20_000;
const RESPONSE_STALE_MS = 30_000;
/** Nach end_call: so lange darf der Schlusssatz noch ausklingen, bevor die Leitung fällt. */
const END_CALL_AUDIO_GRACE_MS = 8_000;
const dev = process.env.NODE_ENV !== "production";

function parseEndCallArgs(raw: string | undefined): LiveEndCall {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { reason?: unknown; last_line?: unknown };
    return {
      reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
      lastLine: typeof parsed.last_line === "string" ? parsed.last_line : undefined,
    };
  } catch {
    return {};
  }
}

function parseEvent(raw: string): LiveEvent | null {
  try {
    return JSON.parse(raw) as LiveEvent;
  } catch {
    return null;
  }
}

function holdTabLock(sessionId: string, signal: AbortSignal) {
  if (typeof navigator === "undefined" || !navigator.locks?.request) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    void navigator.locks.request(`tc-live-${sessionId}`, { ifAvailable: true }, (lock) => {
      if (!lock) {
        resolve(false);
        return;
      }
      resolve(true);
      return new Promise<void>((release) => {
        if (signal.aborted) {
          release();
          return;
        }
        signal.addEventListener("abort", () => release(), { once: true });
      });
    });
  });
}

export function useLiveCall(args: {
  sessionId: string;
  stream: MediaStream | null;
  audioEl: HTMLAudioElement | null;
  enabled: boolean;
  muted?: boolean;
  /** Auflegen/Drop: play() darf den Cut nicht wieder aufdrehen. */
  holdPlayback?: boolean;
  /** Erster Satz der Gegenseite; null/undefined = kein Greeting (Anrufer hat schon gesprochen). */
  greeting?: string | null;
  onUserText: (text: string) => void | Promise<void>;
  onCounterpartText: (text: string) => void;
  /** Die Figur hat per end_call aufgelegt — mit Grund und Schlusssatz, soweit mitgegeben. */
  onEndCall: (info: LiveEndCall) => void;
  onPhase: (phase: OrbPhase) => void;
  onError: (message: string) => void;
}) {
  const [status, setStatus] = useState<LiveStatus>("off");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [timings, setTimings] = useState<LiveTiming[]>([]);
  const sendTextRef = useRef<(text: string) => boolean>(() => false);
  const updateInstructionsRef = useRef<(instructions: string, hangup?: LiveHangupHint | null) => boolean>(
    () => false,
  );
  const playRef = useRef<() => void>(() => undefined);
  const argsRef = useRef(args);
  const callGenerationRef = useRef(0);
  argsRef.current = args;

  useEffect(() => {
    const el = args.audioEl;
    if (el) el.muted = Boolean(args.muted);
  }, [args.audioEl, args.muted]);

  useEffect(() => {
    if (!args.enabled || !args.stream || !args.sessionId || !args.audioEl) {
      setStatus("off");
      sendTextRef.current = () => false;
      updateInstructionsRef.current = () => false;
      return;
    }

    const stream = args.stream;
    const sessionId = args.sessionId;
    const audio = args.audioEl;
    const setupStartedAt = performance.now();
    setTimings([]);
    const recordTiming = (kind: LiveTiming["kind"], ms: number) => {
      const sample = { kind, ms, at: new Date().toISOString() };
      setTimings(saveLiveTiming(sample));
    };
    const ac = new AbortController();
    const callGeneration = ++callGenerationRef.current;
    let pc: RTCPeerConnection | null = null;
    let dc: RTCDataChannel | null = null;
    let callId: string | null = null;
    let heartbeat: number | null = null;

    const isCurrentCall = () => isLiveEventCurrent(callGeneration, callGenerationRef.current);

    // Transkripte: genau einmal pro item_id, dazu ein kurzes Netz gegen wortgleiche Doppel.
    const userDedupe = createLiveDedupe();
    const counterpartDedupe = createLiveDedupe();
    const timeoutItems = new Set<string>();
    const segments = new Map<string, { start?: number; end?: number }>();
    const memoryCalls = new Set<string>();
    let memoryEpoch = 0;
    let transcriptPersistence: Promise<void> = Promise.resolve();
    let latestInputItem: string | undefined;
    let persistedInputItem: string | undefined;
    let latestCallerText = "";
    let pendingStart: number | null = null;
    let pendingEnd: number | null = null;
    let counterpartBuf = "";

    // Nur ein response.create gleichzeitig.
    let activeResponse = false;
    let activeSince = 0;
    let inflight: unknown = null;
    const queue: unknown[] = [];
    let greeted = false;
    let speechStarted = false;
    let greetingPayload: unknown = null;
    let greetingResponseId: string | null = null;
    let ended = false;
    // session.update gilt erst für die nächste Antwort — läuft gerade eine, wird es nachgereicht.
    let pendingSessionUpdate: unknown = null;
    let pendingHangup: LiveHangupHint | null = null;
    // Instructions mit „LEG JETZT AUF“ sind angekommen: sagt die Figur ihren Schlusssatz ohne
    // end_call (mini-Modelle tun das), wird das Werkzeug mit der nächsten Antwort erzwungen.
    let armedHangup: LiveHangupHint | null = null;
    let forcedEndCall = false;
    let endCallInResponse = false;
    // Hat die Figur in der laufenden Antwort gesprochen? Dann zählt das Transkript, nicht last_line.
    let spokeInResponse = false;
    // end_call kam, aber der Schlusssatz klingt noch aus.
    let audioPlaying = false;
    let pendingEndCall: LiveEndCall | null = null;
    let endCallTimer: number | null = null;

    // Latenz je Turn (nur Dev) — auch Text-/API-Pfad setzt den Mark.
    let tSpeechStopped = 0;
    let tResponseCreated = 0;
    let latencyMarkSource: "speech_stopped" | "text_turn" | null = null;
    const latencySamples: number[] = [];
    // Barge-in: lokal Mute → Provider clear/cancel.
    let tBargeLocalMute = 0;
    let bargeLogged = false;
    let currentPhase: LivePhase = "idle";
    let activeResponseId: string | null = null;
    // S3: jeder Effect-Lauf ist ein neuer Call — keine Cut-Sperre, keine Uhr der Vor-Session.
    const remounted = remountLiveCallTransport();
    let playbackGate = remounted.gate;
    let deferredStartId: string | null = null;
    let bargeStage: LiveBargeStage = remounted.bargeStage;
    let stageAEnteredAt = 0;
    let stageAWatchdog: number | null = null;
    let stageAInterim = "";
    let stageASpeechStopped = false;
    let stageAGenerationEnded = false;
    let playbackClock: LivePlaybackClock = remounted.clock;
    let lastHeardAck: LiveHeardAck | null = null;
    if (!args.holdPlayback) {
      restoreHardPlaybackCut(audio, Boolean(args.muted));
    }

    const markLatencyStart = (source: "speech_stopped" | "text_turn") => {
      tSpeechStopped = performance.now();
      tResponseCreated = 0;
      latencyMarkSource = source;
    };

    const publishLiveDebug = () => {
      if (!dev || typeof window === "undefined") return;
      const summary = summarizeLatencyMs(latencySamples);
      (window as unknown as { __tcLiveDebug?: unknown }).__tcLiveDebug = {
        latencySamples: [...latencySamples],
        latencySummary: summary,
        phase: currentPhase,
        audioPlaying,
        bargePending: tBargeLocalMute > 0 && !bargeLogged,
        bargeStage,
        playbackCursorMs: lastHeardAck?.playback_cursor_ms ?? "unknown",
        heardAck: lastHeardAck,
      };
    };

    const emitPhase = (phase: LivePhase) => {
      if (!isCurrentCall()) return;
      currentPhase = phase;
      argsRef.current.onPhase(phase as OrbPhase);
    };

    const play = () => {
      if (bargeStage === "A") {
        applySoftPlaybackHold(audio);
        return;
      }
      if (shouldHoldClientPlayback(playbackGate.suppressPlayback, Boolean(argsRef.current.holdPlayback))) {
        applyHardPlaybackCut(audio);
        return;
      }
      restoreHardPlaybackCut(audio, Boolean(argsRef.current.muted));
      audio
        .play()
        .then(() => {
          if (isCurrentCall()) setAudioBlocked(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "NotAllowedError" && isCurrentCall()) {
            setAudioBlocked(true);
          }
        });
    };

    const dropQueuedResponses = () => {
      queue.length = 0;
    };

    const flushDeferredStart = () => {
      if (playbackGate.suppressPlayback || !deferredStartId) return;
      if (deferredStartId !== activeResponseId) {
        deferredStartId = null;
        return;
      }
      deferredStartId = null;
      bargeStage = "none";
      audioPlaying = true;
      playbackClock = startLivePlaybackClock(playbackClock, activeResponseId, performance.now());
      play();
      emitPhase("speaking");
    };

    const cutLocalPlayback = (cutId: string | null) => {
      applyHardPlaybackCut(audio);
      audioPlaying = false;
      playbackGate = livePlaybackAfterLocalCut(playbackGate, cutId);
      deferredStartId = null;
      dropQueuedResponses();
    };

    const clearStageAWatchdog = () => {
      if (stageAWatchdog !== null) {
        window.clearTimeout(stageAWatchdog);
        stageAWatchdog = null;
      }
    };

    const resetStageAFlags = () => {
      clearStageAWatchdog();
      stageAEnteredAt = 0;
      stageAInterim = "";
      stageASpeechStopped = false;
      stageAGenerationEnded = false;
    };

    const promoteStageB = (reason: string) => {
      if (bargeStage === "B") return;
      const now = performance.now();
      // Reihenfolge zwingend: Freeze → Cut → cancel/clear → Heard-Ack. Clock nach Cancel ist verboten.
      const plan = planLiveStageBCut(playbackClock, now, activeResponseId);
      playbackClock = plan.clock;
      lastHeardAck = plan.heardAck;
      bargeStage = "B";
      const alreadyStopped = stageASpeechStopped;
      resetStageAFlags();
      tBargeLocalMute = now;
      bargeLogged = false;
      cutLocalPlayback(activeResponseId);
      playbackGate = livePlaybackWithHeardAck(playbackGate, plan.heardAck);
      if (alreadyStopped) {
        playbackGate = livePlaybackAfterSpeechStopped(playbackGate);
      }
      if (dc?.readyState === "open") {
        for (const event of plan.interruptEvents) sendEvent(event);
      }
      if (dev) console.info(`live barge-in: Stufe B (${reason}) cursor=${plan.cursor}`);
      emitPhase("listening");
      publishLiveDebug();
    };

    const resumeStageA = () => {
      if (bargeStage !== "A") return;
      const now = performance.now();
      if (
        !liveStageARestoreIsSafe({
          suppressPlayback: playbackGate.suppressPlayback,
          holdPlayback: Boolean(argsRef.current.holdPlayback),
          hasRemote: Boolean(audio.srcObject),
        })
      ) {
        // Restore unsicher: kurzes Mute hat gehalten, Cap→B statt Fake-Resume.
        promoteStageB("unsafe_restore");
        return;
      }
      if (stageAGenerationEnded) {
        resetStageAFlags();
        bargeStage = "none";
        emitPhase("listening");
        if (dev) console.info("live barge-in: Stufe A Ende ohne Resume (Generation schon tot)");
        publishLiveDebug();
        return;
      }
      playbackClock = thawLivePlaybackClock(playbackClock, now);
      resetStageAFlags();
      bargeStage = "none";
      restoreSoftPlaybackHold(audio, Boolean(argsRef.current.muted));
      audioPlaying = true;
      emitPhase("speaking");
      if (dev) console.info("live barge-in: Stufe A Resume (gleiche generation_id, kein response.create)");
      publishLiveDebug();
    };

    const considerStageA = () => {
      if (bargeStage !== "A") return;
      const elapsed = performance.now() - stageAEnteredAt;
      const action = nextLiveBargeAction({
        stage: bargeStage,
        elapsedMs: elapsed,
        interimTranscript: stageAInterim,
        speechStopped: stageASpeechStopped,
      });
      if (action === "promote_B") promoteStageB("content");
      else if (action === "resume_A" || action === "release_A") resumeStageA();
    };

    const enterStageA = () => {
      const now = performance.now();
      if (
        !liveStageARestoreIsSafe({
          suppressPlayback: playbackGate.suppressPlayback,
          holdPlayback: Boolean(argsRef.current.holdPlayback),
          hasRemote: Boolean(audio.srcObject),
        })
      ) {
        promoteStageB("unsafe_hold");
        return;
      }
      const frozen = freezeLivePlaybackClock(playbackClock, now);
      playbackClock = frozen.clock;
      bargeStage = "A";
      stageAEnteredAt = now;
      stageAInterim = "";
      stageASpeechStopped = false;
      stageAGenerationEnded = false;
      applySoftPlaybackHold(audio);
      clearStageAWatchdog();
      stageAWatchdog = window.setTimeout(() => {
        if (bargeStage === "A") considerStageA();
      }, LIVE_STAGE_B_MIN_MS);
      if (dev) console.info("live barge-in: Stufe A Hold (kein cancel/clear)");
      publishLiveDebug();
    };

    playRef.current = play;
    play();

    const sendEvent = (payload: unknown) => {
      if (dc?.readyState === "open") dc.send(JSON.stringify(payload));
    };

    const requestResponse = (payload: unknown) => {
      if (activeResponse && Date.now() - activeSince > RESPONSE_STALE_MS) {
        if (dev) console.warn("live: response.done blieb aus — Sperre aufgehoben");
        activeResponse = false;
      }
      if (activeResponse) {
        queue.push(payload);
        return;
      }
      activeResponse = true;
      activeSince = Date.now();
      inflight = payload;
      sendEvent(payload);
    };

    const finishResponse = () => {
      activeResponse = false;
      inflight = null;
      if (pendingSessionUpdate !== null) {
        sendEvent(pendingSessionUpdate);
        pendingSessionUpdate = null;
        armedHangup = pendingHangup;
        pendingHangup = null;
        if (dev) console.debug("live: session.update nachgereicht");
      }
      const next = queue.shift();
      if (next !== undefined) requestResponse(next);
    };

    updateInstructionsRef.current = (instructions: string, hangup?: LiveHangupHint | null) => {
      if (!instructions.trim() || dc?.readyState !== "open" || ended) return false;
      const payload = { type: "session.update", session: { type: "realtime", instructions } };
      if (activeResponse && Date.now() - activeSince <= RESPONSE_STALE_MS) {
        pendingSessionUpdate = payload;
        pendingHangup = hangup ?? null;
        return true;
      }
      sendEvent(payload);
      armedHangup = hangup ?? null;
      if (dev) console.debug(`live: session.update gesendet (${instructions.length} Zeichen)`);
      return true;
    };

    /** Schlusssatz kam, end_call nicht: das Werkzeug mit einer stummen Folgeantwort erzwingen. */
    const forceEndCall = (hangup: LiveHangupHint) => {
      if (forcedEndCall || ended) return;
      forcedEndCall = true;
      if (dev) console.info(`live: end_call erzwungen (${hangup.reason})`);
      requestResponse({
        type: "response.create",
        response: {
          tool_choice: { type: "function", name: "end_call" },
          instructions: `Das Gespräch ist beendet. Rufe jetzt end_call auf: reason "${hangup.reason}", last_line = dein zuletzt gesagter Satz. Sprich nicht mehr.`,
        },
      });
    };

    const fireEndCall = () => {
      if (!pendingEndCall || !isCurrentCall()) return;
      const info = pendingEndCall;
      pendingEndCall = null;
      if (endCallTimer !== null) {
        window.clearTimeout(endCallTimer);
        endCallTimer = null;
      }
      argsRef.current.onEndCall(info);
    };

    sendTextRef.current = (text: string) => {
      const spoken = text.replace(/\s+/g, " ").trim();
      if (!spoken || dc?.readyState !== "open") return false;
      // Ohne echtes Mikro: Latenzkette speech_stopped→audio trotzdem messbar.
      markLatencyStart("text_turn");
      if (shouldShowThinking(audioPlaying) && !ended) emitPhase("thinking");
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: spoken }],
        },
      });
      requestResponse({ type: "response.create" });
      return true;
    };

    const segmentFor = (id: string | undefined) => {
      if (!id) return null;
      const seg = segments.get(id);
      if (seg?.start !== undefined && seg.end !== undefined) return { start: seg.start, end: seg.end };
      return null;
    };

    const handleUserTranscript = (msg: LiveEvent) => {
      const id = msg.item_id;
      const text = (msg.transcript || "").replace(/\s+/g, " ").trim();
      if (bargeStage === "A" && text) {
        stageAInterim = text;
        considerStageA();
      }
      if (!text) return;
      if (id && timeoutItems.has(id)) {
        if (dev) console.debug("live: Transkript aus idle-timeout verworfen", text);
        return;
      }
      const seg = segmentFor(id);
      if (seg && isTooShortSpeech(seg.start, seg.end)) {
        if (dev) console.debug(`live: Segment zu kurz (${netSpeechMs(seg.start, seg.end)} ms netto) verworfen`, text);
        return;
      }
      if (isPhantomLiveTranscript(text)) {
        if (dev) console.debug("live: Phantom-STT verworfen", text);
        return;
      }
      if (!userDedupe.take(id, text)) return;
      if (
        !shouldPostLiveTranscript({
          eventGeneration: callGeneration,
          activeGeneration: callGenerationRef.current,
          ended,
          speaker: "trainee",
        })
      ) {
        return;
      }
      latestCallerText = text;
      transcriptPersistence = Promise.resolve(argsRef.current.onUserText(text)).then(() => {
        persistedInputItem = id;
      });
    };

    const logBargeProvider = (kind: "cleared" | "cancelled" | "stopped") => {
      if (!dev || !tBargeLocalMute || bargeLogged) return;
      const ms = bargeInTimingMs(tBargeLocalMute, performance.now());
      if (ms === null) return;
      bargeLogged = true;
      console.info(`live barge-in: ${kind}Ms=${ms} (localMute→provider)`);
      tBargeLocalMute = 0;
      publishLiveDebug();
    };

    const handleFunctionCall = (msg: LiveEvent) => {
      const item = msg.item;
      if (!item || item.type !== "function_call" || !item.name) return;
      if (item.name === "recall_memory") {
        const id = item.call_id;
        if (!id || ended || memoryCalls.has(id)) return;
        if (msg.response_id && activeResponseId && msg.response_id !== activeResponseId) return;
        memoryCalls.add(id);
        if (memoryCalls.size > 200) memoryCalls.delete(memoryCalls.values().next().value!);
        const epoch = memoryEpoch;
        const current = () => isCurrentCall() && !ac.signal.aborted && !ended && epoch === memoryEpoch;
        void (async () => {
          let output: { facts: string[]; status: string; instruction?: string } = {
            facts: [], status: "unavailable", instruction: "Keine Information verfügbar. Keine Fakten erfinden.",
          };
          try {
            const parsed: unknown = JSON.parse(item.arguments || "{}");
            const query = typeof parsed === "object" && parsed !== null && "query" in parsed ? parsed.query : null;
            if (typeof query !== "string" || !query.trim() || query.length > 600) throw new Error("invalid memory query");
            let persistenceTimer: ReturnType<typeof setTimeout> | undefined;
            try {
              await Promise.race([transcriptPersistence, new Promise<never>((_, reject) => {
                persistenceTimer = setTimeout(() => reject(new Error("transcript timeout")), 1500);
              })]);
            } finally {
              if (persistenceTimer !== undefined) clearTimeout(persistenceTimer);
            }
            // Realtime may request a tool before STT finishes. Fail closed rather
            // than authorize against the preceding question stored on the server.
            if (!latestCallerText || (latestInputItem && latestInputItem !== persistedInputItem)) throw new Error("transcript pending");
            const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/memory`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: query.trim(), expectedCallerText: latestCallerText }),
              signal: AbortSignal.any([ac.signal, AbortSignal.timeout(10_000)]),
            });
            if (!response.ok) throw new Error("memory unavailable");
            const data = await response.json() as { facts?: unknown; status?: unknown };
            if (data.status === "stale" || data.status === "ended") throw new Error("memory no longer current");
            if (!Array.isArray(data.facts) || !data.facts.every((fact) => typeof fact === "string") ||
                !["recalled", "none"].includes(String(data.status))) throw new Error("invalid memory result");
            output = { facts: data.facts, status: String(data.status) };
          } catch { /* Fail closed; the model may not invent a substitute fact. */ }
          if (!isCurrentCall() || ac.signal.aborted || ended) return;
          if (!current()) output = { facts: [], status: "stale" };
          sendEvent({ type: "conversation.item.create", item: {
            type: "function_call_output", call_id: id, output: JSON.stringify(output),
          } });
          if (current()) requestResponse({ type: "response.create" });
        })();
        return;
      }
      if (item.name === "end_call") {
        endCallInResponse = true;
        sendEvent({
          type: "conversation.item.create",
          item: { type: "function_call_output", call_id: item.call_id, output: "aufgelegt" },
        });
        if (!ended) {
          ended = true;
          const args = parseEndCallArgs(item.arguments);
          // Erzwungener Aufruf ohne Grund: der Grund aus der Policy gilt. last_line nur, wenn die
          // Figur den Schlusssatz nicht ohnehin gesagt hat (sonst steht er schon per Transkript da).
          pendingEndCall = {
            reason: args.reason ?? armedHangup?.reason,
            lastLine: spokeInResponse || forcedEndCall ? undefined : args.lastLine,
          };
          if (dev) console.info("live: end_call", pendingEndCall);
          // S2: Close nicht vor dem Goodbye. Stufe A hält den Satz — warten auf Buffer-Stop oder Grace.
          if (hangupCloseOnEndCallTool({ audioPlaying, bargeStage }) === "wait") {
            endCallTimer = window.setTimeout(fireEndCall, END_CALL_AUDIO_GRACE_MS);
          } else {
            fireEndCall();
          }
        }
        return;
      }
      if (item.name === "wait_for_user") {
        tSpeechStopped = 0;
        latencyMarkSource = null;
        // Bewusst kein response.create: die Figur schweigt, bis der Anrufer wirklich spricht.
        sendEvent({
          type: "conversation.item.create",
          item: { type: "function_call_output", call_id: item.call_id, output: JSON.stringify({ ok: true }) },
        });
        if (dev) console.debug("live: wait_for_user — Figur wartet");
        emitPhase("listening");
      }
    };

    const handleMessage = (raw: string) => {
      if (!isCurrentCall()) return;
      const msg = parseEvent(raw);
      if (!msg?.type) return;
      switch (msg.type) {
        case "input_audio_buffer.speech_started": {
          memoryEpoch += 1;
          tSpeechStopped = 0;
          latencyMarkSource = null;
          speechStarted = true;
          pendingStart = typeof msg.audio_start_ms === "number" ? msg.audio_start_ms : null;
          pendingEnd = null;
          if (msg.item_id && pendingStart !== null) {
            segments.set(msg.item_id, { ...segments.get(msg.item_id), start: pendingStart });
          }
          if (liveStageAOnSpeechStarted(currentPhase, audioPlaying, bargeStage)) {
            enterStageA();
            break;
          }
          if (bargeStage === "none") emitPhase("listening");
          break;
        }
        case "input_audio_buffer.speech_stopped": {
          pendingEnd = typeof msg.audio_end_ms === "number" ? msg.audio_end_ms : null;
          if (msg.item_id && pendingEnd !== null) {
            const seg = segments.get(msg.item_id) ?? {};
            if (seg.start === undefined && pendingStart !== null) seg.start = pendingStart;
            seg.end = pendingEnd;
            segments.set(msg.item_id, seg);
          }
          markLatencyStart("speech_stopped");
          if (bargeStage === "A") {
            stageASpeechStopped = true;
            considerStageA();
            break;
          }
          playbackGate = livePlaybackAfterSpeechStopped(playbackGate);
          flushDeferredStart();
          if (playbackGate.suppressPlayback) {
            emitPhase("listening");
          } else if (shouldShowThinking(audioPlaying) && !ended) {
            emitPhase("thinking");
          }
          break;
        }
        case "input_audio_buffer.committed": {
          latestInputItem = msg.item_id;
          if (msg.item_id) {
            const seg = segments.get(msg.item_id) ?? {};
            if (seg.start === undefined && pendingStart !== null) seg.start = pendingStart;
            if (seg.end === undefined && pendingEnd !== null) seg.end = pendingEnd;
            segments.set(msg.item_id, seg);
          }
          break;
        }
        case "input_audio_buffer.timeout_triggered": {
          if (msg.item_id) timeoutItems.add(msg.item_id);
          break;
        }
        case "conversation.item.input_audio_transcription.completed":
          handleUserTranscript(msg);
          break;
        case "conversation.item.input_audio_transcription.delta": {
          // Nur akkumulieren — einzelne Delta-Buchstaben dürfen mhm nicht zu B machen.
          if (bargeStage === "A" && msg.delta) stageAInterim += msg.delta;
          break;
        }
        case "conversation.item.input_audio_transcription.segment": {
          if (bargeStage === "A") {
            const piece = (msg.transcript || "").replace(/\s+/g, " ").trim();
            if (piece) {
              stageAInterim = piece;
              considerStageA();
            }
          }
          break;
        }
        case "conversation.item.input_audio_transcription.failed":
          console.warn("live: Transkription fehlgeschlagen", msg.error);
          break;
        case "response.created": {
          playbackGate = livePlaybackAfterResponseCreated(playbackGate);
          activeResponse = true;
          activeSince = Date.now();
          if (shouldKeepHeldGeneration(bargeStage)) {
            if (dev) console.debug("live: response.created während Stufe A ignoriert (generation_id hält)");
            break;
          }
          activeResponseId = msg.response?.id ?? msg.response_id ?? null;
          endCallInResponse = false;
          spokeInResponse = false;
          if (inflight !== null && inflight === greetingPayload && msg.response?.id) {
            greetingResponseId = msg.response.id;
          }
          if (tSpeechStopped) tResponseCreated = performance.now();
          if (!playbackGate.suppressPlayback && shouldShowThinking(audioPlaying) && !ended) {
            emitPhase("thinking");
          }
          break;
        }
        case "response.done":
        case "response.cancelled":
        case "response.failed": {
          const doneId = msg.response?.id ?? msg.response_id;
          const cancelled = isCancelledResponse(msg.type, msg.response?.status);
          if (cancelled) {
            playbackGate = livePlaybackAfterCutAck(playbackGate, doneId);
            flushDeferredStart();
          }
          if (isStaleResponseTerminal(doneId, activeResponseId)) {
            if (dev) console.debug("live: veraltetes response-Ende ignoriert", msg.type, doneId);
            break;
          }
          if (cancelled) logBargeProvider("cancelled");
          if (deferredStartId && doneId && deferredStartId === doneId) deferredStartId = null;
          // Abbruch ist kein „Antwort fertig ohne end_call“ — sonst legt Barge-in die Leitung.
          const missedHangup =
            msg.type === "response.done" &&
            !cancelled &&
            armedHangup &&
            !endCallInResponse &&
            !ended
              ? armedHangup
              : null;
          finishResponse();
          if (missedHangup) forceEndCall(missedHangup);
          if (shouldKeepHeldGeneration(bargeStage) && (doneId === activeResponseId || !doneId)) {
            stageAGenerationEnded = true;
            break;
          }
          activeResponseId = null;
          emitPhase("listening");
          break;
        }
        case "output_audio_buffer.started": {
          const startedId = msg.response_id ?? msg.response?.id;
          if (shouldKeepHeldGeneration(bargeStage)) {
            applySoftPlaybackHold(audio);
            break;
          }
          if (
            shouldSuppressStartedAudio(
              playbackGate.suppressPlayback,
              startedId,
              playbackGate.cutResponseId,
              activeResponseId,
            )
          ) {
            applyHardPlaybackCut(audio);
            audioPlaying = false;
            if (
              shouldDeferSuppressedStart(
                playbackGate.suppressPlayback,
                startedId,
                activeResponseId,
                playbackGate.cutResponseId,
              )
            ) {
              deferredStartId = startedId ?? null;
            }
            break;
          }
          audioPlaying = true;
          bargeStage = "none";
          playbackClock = startLivePlaybackClock(playbackClock, startedId ?? activeResponseId, performance.now());
          play();
          emitPhase("speaking");
          if (tSpeechStopped && tResponseCreated && (!startedId || startedId === activeResponseId)) {
            const now = performance.now();
            const ms = Math.round(now - tSpeechStopped);
            latencySamples.push(ms);
            if (latencySamples.length > 80) latencySamples.shift();
            recordTiming(latencyMarkSource === "text_turn" ? "text_to_output" : "speech_to_output", ms);
            const toCreated = tResponseCreated ? Math.round(tResponseCreated - tSpeechStopped) : null;
            const series = summarizeLatencyMs(latencySamples);
            const via = latencyMarkSource === "text_turn" ? "text_turn→audio" : "speech_stopped→audio";
            if (dev) console.info(
              `live latency: ${ms} ms (${via})` +
                (toCreated !== null ? `, davon ${toCreated} ms bis response.created` : "") +
                (series
                  ? ` | series n=${series.n} min=${series.min} median=${series.median} max=${series.max}`
                  : ""),
            );
            tSpeechStopped = 0;
            tResponseCreated = 0;
            latencyMarkSource = null;
            publishLiveDebug();
          }
          break;
        }
        case "output_audio_buffer.stopped": {
          const stoppedAt = performance.now();
          const frozen = freezeLivePlaybackClock(playbackClock, stoppedAt);
          playbackClock = frozen.clock;
          if (bargeStage === "A") {
            lastHeardAck = makeLiveHeardAck(playbackClock.generation_id ?? activeResponseId, frozen.cursor);
            playbackGate = livePlaybackWithHeardAck(playbackGate, lastHeardAck);
            stageAGenerationEnded = true;
            audioPlaying = false;
            // S2: Hangup-Tx endet auch in Stufe A — erst nach diesem Stop, nicht vorher.
            if (shouldFireHangupOnOutputStopped({ pendingEndCall: Boolean(pendingEndCall) })) {
              fireEndCall();
            }
            break;
          }
          if (bargeStage === "none" && (playbackClock.generation_id || activeResponseId)) {
            lastHeardAck = makeLiveHeardAck(playbackClock.generation_id ?? activeResponseId, frozen.cursor);
            playbackGate = livePlaybackWithHeardAck(playbackGate, lastHeardAck);
          }
          audioPlaying = false;
          if (tBargeLocalMute) logBargeProvider("stopped");
          // Nach Barge-in kann clear hinter speech_stopped herlaufen — thinking nicht überschreiben.
          if (currentPhase !== "thinking") emitPhase("listening");
          if (shouldFireHangupOnOutputStopped({ pendingEndCall: Boolean(pendingEndCall) })) {
            fireEndCall();
          }
          break;
        }
        case "output_audio_buffer.cleared":
          audioPlaying = false;
          logBargeProvider("cleared");
          playbackGate = livePlaybackAfterCutAck(playbackGate, msg.response_id ?? playbackGate.cutResponseId);
          flushDeferredStart();
          if (currentPhase !== "thinking" || playbackGate.suppressPlayback) emitPhase("listening");
          if (pendingEndCall) fireEndCall();
          break;
        case "response.output_audio_transcript.delta":
          if (msg.delta) counterpartBuf += msg.delta;
          break;
        case "response.output_audio_transcript.done": {
          const text = (msg.transcript || counterpartBuf).replace(/\s+/g, " ").trim();
          counterpartBuf = "";
          if (!text) break;
          spokeInResponse = true;
          const greeting = argsRef.current.greeting;
          const isGreeting =
            (greetingResponseId && msg.response_id === greetingResponseId) ||
            (greeting ? sameLiveText(text, greeting) : false);
          if (isGreeting) {
            // Der Eröffnungssatz steht bereits als Zug 0 im Protokoll.
            counterpartDedupe.take(msg.item_id, text);
            break;
          }
          if (
            counterpartDedupe.take(msg.item_id, text) &&
            shouldPostLiveTranscript({
              eventGeneration: callGeneration,
              activeGeneration: callGenerationRef.current,
              ended,
              speaker: "counterpart",
            })
          ) {
            argsRef.current.onCounterpartText(text);
          }
          break;
        }
        case "response.output_item.done":
          handleFunctionCall(msg);
          break;
        case "error": {
          const code = typeof msg.error === "string" ? "" : msg.error?.code;
          const detail = typeof msg.error === "string" ? msg.error : msg.error?.message;
          if (code === "conversation_already_has_active_response") {
            if (dev) console.warn("live: response.create abgelehnt, Antwort läuft noch — wird nachgereicht");
            activeResponse = true;
            activeSince = Date.now();
            if (inflight !== null && !playbackGate.suppressPlayback) queue.unshift(inflight);
            inflight = null;
            break;
          }
          if (isBenignLiveCancelError(code, detail)) {
            if (dev) console.debug("live: cancel/clear ohne aktive Antwort", code, detail);
            break;
          }
          if (isCurrentCall()) argsRef.current.onError(detail || "Live-Leitung hat einen Fehler gemeldet.");
          break;
        }
        default:
          break;
      }
    };

    // Reload/Tab zu: call_id sofort freigeben, sonst blockiert der Server-Lock bis zu 60 s.
    const onPageHide = () => {
      if (callId) releaseLiveCall(sessionId, callId);
      applyHardPlaybackCut(audio);
    };

    setStatus("connecting");
    void (async () => {
      try {
        const exclusive = await holdTabLock(sessionId, ac.signal);
        if (ac.signal.aborted || !isCurrentCall()) return;
        if (exclusive === false) {
          throw new Error("Die Leitung ist in einem anderen Tab schon offen. Diesen Tab schließen.");
        }

        pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
          if (!isCurrentCall()) return;
          audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
          play();
        };
        const mic = stream.getAudioTracks()[0];
        if (!mic) throw new Error("Kein Mikrofon-Track");
        mic.enabled = true;
        pc.addTrack(mic, stream);

        dc = pc.createDataChannel("oai-events");
        dc.addEventListener("message", (event) => handleMessage(String(event.data || "")));
        dc.addEventListener("open", () => {
          if (ac.signal.aborted || !isCurrentCall()) return;
          recordTiming("setup", performance.now() - setupStartedAt);
          setStatus("live");
          play();
          const greeting = argsRef.current.greeting;
          if (!greeted && greeting && !speechStarted) {
            greeted = true;
            greetingPayload = {
              type: "response.create",
              response: { instructions: liveGreetingInstructions(greeting) },
            };
            requestResponse(greetingPayload);
          }
        });

        if (dev && typeof window !== "undefined") {
          const w = window as unknown as {
            __tcLiveSendText?: (text: string) => boolean;
            __tcLiveBargeIn?: () => { ok: boolean; phase: string; audioPlaying: boolean };
            __tcLiveDebug?: unknown;
          };
          w.__tcLiveSendText = (text: string) => sendTextRef.current(text);
          w.__tcLiveBargeIn = () => {
            if (!shouldMuteOnUserSpeech(currentPhase, audioPlaying) && bargeStage !== "A") {
              return { ok: false, phase: currentPhase, audioPlaying };
            }
            promoteStageB("debug");
            return { ok: true, phase: currentPhase, audioPlaying };
          };
          publishLiveDebug();
        }

        const token = await takeLiveSecret(sessionId);
        if (ac.signal.aborted || !isCurrentCall()) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (ac.signal.aborted) return;
        const sdp = pc.localDescription?.sdp;
        if (!sdp) throw new Error("Kein WebRTC-Angebot");
        const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
          method: "POST",
          body: sdp,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/sdp",
          },
          signal: ac.signal,
        });
        const answer = await sdpRes.text();
        if (!sdpRes.ok || !answer.includes("v=")) {
          dropLiveSecret(sessionId);
          throw new Error(`Live-Anruf ${sdpRes.status}`);
        }
        if (ac.signal.aborted || !isCurrentCall()) return;
        callId = sdpRes.headers.get("Location")?.split("/").pop()?.trim() || null;
        if (callId) {
          await registerLiveCall(sessionId, callId);
          if (ac.signal.aborted || !isCurrentCall()) return;
          heartbeat = window.setInterval(() => {
            if (callId) void registerLiveCall(sessionId, callId).catch(() => undefined);
          }, HEARTBEAT_MS);
          window.addEventListener("pagehide", onPageHide);
        } else if (dev) {
          console.debug("live: keine call_id im Location-Header — kein Server-Lock");
        }
        await pc.setRemoteDescription({ type: "answer", sdp: answer });
        play();
        // Only data-channel open proves the call can exchange events.
      } catch (error) {
        if (ac.signal.aborted || (error instanceof DOMException && error.name === "AbortError") || !isCurrentCall()) {
          return;
        }
        dropLiveSecret(sessionId);
        setStatus("failed");
        const message =
          error instanceof LiveBusyError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Live-Leitung nicht möglich";
        argsRef.current.onError(message);
      }
    })();

    return () => {
      if (callGenerationRef.current === callGeneration) callGenerationRef.current += 1;
      ac.abort();
      sendTextRef.current = () => false;
      updateInstructionsRef.current = () => false;
      playRef.current = () => undefined;
      if (dev && typeof window !== "undefined") {
        const w = window as unknown as {
          __tcLiveSendText?: unknown;
          __tcLiveBargeIn?: unknown;
        };
        delete w.__tcLiveSendText;
        delete w.__tcLiveBargeIn;
      }
      if (heartbeat !== null) window.clearInterval(heartbeat);
      if (endCallTimer !== null) window.clearTimeout(endCallTimer);
      if (stageAWatchdog !== null) window.clearTimeout(stageAWatchdog);
      window.removeEventListener("pagehide", onPageHide);
      if (callId) releaseLiveCall(sessionId, callId);
      try {
        dc?.close();
      } catch {
        /* schon zu */
      }
      pc?.getSenders().forEach((sender) => {
        try {
          pc?.removeTrack(sender);
        } catch {
          /* egal */
        }
      });
      pc?.close();
      applyHardPlaybackCut(audio);
      audio.srcObject = null;
    };
  }, [args.enabled, args.sessionId, args.stream, args.audioEl]);

  return {
    status,
    audioBlocked,
    /** Tab-scoped, bounded diagnostics; output-start event is not acoustic latency. */
    timings,
    sendText: (text: string) => sendTextRef.current(text),
    /** Neue Instructions für die nächste Antwort (session.update) — wartet, falls gerade eine läuft. */
    updateInstructions: (instructions: string, hangup?: LiveHangupHint | null) =>
      updateInstructionsRef.current(instructions, hangup),
    play: () => playRef.current(),
  };
}
