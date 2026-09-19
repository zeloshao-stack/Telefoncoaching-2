"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lineAudioContext, primeLineAudio } from "@/components/training/micPermission";
import { cn } from "@/lib/utils";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function speechRecognitionCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Aufnahme nicht lesbar"));
    reader.readAsDataURL(blob);
  });
}

function recorderMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function makeRecorder(stream: MediaStream, mime: string) {
  try {
    return mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch {
    return new MediaRecorder(stream);
  }
}

function haltRecorder(rec: MediaRecorder) {
  if (rec.state === "inactive") return;
  try {
    rec.requestData();
  } catch {
    /* Safari kennt requestData oft nicht */
  }
  rec.stop();
}

function micError(err: unknown) {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Mikrofonzugriff verweigert. Bitte erlauben oder die Lage tippen.";
  }
  if (name === "NotFoundError") return "Kein Mikrofon gefunden. Bitte die Lage tippen.";
  if (name === "NotReadableError") return "Mikrofon ist belegt. Bitte die Lage tippen.";
  if (typeof err === "object" && err && "error" in err) {
    const code = String((err as { error: string }).error);
    if (code === "not-allowed") return "Mikrofonzugriff verweigert. Bitte erlauben oder die Lage tippen.";
    if (code === "no-speech") return "Nichts gehört. Bitte noch einmal sprechen oder tippen.";
    if (code === "audio-capture") return "Kein Mikrofon gefunden. Bitte die Lage tippen.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Aufnahme nicht möglich. Bitte die Lage tippen.";
}

export type AcousticHint = {
  durationMs: number;
  meanEnergy: number;
  peakEnergy: number;
  voicedMs: number;
};

export type DictationMicHandle = {
  /** Im selben Klick wie die Freigabe aufrufen — Chrome startet Spracherkennung sonst still ohne Ton. */
  startNow: () => void;
};

export const DictationMic = forwardRef<
  DictationMicHandle,
  {
    onTranscript: (text: string, acoustic?: AcousticHint) => void;
    onPartial?: (text: string) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
    compact?: boolean;
    disabled?: boolean;
    label?: string;
    className?: string;
    armKey?: number;
    whisperReady?: boolean;
    stream?: MediaStream | null;
    paused?: boolean;
  }
>(function DictationMic(
  {
    onTranscript,
    onPartial,
    onRecordingStart,
    onRecordingStop,
    compact = false,
    disabled = false,
    label = "Sprechen",
    className,
    armKey = 0,
    whisperReady = false,
    stream: sharedStream = null,
    paused = false,
  },
  ref,
) {
  const [phase, setPhase] = useState<"idle" | "recording" | "transcribing">("idle");
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const live = useRef<SpeechRec | null>(null);
  const liveFinal = useRef("");
  const liveInterim = useRef("");
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const silence = useRef<number | null>(null);
  const quietEmpty = useRef(false);
  const armed = useRef(0);
  const phaseRef = useRef(phase);
  const onTranscriptRef = useRef(onTranscript);
  const onPartialRef = useRef(onPartial);
  const onStartRef = useRef(onRecordingStart);
  const onStopRef = useRef(onRecordingStop);
  const sharedRef = useRef(sharedStream);
  const whisperRef = useRef(whisperReady);
  const listenHold = useRef(false);
  const extraRecorders = useRef<MediaRecorder[]>([]);
  const liveStarted = useRef(0);
  const pausedRef = useRef(paused);
  phaseRef.current = phase;
  onTranscriptRef.current = onTranscript;
  onPartialRef.current = onPartial;
  onStartRef.current = onRecordingStart;
  onStopRef.current = onRecordingStop;
  sharedRef.current = sharedStream;
  whisperRef.current = whisperReady;
  pausedRef.current = paused;

  function clearSilence() {
    if (silence.current) {
      window.clearTimeout(silence.current);
      silence.current = null;
    }
  }

  function release() {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    clearSilence();
    if (streamRef.current && streamRef.current !== sharedRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
  }

  function heardNow() {
    return `${liveFinal.current} ${liveInterim.current}`.replace(/\s+/g, " ").trim();
  }

  function commitLive() {
    clearSilence();
    const spoken = heardNow();
    const rec = live.current;
    live.current = null;
    listenHold.current = false;
    try {
      rec?.stop();
    } catch {
      /* schon zu */
    }
    setPhase("idle");
    if (!spoken) {
      if (!quietEmpty.current) setError("Nichts gehört. Bitte noch einmal sprechen oder tippen.");
      onStopRef.current?.();
      return;
    }
    setError(null);
    onTranscriptRef.current(spoken, {
      durationMs: Math.max(80, performance.now() - (liveStarted.current || performance.now() - 800)),
      meanEnergy: 0.12,
      peakEnergy: 0.12,
      voicedMs: Math.max(80, performance.now() - (liveStarted.current || performance.now() - 800)),
    });
  }

  function bumpSilence() {
    clearSilence();
    if (!heardNow()) return;
    silence.current = window.setTimeout(() => {
      if (live.current) commitLive();
    }, 750);
  }

  useEffect(() => {
    return () => {
      live.current?.abort();
      recorder.current?.stop();
      release();
    };
  }, []);

  async function transcribeBlob(blob: Blob, acoustic?: AcousticHint) {
    setPhase("transcribing");
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/stimme/diktat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mime: blob.type || "audio/webm" }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Transkription fehlgeschlagen");
      const spoken = (data.text || "").trim();
      if (!spoken) throw new Error("Kein Transkript. Bitte noch einmal sprechen oder die Lage tippen.");
      listenHold.current = false;
      onTranscriptRef.current(spoken, acoustic);
      setError(null);
    } catch (e) {
      onPartialRef.current?.("");
      setError(micError(e));
      onStopRef.current?.();
      const keep = listenHold.current;
      if (keep) {
        window.setTimeout(() => {
          if (listenHold.current && phaseRef.current === "idle") void start(true);
        }, 450);
      }
    } finally {
      setPhase("idle");
    }
  }

  function startLive(Ctor: new () => SpeechRec) {
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.interimResults = true;
    rec.continuous = true;
    liveFinal.current = "";
    liveInterim.current = "";
    liveStarted.current = performance.now();
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) liveFinal.current = `${liveFinal.current} ${piece}`.trim();
        else interim += piece;
      }
      liveInterim.current = interim;
      const spoken = heardNow();
      onPartialRef.current?.(spoken);
      bumpSilence();
      const words = spoken.split(/\s+/).filter(Boolean);
      if (words.length >= 3 && /[.!?…]$/.test(spoken)) commitLive();
    };
    rec.onerror = (event) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") return;
      if (event.error === "network" && whisperRef.current) {
        live.current = null;
        void startVad();
        return;
      }
      live.current = null;
      listenHold.current = false;
      setPhase("idle");
      setError(micError(event));
      onStopRef.current?.();
    };
    rec.onend = () => {
      if (live.current !== rec) return;
      if (heardNow()) {
        commitLive();
        return;
      }
      if (listenHold.current) {
        try {
          rec.start();
        } catch {
          live.current = null;
          window.setTimeout(() => {
            if (listenHold.current && phaseRef.current !== "transcribing") void start(true);
          }, 200);
        }
      }
    };
    rec.start();
    live.current = rec;
    setPhase("recording");
    timer.current = window.setTimeout(() => {
      if (live.current === rec && heardNow()) commitLive();
      else if (live.current === rec) rec.stop();
    }, 60_000);
  }

  async function startFile() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Dieses Gerät nimmt nicht auf. Bitte die Lage tippen.");
    }
    if (typeof MediaRecorder === "undefined") {
      throw new Error("Aufnahme wird hier nicht unterstützt. Bitte die Lage tippen.");
    }
    const stream = sharedRef.current ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
    streamRef.current = stream;
    chunks.current = [];
    const mime = recorderMime();
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    rec.onstop = () => {
      recorder.current = null;
      const blob = new Blob(chunks.current, { type: rec.mimeType || chunks.current[0]?.type || "audio/webm" });
      release();
      if (blob.size < 400) {
        if (!quietEmpty.current) setError("Aufnahme zu kurz. Bitte noch einmal sprechen oder die Lage tippen.");
        setPhase("idle");
        return;
      }
      void transcribeBlob(blob);
    };
    recorder.current = rec;
    rec.start();
    setPhase("recording");
    timer.current = window.setTimeout(() => {
      if (recorder.current === rec && rec.state === "recording") rec.stop();
    }, 60_000);
  }

  /**
   * Dieselbe Leitung wie die Welle: Web-Audio hört den Pegel, MediaRecorder nimmt denselben Tap auf.
   * Rohspur-Recorder war oft leer, während die Welle schon ausschlug — deshalb nicht mehr die Mic-Tracks direkt.
   */
  async function startVad() {
    if (typeof MediaRecorder === "undefined") {
      throw new Error("Aufnahme wird hier nicht unterstützt. Bitte die Lage tippen.");
    }
    let stream = sharedRef.current;
    if (!stream) {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Dieses Gerät nimmt nicht auf. Bitte die Lage tippen.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    }
    const recStream = stream;
    streamRef.current = recStream;
    chunks.current = [];
    primeLineAudio();
    const sharedCtx = lineAudioContext();
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const ctx = sharedCtx && sharedCtx.state !== "closed" ? sharedCtx : Ctx ? new Ctx() : null;
    if (ctx?.state === "suspended") await ctx.resume().catch(() => undefined);

    let source: MediaStreamAudioSourceNode | null = null;
    const analyser = ctx ? ctx.createAnalyser() : null;
    if (ctx && analyser) {
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source = ctx.createMediaStreamSource(recStream);
      source.connect(analyser);
    }

    const mime = recorderMime();
    const rec = makeRecorder(recStream, mime);
    const freq = new Uint8Array(analyser?.frequencyBinCount ?? 128);
    let poll = 0;
    let spoke = false;
    let lastLoud = 0;
    const started = performance.now();
    const fromArm = quietEmpty.current;
    let energySum = 0;
    let energyCount = 0;
    let energyPeak = 0;
    let voicedMs = 0;
    let lastTick = started;
    let finishing = false;

    const cleanupAudio = () => {
      window.clearInterval(poll);
      try {
        source?.disconnect();
      } catch {
        /* schon weg */
      }
      if (ctx && ctx !== lineAudioContext()) void ctx.close().catch(() => undefined);
    };

    const finish = (heard: boolean) => {
      if (finishing) return;
      finishing = true;
      window.setTimeout(() => {
        recorder.current = null;
        extraRecorders.current = [];
        cleanupAudio();
        const blob = new Blob(chunks.current, { type: rec.mimeType || chunks.current[0]?.type || "audio/webm" });
        release();
        const enough = heard ? blob.size >= 800 : blob.size >= 2500;
        if (!enough) {
          if (!fromArm && heard) setError("Stimme gehört, Aufnahme leer. Noch einmal auf Sprechen tippen.");
          else if (!fromArm) setError("Nichts gehört. Noch einmal auf Sprechen tippen oder die Lage tippen.");
          setPhase("idle");
          if (listenHold.current && fromArm) {
            window.setTimeout(() => {
              if (listenHold.current && phaseRef.current === "idle") void start(true);
            }, 280);
            return;
          }
          onStopRef.current?.();
          return;
        }
        const durationMs = Math.max(80, performance.now() - started);
        void transcribeBlob(blob, {
          durationMs,
          meanEnergy: energyCount ? energySum / energyCount : 0,
          peakEnergy: energyPeak,
          voicedMs: Math.min(durationMs, voicedMs),
        });
      }, 80);
    };

    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    rec.onstop = () => finish(spoke);
    extraRecorders.current = [];
    recorder.current = rec;
    rec.start(100);
    setPhase("recording");

    const halt = () => haltRecorder(rec);

    const tick = () => {
      if (recorder.current !== rec || rec.state !== "recording") {
        window.clearInterval(poll);
        return;
      }
      const now = performance.now();
      const dt = now - lastTick;
      lastTick = now;
      if (!analyser) {
        if (now - started > 4_000) halt();
        return;
      }
      analyser.getByteFrequencyData(freq);
      let sum = 0;
      for (let i = 0; i < freq.length; i += 1) sum += freq[i];
      const energy = sum / freq.length / 255;
      energySum += energy;
      energyCount += 1;
      if (energy > energyPeak) energyPeak = energy;
      if (energy > 0.055) {
        voicedMs += dt;
        lastLoud = now;
        if (!spoke && voicedMs >= 280) spoke = true;
      } else if (spoke && now - lastLoud > 1_050) {
        halt();
      } else if (spoke && voicedMs >= 12_000) {
        halt();
      } else if (!spoke && now - started > 20_000) {
        halt();
      }
    };
    poll = window.setInterval(tick, 50);
    timer.current = window.setTimeout(() => {
      if (recorder.current === rec && rec.state === "recording") halt();
    }, 60_000);
  }

  async function start(fromArm = false) {
    if (disabled) return;
    if (fromArm && (pausedRef.current || live.current || recorder.current || phaseRef.current !== "idle")) return;

    if (!fromArm) {
      listenHold.current = false;
      try {
        live.current?.abort();
      } catch {
        /* schon zu */
      }
      live.current = null;
      if (recorder.current) haltRecorder(recorder.current);
      extraRecorders.current.forEach(haltRecorder);
      extraRecorders.current = [];
      recorder.current = null;
      release();
    }

    quietEmpty.current = fromArm;
    listenHold.current = true;
    setError(null);
    onStartRef.current?.();
    const Ctor = speechRecognitionCtor();
    // Klick = Geste: Live-Erkennung zuerst. Die offene Leitung darf den Knopf nicht auf Whisper blockieren.
    if (!fromArm && Ctor) {
      try {
        startLive(Ctor);
        return;
      } catch {
        live.current = null;
      }
    }
    if (sharedRef.current || whisperRef.current) {
      try {
        await startVad();
        return;
      } catch {
        release();
        recorder.current = null;
      }
    }
    if (Ctor) {
      try {
        startLive(Ctor);
        return;
      } catch {
        live.current = null;
      }
    }
    try {
      await startFile();
    } catch (e) {
      release();
      listenHold.current = false;
      setError(micError(e));
      setPhase("idle");
      onStopRef.current?.();
    }
  }

  useEffect(() => {
    if (!armKey || armKey === armed.current || disabled) return;
    armed.current = armKey;
    void start(true);
  }, [armKey, disabled]);

  useImperativeHandle(ref, () => ({
    startNow: () => {
      primeLineAudio();
      void start(false);
    },
  }));

  useEffect(() => {
    if (paused) stop();
  }, [paused]);

  function stop() {
    listenHold.current = false;
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    clearSilence();
    if (live.current) {
      live.current.stop();
      return;
    }
    if (recorder.current) haltRecorder(recorder.current);
    extraRecorders.current.forEach(haltRecorder);
    extraRecorders.current = [];
  }

  function toggle() {
    if (disabled) return;
    if (phase === "recording" || phase === "transcribing") {
      stop();
      setPhase("idle");
      return;
    }
    primeLineAudio();
    void start(false);
  }

  const caption = phase === "recording" ? "Stopp" : phase === "transcribing" ? "Verstehe…" : "Sprechen";

  return (
    <span className={cn("inline-flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant={phase === "recording" ? "destructive" : "secondary"}
        size={compact ? "icon-sm" : "sm"}
        className={cn("rounded-xl", compact ? "" : "h-11 rounded-2xl px-4")}
        onClick={toggle}
        disabled={disabled}
        aria-pressed={phase === "recording"}
        aria-label={phase === "recording" ? "Aufnahme stoppen" : "Sprechen"}
      >
        {phase === "transcribing" ? <Loader2 className="animate-spin" /> : null}
        {phase === "recording" ? <Square /> : null}
        {phase === "idle" ? <Mic /> : null}
        {compact ? null : caption}
      </Button>
      {error ? (
        <span role="status" className="text-destructive max-w-[16rem] text-right text-[0.65rem] leading-snug">
          {error}
        </span>
      ) : null}
    </span>
  );
});
DictationMic.displayName = "DictationMic";
