"use client";

import { useEffect, useRef } from "react";
import { lineAudioContext, primeLineAudio } from "@/components/training/micPermission";
import { cn } from "@/lib/utils";

export type OrbPhase = "idle" | "listening" | "thinking" | "speaking";

const BARS = 7;

/**
 * Sichtbarer Gesprächszustand wie bei Siri: beim Hören schlagen die Balken mit Ihrer Stimme aus
 * (echter Pegel vom Mikrofon), beim Sprechen der Figur wogen sie, beim Überlegen atmen sie.
 */
export function VoiceOrb({
  phase,
  className,
  size = "md",
  stream: shared,
}: {
  phase: OrbPhase;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Bereits offene Leitung — kein zweites getUserMedia, sonst stiehlt die Welle der Erkennung den Ton. */
  stream?: MediaStream | null;
}) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const raf = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  useEffect(() => {
    let analyser: AnalyserNode | null = null;
    let data: Uint8Array<ArrayBuffer> | null = null;
    let cancelled = false;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    const started = performance.now();

    const paint = (heights: number[]) => {
      heights.forEach((h, i) => {
        const el = bars.current[i];
        if (el) el.style.transform = `scaleY(${Math.max(0.12, Math.min(1, h)).toFixed(3)})`;
      });
    };

    const tick = () => {
      if (cancelled) return;
      const t = (performance.now() - started) / 1000;
      if (phase === "listening" && analyser && data) {
        analyser.getByteFrequencyData(data);
        const bands = BARS;
        const per = Math.floor(data.length / bands / 2);
        const heights: number[] = [];
        for (let b = 0; b < bands; b += 1) {
          let sum = 0;
          for (let i = b * per; i < (b + 1) * per; i += 1) sum += data[i];
          const avg = sum / per / 255;
          heights.push(0.15 + avg * 1.6);
        }
        // Stärkste Bänder in die Mitte, nach außen leiser — wie eine Stimmwelle
        const mid = (bands - 1) / 2;
        const sorted = [...heights].sort((a, b) => b - a);
        const byDistance = Array.from({ length: bands }, (_, i) => i).sort(
          (a, b) => Math.abs(a - mid) - Math.abs(b - mid),
        );
        const out = new Array<number>(bands).fill(0.2);
        byDistance.forEach((idx, rank) => {
          out[idx] = sorted[rank];
        });
        paint(out);
      } else if (phase === "speaking") {
        paint(Array.from({ length: BARS }, (_, i) => 0.35 + 0.45 * Math.abs(Math.sin(t * 5 + i * 0.9)) * (1 - Math.abs(i - 3) / 5)));
      } else if (phase === "thinking") {
        const breath = 0.25 + 0.15 * (0.5 + 0.5 * Math.sin(t * 2.2));
        paint(Array.from({ length: BARS }, () => breath));
      } else if (phase === "listening") {
        // Mikro noch nicht offen: leichtes Warten
        paint(Array.from({ length: BARS }, (_, i) => 0.2 + 0.1 * Math.sin(t * 3 + i)));
      } else {
        paint(Array.from({ length: BARS }, () => 0.14));
      }
      raf.current = requestAnimationFrame(tick);
    };

    const attach = (media: MediaStream, own: boolean) => {
      stream.current = own ? media : null;
      primeLineAudio();
      const audio = lineAudioContext();
      if (!audio) return;
      if (audio.state === "suspended") void audio.resume();
      ctx.current = audio;
      const source = audio.createMediaStreamSource(media);
      analyser = audio.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      data = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      sourceNode = source;
    };

    const openMic = async () => {
      try {
        if (shared) {
          attach(shared, false);
          return;
        }
        const media = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        attach(media, true);
      } catch {
        /* ohne Pegel läuft die Warteanimation */
      }
    };

    if (phase === "listening" && (shared || (typeof navigator !== "undefined" && navigator.mediaDevices))) {
      void openMic();
    }
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      try {
        sourceNode?.disconnect();
      } catch {
        /* schon weg */
      }
      if (ctx.current && ctx.current !== lineAudioContext()) {
        void ctx.current.close().catch(() => undefined);
      }
      ctx.current = null;
    };
  }, [phase, shared]);

  const dims = size === "lg" ? "h-16 gap-1.5" : size === "sm" ? "h-6 gap-0.5" : "h-10 gap-1";
  const barWidth = size === "lg" ? "w-2.5" : size === "sm" ? "w-1" : "w-1.5";

  return (
    <span
      aria-hidden
      className={cn("inline-flex items-center justify-center", dims, className)}
      data-phase={phase}
    >
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          className={cn(
            "block h-full origin-center rounded-full transition-colors duration-300",
            barWidth,
            phase === "listening" && "bg-emerald-500",
            phase === "speaking" && "bg-primary",
            phase === "thinking" && "bg-amber-500",
            phase === "idle" && "bg-muted-foreground/35",
          )}
          style={{ transform: "scaleY(0.14)" }}
        />
      ))}
    </span>
  );
}
