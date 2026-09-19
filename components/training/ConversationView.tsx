"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PhoneOff, Send, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EngineBadge } from "@/components/training/EngineBadge";
import { DictationMic, type AcousticHint, type DictationMicHandle } from "@/components/training/DictationMic";
import { SpeakButton } from "@/components/training/SpeakButton";
import { prefetchSpeech, speakSentences, stopSpeech, unlockSpeech } from "@/components/training/speechPlayer";
import { startBargeInWatch } from "@/components/training/bargeIn";
import { MicPrompt } from "@/components/training/MicPrompt";
import { VoiceOrb } from "@/components/training/VoiceOrb";
import { CallChrome, LiveCaptions } from "@/components/training/CallChrome";
import { disableStream, primeLineAudio, stopStream } from "@/components/training/micPermission";
import { useLiveCall, type LiveEndCall } from "@/components/training/liveCall";
import { prefetchLiveSecret } from "@/components/training/liveToken";
import { applyHardPlaybackCut, LIVE_DEDUPE_WINDOW_MS, liveGreetingLine, sameLiveText } from "@/lib/live-text";
import { callStatusLine, orbButtonLabel } from "@/lib/live-status";
import { liveStage } from "@/lib/live-stage";
import type { SessionDTO } from "@/lib/session-types";
import { cn } from "@/lib/utils";

type Posted = { speaker: string; text: string; at: number };
const postedLive = new Map<string, Posted[]>();
/** Laufende Transkript-POSTs — das Auflegen der Figur wartet darauf, damit ihr Schlusssatz nicht verloren geht. */
const inflightLive = new Map<string, Set<Promise<void>>>();

function trackInflight(sessionId: string, task: Promise<void>) {
  const set = inflightLive.get(sessionId) ?? new Set<Promise<void>>();
  set.add(task);
  inflightLive.set(sessionId, set);
  void task.finally(() => set.delete(task));
  return task;
}

async function settleInflight(sessionId: string) {
  const set = inflightLive.get(sessionId);
  if (set?.size) await Promise.allSettled([...set]);
}

/** Sicherheitsnetz: nur wortgleicher Text innerhalb weniger Sekunden — „Ja.“ zweimal bleibt erlaubt. */
function alreadyPosted(sessionId: string, speaker: string, text: string) {
  const now = Date.now();
  const list = (postedLive.get(sessionId) ?? []).filter((item) => now - item.at < LIVE_DEDUPE_WINDOW_MS);
  if (list.some((item) => item.speaker === speaker && sameLiveText(item.text, text))) {
    postedLive.set(sessionId, list);
    return true;
  }
  list.push({ speaker, text, at: now });
  postedLive.set(sessionId, list);
  return false;
}

/** Was die Turns-Route bei Trainee-Zügen zusätzlich liefert: frische Instructions für die Leitung. */
type LivePatch = { instructions: string | null; hangup: { reason: string; closingLine: string } | null };

async function persistLiveTurn(
  sessionId: string,
  speaker: "trainee" | "counterpart",
  text: string,
  setSession: (value: SessionDTO | ((current: SessionDTO | null) => SessionDTO | null)) => void,
  hooks: { rememberCounterpart?: (id: string) => void; onLivePatch?: (patch: LivePatch) => void } = {},
) {
  if (alreadyPosted(sessionId, speaker, text)) return;
  try {
    const res = await fetch(`/api/sessions/${sessionId}/live/turns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speaker, text }),
    });
    const data = (await res.json()) as SessionDTO & { error?: string; live?: LivePatch };
    if (!res.ok) return;
    const { live, ...session } = data;
    if (speaker === "counterpart") {
      const last = [...session.turns].reverse().find((turn) => turn.speaker === "counterpart");
      if (last) hooks.rememberCounterpart?.(last.id);
    }
    setSession(session);
    if (live) hooks.onLivePatch?.(live);
  } catch {
    /* Transcript darf die Live-Leitung nicht kappen */
  }
}

/** Auflege-Beat vor der Auswertung — lokal, Evaluator läuft schon hinter /end. */
const HANGUP_BEAT_MS = 1200;
/** Sichtbarer Statuspuls nach Barge-in — etwas länger als Hangup-Beat. Pipeline/Tipp, nicht Live. */
const INTERRUPT_FLASH_MS = 1800;

export function ConversationView({
  sessionId,
  whisperReady = false,
  liveVoice = false,
}: {
  sessionId: string;
  whisperReady?: boolean;
  liveVoice?: boolean;
}) {
  const router = useRouter();
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [hearCounterpart, setHearCounterpart] = useState(true);
  const [liveLine, setLiveLine] = useState(true);
  const [armKey, setArmKey] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  const lastSpoken = useRef<string | null>(null);
  const lastArmed = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const liveLineRef = useRef(liveLine);
  const busyRef = useRef(busy);
  const ttsPlaying = useRef(false);
  const interruptRef = useRef(false);
  const bargeStop = useRef<(() => void) | null>(null);
  const [phase, setPhase] = useState<"idle" | "speaking" | "listening" | "thinking">("idle");
  const [interruptFlash, setInterruptFlash] = useState(false);
  const interruptFlashTimer = useRef<number | null>(null);
  const [hangupBeat, setHangupBeat] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [typedOnly, setTypedOnly] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const dictationRef = useRef<DictationMicHandle>(null);
  const endCallRef = useRef<(info?: LiveEndCall) => void>(() => undefined);
  const livePostsOpenRef = useRef(true);
  const typedOnlyRef = useRef(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  liveLineRef.current = liveLine;
  busyRef.current = busy;
  micStreamRef.current = micStream;
  typedOnlyRef.current = typedOnly;
  const micReady = Boolean(micStream);
  const liveEnabled = Boolean(
    liveVoice && liveLine && micStream && audioEl && !typedOnly && session?.status === "active",
  );
  const live = useLiveCall({
    sessionId,
    stream: micStream,
    audioEl,
    enabled: liveEnabled,
    muted: !hearCounterpart || Boolean(hangupBeat),
    holdPlayback: Boolean(hangupBeat),
    greeting: session ? liveGreetingLine(session.opening, session.turns) : null,
    onUserText: (text) => {
      if (!livePostsOpenRef.current) return;
      return trackInflight(sessionId, persistLiveTurn(sessionId, "trainee", text, setSession, { onLivePatch: applyLivePatch }));
    },
    onCounterpartText: (text) => {
      if (!livePostsOpenRef.current) return;
      void trackInflight(
        sessionId,
        persistLiveTurn(sessionId, "counterpart", text, setSession, {
          rememberCounterpart: (id) => {
            lastSpoken.current = id;
          },
        }),
      );
    },
    onEndCall: (info) => endCallRef.current(info),
    onPhase: (next) => {
      if ((next as string) === "interrupted") {
        if (!(liveVoice && !typedOnlyRef.current)) noteInterrupt();
        setPhase("listening");
        return;
      }
      setPhase(next);
    },
    onError: (message) => {
      setError(message);
      stopStream(micStreamRef.current);
      micStreamRef.current = null;
      setMicStream(null);
    },
  });
  const liveOnly = liveVoice && !typedOnly && live.status !== "failed";

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/${sessionId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sitzung nicht gefunden");
        if (!cancelled) setSession(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [sessionId]);

  useEffect(() => {
    if (!liveVoice || !sessionId) return;
    void prefetchLiveSecret(sessionId).catch(() => undefined);
  }, [liveVoice, sessionId]);

  useEffect(() => {
    if (live.status === "live") live.play();
  }, [live.status]);

  function noteInterrupt() {
    interruptRef.current = true;
    setInterruptFlash(true);
    if (interruptFlashTimer.current) window.clearTimeout(interruptFlashTimer.current);
    interruptFlashTimer.current = window.setTimeout(() => setInterruptFlash(false), INTERRUPT_FLASH_MS);
  }

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.turns.length]);

  useEffect(() => {
    if (live.status !== "live" || !session) return;
    const last = [...session.turns].reverse().find((turn) => turn.speaker === "counterpart");
    if (last) lastSpoken.current = last.id;
    if (liveLineRef.current) setPhase("listening");
  }, [live.status, session?.id]);

  useEffect(() => {
    if (!session || session.status !== "active") return;
    if (!micStream && !typedOnly) return;
    if (liveOnly) return;
    const last = [...session.turns].reverse().find((turn) => turn.speaker === "counterpart");
    if (!last || last.id === lastSpoken.current) return;
    lastSpoken.current = last.id;
    if (!hearCounterpart) {
      if (liveLineRef.current && micStreamRef.current && !busyRef.current && lastArmed.current !== last.id) {
        lastArmed.current = last.id;
        setPhase("listening");
        setArmKey((key) => key + 1);
      }
      return;
    }
    let cancelled = false;
    let bargedIn = false;
    void (async () => {
      try {
        await unlockSpeech();
        ttsPlaying.current = true;
        setPhase("speaking");
        if (liveLineRef.current && micStreamRef.current) {
          bargeStop.current?.();
          bargeStop.current = startBargeInWatch(() => {
            bargedIn = true;
            noteInterrupt();
            stopSpeech();
          }, micStreamRef.current);
        }
        await speakSentences(last.text, session.voiceId, session.voiceMood, session.voiceDelivery);
      } catch {
        /* User kann über Hören-Button nachziehen */
      } finally {
        ttsPlaying.current = false;
        bargeStop.current?.();
        bargeStop.current = null;
      }
      if (cancelled) return;
      if (!liveLineRef.current || !micStreamRef.current || busyRef.current) {
        setPhase("idle");
        return;
      }
      lastArmed.current = last.id;
      setPhase("listening");
      setArmKey((key) => key + 1);
      if (bargedIn) noteInterrupt();
    })();
    return () => {
      cancelled = true;
      bargeStop.current?.();
      bargeStop.current = null;
    };
  }, [session, hearCounterpart, micStream, typedOnly, liveOnly]);

  // Freigabe kam erst nach dem Satz der Gegenseite: Leitung nachträglich öffnen
  useEffect(() => {
    if (liveOnly) return;
    if (!micReady || !session || session.status !== "active") return;
    if (!liveLineRef.current || busyRef.current || ttsPlaying.current) return;
    const last = [...session.turns].reverse().find((turn) => turn.speaker !== "system");
    if (!last || last.speaker !== "counterpart" || lastArmed.current === last.id) return;
    lastArmed.current = last.id;
    setPhase("listening");
    setArmKey((key) => key + 1);
  }, [micReady, session, liveOnly]);

  useEffect(() => {
    if (liveVoice) return;
    if (!session?.opening || !session.voiceId) return;
    void prefetchSpeech(session.opening, session.voiceId, session.voiceMood, session.voiceDelivery).catch(() => undefined);
  }, [liveVoice, session?.id, session?.opening, session?.voiceId, session?.voiceMood, session?.voiceDelivery]);

  useEffect(() => {
    const killMic = () => {
      stopStream(micStreamRef.current);
      micStreamRef.current = null;
      setMicStream(null);
    };
    const onPageHide = () => killMic();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      stopSpeech();
      killMic();
    };
  }, []);

  useEffect(() => {
    if (!typedOnly) return;
    stopStream(micStreamRef.current);
    micStreamRef.current = null;
    if (micStream) setMicStream(null);
  }, [typedOnly, micStream]);

  useEffect(() => {
    if (session?.status !== "ended") return;
    livePostsOpenRef.current = false;
    stopStream(micStreamRef.current);
    micStreamRef.current = null;
    if (micStream) setMicStream(null);
  }, [session?.status, micStream]);

  useEffect(() => {
    if (session?.status !== "ended") return;
    const t = window.setTimeout(() => {
      router.push(`/sitzung/${sessionId}/auswertung`);
    }, HANGUP_BEAT_MS);
    return () => window.clearTimeout(t);
  }, [session?.status, router, sessionId]);

  useEffect(() => {
    return () => {
      if (interruptFlashTimer.current) window.clearTimeout(interruptFlashTimer.current);
    };
  }, []);

  function cancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }

  async function send(text = draft, acoustic?: AcousticHint) {
    if (!text.trim() || busy) return;
    const spoken = text.trim();
    if (/^ich höre[.…]*$/i.test(spoken)) return;
    if (liveOnly) {
      if (live.status !== "live") return;
      setDraft("");
      setError(null);
      if (!live.sendText(spoken)) {
        setError("Live-Leitung nimmt den Satz noch nicht an.");
        setDraft(spoken);
        return;
      }
      void trackInflight(sessionId, persistLiveTurn(sessionId, "trainee", spoken, setSession, { onLivePatch: applyLivePatch }));
      return;
    }
    const interrupted = interruptRef.current || ttsPlaying.current;
    interruptRef.current = false;
    ttsPlaying.current = false;
    await unlockSpeech();
    stopSpeech();
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const pendingId = `pending-${Date.now()}`;
    setSession((current) =>
      current
        ? { ...current, turns: [...current.turns, { id: pendingId, speaker: "trainee", text: spoken }] }
        : current,
    );
    setDraft("");
    setBusy(true);
    setPhase("thinking");
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spoken, interrupted, acoustic: acoustic ?? undefined }),
        signal: ac.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Beitrag nicht übernommen");
      setSession(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setSession((current) =>
        current ? { ...current, turns: current.turns.filter((turn) => turn.id !== pendingId) } : current,
      );
      setDraft(spoken);
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }

  /** Ohne `info` legt der Trainee auf; mit `info` hat die Figur per end_call aufgelegt. */
  async function endCall(info?: LiveEndCall) {
    stopSpeech();
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    disableStream(micStreamRef.current);
    if (!info) {
      livePostsOpenRef.current = false;
      if (audioEl) applyHardPlaybackCut(audioEl);
    }
    setBusy(true);
    setHangupBeat(
      info ? `${session?.counterpartName ?? "Die Gegenseite"} hat aufgelegt.` : "Sie haben aufgelegt.",
    );
    try {
      // Die Figur hat aufgelegt: erst die noch laufenden Transkript-Züge landen lassen.
      if (info) await settleInflight(sessionId);
      livePostsOpenRef.current = false;
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        signal: ac.signal,
        ...(info
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ by: "counterpart", reason: info.reason, last_line: info.lastLine }),
            }
          : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auflegen fehlgeschlagen");
      setSession(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setHangupBeat(null);
        setBusy(false);
        return;
      }
      micStreamRef.current?.getTracks().forEach((track) => {
        track.enabled = true;
      });
      livePostsOpenRef.current = true;
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
      setHangupBeat(null);
    }
  }

  endCallRef.current = (info) => {
    void endCall(info);
  };

  /** Frische Instructions aus der Turns-Route an die Leitung — greift für die nächste Antwort. */
  function applyLivePatch(patch: LivePatch) {
    if (!patch.instructions) return;
    live.updateInstructions(patch.instructions, patch.hangup);
  }

  if (error && !session) {
    return (
      <div className="glass-card mx-auto max-w-lg rounded-3xl border p-8 text-center">
        <h1 className="font-heading text-2xl">Sitzung nicht gefunden</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        <Link href="/" className="text-primary mt-4 inline-block text-sm underline">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="bg-secondary h-8 w-48 rounded-full" />
        <div className="glass-card h-72 rounded-3xl border" />
        <p className="text-muted-foreground text-sm">Leitung wird aufgebaut…</p>
      </div>
    );
  }

  const statusLine = callStatusLine({
    session,
    liveStatus: live.status,
    phase,
    liveLine,
    liveOnly,
    liveVoice,
    typedOnly,
    interruptFlash,
    hangupBeat,
  });
  const phoneStage = liveStage({ liveOnly, typedOnly }) === "phone";
  const micPrompt =
    session.status === "active" && !micStream && !typedOnly && !hangupBeat ? (
      <MicPrompt
        onPrime={() => {
          primeLineAudio();
          void unlockSpeech();
          void audioEl?.play().catch(() => undefined);
        }}
        onGranted={(stream) => {
          setTypedOnly(false);
          setMicStream(stream);
          lastArmed.current = null;
          lastSpoken.current = null;
          void unlockSpeech();
          void audioEl?.play().catch(() => undefined);
          live.play();
        }}
        onSkip={() => {
          stopStream(micStreamRef.current);
          micStreamRef.current = null;
          setMicStream(null);
          setTypedOnly(true);
        }}
      />
    ) : null;

  return (
    <>
      <audio
        ref={setAudioEl}
        autoPlay
        playsInline
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      />
      {phoneStage ? (
        <CallChrome
          counterpartName={session.counterpartName}
          statusLine={statusLine}
          ended={session.status === "ended" || Boolean(hangupBeat)}
          hangupDisabled={busy}
          onHangup={() => void endCall()}
          hearOn={hearCounterpart}
          onToggleHear={() => {
            if (hearCounterpart) {
              stopSpeech();
              setHearCounterpart(false);
              return;
            }
            lastSpoken.current = null;
            void unlockSpeech().then(() => setHearCounterpart(true));
          }}
          liveLineOn={liveLine}
          onToggleLiveLine={() => {
            setLiveLine((on) => !on);
            void unlockSpeech();
          }}
          audioBlocked={Boolean(live.audioBlocked)}
          onUnlock={() => {
            primeLineAudio();
            live.play();
          }}
          orbPhase={liveLine ? phase : "idle"}
          orbLabel={orbButtonLabel(
            liveLine ? phase : "idle",
            session.counterpartName,
            session.status === "ended" || Boolean(hangupBeat),
            liveVoice && !typedOnly,
          )}
          onOrbClick={() => {
            setLiveLine(true);
            void unlockSpeech();
            primeLineAudio();
          }}
          orbDisabled={busy || session.status !== "active"}
          micStream={micStream}
          error={error}
          micPrompt={micPrompt}
          captions={<LiveCaptions turns={session.turns} counterpartName={session.counterpartName} />}
        />
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-copper text-xs font-semibold tracking-[0.16em] uppercase">
                {session.mode === "repeat"
                  ? "Wiederholung derselben Stelle"
                  : session.mode === "real"
                    ? `Echtes Gespräch, nachgestellt · ${session.counterpartName}`
                    : session.counterpartName}
              </p>
              <h1 className="font-heading mt-1 text-3xl tracking-tight">{session.scenarioTitle}</h1>
              <p className="mt-2 text-sm">
                <span className="text-foreground font-medium">Heute: {session.focusLabel}.</span>{" "}
                <span className="text-muted-foreground">Eine Sache, dann auflegen.</span>
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {live.status === "failed" ? "Live nicht möglich — Aufnahme als Fallback." : <EngineBadge />}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={liveLine ? "secondary" : "outline"}
                onClick={() => {
                  setLiveLine((on) => !on);
                  void unlockSpeech();
                }}
                className="h-10 rounded-2xl px-4"
              >
                {liveLine ? "Leitung an" : "Leitung aus"}
              </Button>
              <Button
                type="button"
                variant={hearCounterpart ? "secondary" : "outline"}
                onClick={() => {
                  if (hearCounterpart) {
                    stopSpeech();
                    setHearCounterpart(false);
                    return;
                  }
                  lastSpoken.current = null;
                  void unlockSpeech().then(() => setHearCounterpart(true));
                }}
                className="h-10 rounded-2xl px-4"
              >
                <Volume2 />
                {hearCounterpart ? "Hören an" : "Hören aus"}
              </Button>
              <Button variant="destructive" onClick={() => void endCall()} disabled={busy} className="h-10 rounded-2xl px-4">
                <PhoneOff />
                Auflegen
              </Button>
            </div>
          </div>

          {micPrompt}

          {session.practiceCue ? (
            <div className="rounded-[1.4rem] border border-primary/30 bg-primary/8 px-4 py-3 text-sm leading-relaxed">
              <p className="text-copper text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
                {session.mode === "real" ? "Die echte Stelle" : "Dieselbe Stelle"}
                {session.practiceCue.gapLabel ? ` · ${session.practiceCue.gapLabel}` : ""}
              </p>
              {session.practiceCue.quote ? (
                <p className="text-muted-foreground mt-2 text-xs italic">„{session.practiceCue.quote}“</p>
              ) : null}
              <p className="mt-1">{session.practiceCue.nextStep}</p>
            </div>
          ) : null}

          <div className="glass-card flex max-h-[min(64vh,580px)] flex-col overflow-hidden rounded-[1.7rem] border">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
              {session.turns.length === 0 ? (
                <p className="text-muted-foreground text-sm">Noch kein Wort. Die Gegenseite spricht zuerst.</p>
              ) : (
                session.turns.map((turn, index) => {
                  const lastCounterpart =
                    turn.speaker === "counterpart" &&
                    !session.turns.slice(index + 1).some((later) => later.speaker !== "system");
                  return (
                    <div
                      key={turn.id}
                      className={cn("flex", turn.speaker === "trainee" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                          turn.speaker === "trainee" && "bg-primary text-primary-foreground rounded-br-md",
                          turn.speaker === "counterpart" && "bg-secondary text-secondary-foreground rounded-bl-md",
                          turn.speaker === "system" && "bg-muted text-muted-foreground mx-auto text-center text-xs",
                          lastCounterpart && (session.mode === "repeat" || session.mode === "real") && "ring-1 ring-primary/35",
                        )}
                      >
                        {turn.speaker !== "system" ? (
                          <p className="mb-1 text-[0.65rem] font-semibold tracking-wider uppercase opacity-70">
                            {turn.speaker === "trainee" ? "Sie" : session.counterpartName}
                          </p>
                        ) : null}
                        <span className="block">{turn.text}</span>
                        {turn.speaker === "counterpart" ? (
                          <SpeakButton
                            text={turn.text}
                            voiceId={session.voiceId}
                            mood={session.voiceMood}
                            delivery={session.voiceDelivery}
                            label="Hören"
                            variant="outline"
                            className="mt-2 h-7 px-2 text-xs"
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
              {busy && session.status === "active" && !hangupBeat ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">Gegenseite überlegt…</p>
                  <Button type="button" variant="ghost" size="sm" onClick={cancel} className="h-8 rounded-xl">
                    <Square className="size-3" />
                    Abbrechen
                  </Button>
                </div>
              ) : null}
              <div ref={bottom} />
            </div>
            <form
              className="border-t border-border/70 bg-[color-mix(in_oklch,var(--card)_88%,white)] p-3 md:p-4"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  session.practiceCue
                    ? "Ihr Satz an dieser Stelle — selbst formulieren."
                    : "Eine Frage zur Lage — kein Produktpitch."
                }
                disabled={busy || session.status !== "active"}
                className="min-h-24 resize-none rounded-2xl border-border/80 bg-background/80"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3 text-xs">
                  <button
                    type="button"
                    aria-label={orbButtonLabel(
                      liveLine ? phase : "idle",
                      session.counterpartName,
                      session.status === "ended" || Boolean(hangupBeat),
                      liveVoice && !typedOnly,
                    )}
                    title="Antippen: Mikrofon jetzt öffnen"
                    disabled={busy || session.status !== "active"}
                    onClick={() => {
                      setLiveLine(true);
                      void unlockSpeech();
                      primeLineAudio();
                      dictationRef.current?.startNow();
                    }}
                    className="rounded-2xl px-2 py-1 transition hover:bg-secondary/60 disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <VoiceOrb phase={liveLine ? phase : "idle"} stream={micStream} />
                  </button>
                  <p aria-live="polite" className={cn("max-w-[16rem] leading-snug", liveLine ? "font-medium" : "text-muted-foreground")}>
                    {statusLine}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DictationMic
                    ref={dictationRef}
                    label="Sprechen"
                    disabled={session.status !== "active" || busy}
                    paused={phase === "speaking" || busy}
                    armKey={armKey}
                    whisperReady={whisperReady}
                    stream={micStream}
                    onRecordingStart={() => {
                      if (interruptRef.current || ttsPlaying.current) noteInterrupt();
                      bargeStop.current?.();
                      bargeStop.current = null;
                      stopSpeech();
                      ttsPlaying.current = false;
                      setPhase("listening");
                      void unlockSpeech();
                    }}
                    onRecordingStop={() => {
                      if (busyRef.current) return;
                      if (liveLineRef.current && micStreamRef.current) setPhase("listening");
                      else setPhase("idle");
                    }}
                    onPartial={(text) => {
                      if (!text.trim() || /^ich höre/i.test(text)) return;
                      setDraft(text);
                    }}
                    onTranscript={(spoken, acoustic) => void send(spoken, acoustic)}
                  />
                  {busy && !hangupBeat ? (
                    <Button type="button" variant="secondary" onClick={cancel} className="h-11 rounded-2xl px-5">
                      <Square />
                      Abbrechen
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!draft.trim() || live.status === "connecting" || Boolean(hangupBeat) || session.status !== "active"}
                      className="h-11 rounded-2xl px-5"
                    >
                      <Send />
                      Sagen
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
      )}
    </>
  );
}
