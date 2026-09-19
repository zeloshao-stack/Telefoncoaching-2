"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mic, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  detectPlatform,
  micHelp,
  platformLabel,
  queryMicState,
  requestMicAccess,
  speechSupport,
  stopStream,
  type MicState,
} from "@/components/training/micPermission";
import { cn } from "@/lib/utils";

/**
 * Freigabe vor dem Gespräch: ein Klick, echte Pegelprobe, und wenn der Browser blockiert,
 * die passenden Schritte für genau diesen Browser und dieses System.
 */
export function MicGate({
  onReady,
  compact = false,
  className,
}: {
  onReady?: (ready: boolean) => void;
  compact?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<MicState | "checking">("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [level, setLevel] = useState(0);
  const [heard, setHeard] = useState(false);
  const [open, setOpen] = useState(false);
  const platform = detectPlatform();
  const support = speechSupport();
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const ctx = useRef<AudioContext | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let cancelled = false;
    void queryMicState().then((s) => {
      if (cancelled) return;
      setState(s);
      onReadyRef.current?.(s === "granted");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      stopStream(stream.current);
      void ctx.current?.close().catch(() => undefined);
    };
  }, []);

  function stopTest() {
    cancelAnimationFrame(raf.current);
    stopStream(stream.current);
    stream.current = null;
    void ctx.current?.close().catch(() => undefined);
    ctx.current = null;
    setTesting(false);
    setLevel(0);
  }

  async function request() {
    setMessage(null);
    setHeard(false);
    const result = await requestMicAccess();
    if (!result.ok) {
      setState(result.state);
      setMessage(result.message);
      onReadyRef.current?.(false);
      return;
    }
    setState("granted");
    onReadyRef.current?.(true);
    // Pegelprobe: ein Wort sagen, der Balken muss ausschlagen
    stream.current = result.stream;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      stopTest();
      return;
    }
    ctx.current = new Ctx();
    const source = ctx.current.createMediaStreamSource(result.stream);
    const analyser = ctx.current.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);
    setTesting(true);
    const started = performance.now();
    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
      const rms = Math.sqrt(sum / buffer.length);
      const pct = Math.min(100, Math.round(rms * 600));
      setLevel(pct);
      if (pct > 18) setHeard(true);
      if (performance.now() - started > 8000) {
        stopTest();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  if (state === "checking") {
    return (
      <div className={cn("text-muted-foreground flex items-center gap-2 text-xs", className)}>
        <Loader2 className="size-3 animate-spin" /> Mikrofon wird geprüft…
      </div>
    );
  }

  const ready = state === "granted";
  const help = ready ? null : micHelp(platform, state);

  if (ready && compact && !testing && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs", className)}
      >
        <CheckCircle2 className="size-3.5 text-emerald-600" />
        Mikrofon bereit · {platformLabel(platform)}
        {support.live ? "" : " · Aufnahme statt Live-Erkennung"}
      </button>
    );
  }

  return (
    <section
      className={cn(
        "rounded-[1.4rem] border px-4 py-3 text-sm leading-relaxed",
        ready ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/8",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
            {ready ? "Mikrofon bereit" : "Vor dem Gespräch: Mikrofon freigeben"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {platformLabel(platform)}
            {support.live ? " · Live-Spracherkennung" : " · keine Live-Erkennung, Aufnahme + Whisper"}
            {support.secure ? "" : " · unsichere Verbindung"}
          </p>
          {!ready && !message ? (
            <p className="mt-2">
              Der Browser fragt einmal nach. Danach hört die Leitung von selbst, sobald die Gegenseite fertig ist.
            </p>
          ) : null}
          {message ? (
            <p className="mt-2 flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>{message}</span>
            </p>
          ) : null}
          {testing ? (
            <div className="mt-3">
              <p className="text-xs">
                {heard ? "Gehört — das Mikrofon liefert." : "Sagen Sie ein Wort. Der Balken muss ausschlagen."}
              </p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-background/80">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-75", heard ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
          ) : null}
          {ready && !testing && heard ? <p className="mt-2 text-xs">Pegelprobe bestanden.</p> : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {testing ? (
            <Button type="button" variant="secondary" size="sm" className="rounded-2xl" onClick={stopTest}>
              Fertig
            </Button>
          ) : (
            <Button type="button" size="sm" className="rounded-2xl" onClick={() => void request()}>
              {ready ? <RefreshCw /> : <Mic />}
              {ready ? "Pegel prüfen" : state === "denied" ? "Nochmal versuchen" : "Mikrofon freigeben"}
            </Button>
          )}
          {ready && open ? (
            <button type="button" className="text-muted-foreground text-xs hover:underline" onClick={() => setOpen(false)}>
              Einklappen
            </button>
          ) : null}
        </div>
      </div>
      {help && (state === "denied" || state === "insecure" || state === "unsupported" || message) ? (
        <div className="mt-3 rounded-2xl bg-background/70 px-3 py-2 text-xs leading-relaxed">
          <p className="font-medium">{help.title}</p>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            {help.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="text-muted-foreground mt-2">Ohne Mikrofon geht es weiter: die Lage einfach tippen.</p>
        </div>
      ) : null}
    </section>
  );
}
