"use client";

import { useState } from "react";
import { Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  detectPlatform,
  micHelp,
  platformLabel,
  queryMicState,
  requestMicAccess,
  speechSupport,
  type MicState,
} from "@/components/training/micPermission";

/**
 * Eigener Dialog zu Beginn jedes Gesprächs: ein Klick öffnet das Mikrofon in diesem Tab.
 * Browser-Freigabe von der Startseite reicht nicht — Chrome startet die Erkennung sonst oft still ohne Ton.
 */
export function MicPrompt({
  onGranted,
  onSkip,
  onPrime,
}: {
  onGranted: (stream: MediaStream) => void;
  onSkip: () => void;
  /** Synchron im Klick, vor await — entsperrt Spracherkennung und AudioContext. */
  onPrime?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<MicState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const platform = detectPlatform();
  const support = speechSupport();
  const help = state ? micHelp(platform, state) : null;

  async function openLine() {
    onPrime?.();
    setBusy(true);
    setMessage(null);
    const result = await requestMicAccess();
    if (!result.ok) {
      setState(result.state);
      setMessage(result.message);
      setBusy(false);
      return;
    }
    const prior = await queryMicState();
    setState(prior);
    onGranted(result.stream);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mic-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
    >
      <div className="glass-card w-full max-w-lg rounded-[1.7rem] border p-6 shadow-2xl">
        <p id="mic-prompt-title" className="font-heading text-2xl tracking-tight">
          Mikrofon für dieses Gespräch
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {platformLabel(platform)}
          {support.live ? " · Live-Erkennung" : " · Aufnahme"}
          {support.secure ? "" : " · unsichere Verbindung"}. Die Freigabe auf der Startseite gilt nicht automatisch
          hier. Einmal auf den Button — der Browser darf nochmals nachfragen.
        </p>
        {message ? <p className="mt-3 text-sm leading-relaxed">{message}</p> : null}
        {help && (state === "denied" || state === "insecure" || state === "unsupported") ? (
          <div className="mt-3 rounded-2xl bg-secondary/60 px-3 py-2 text-xs leading-relaxed">
            <p className="font-medium">{help.title}</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4">
              {help.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="button" className="h-11 rounded-2xl px-5" disabled={busy} onClick={() => void openLine()}>
            {busy ? <Loader2 className="animate-spin" /> : <Mic />}
            Leitung öffnen
          </Button>
          <Button type="button" variant="ghost" className="h-11 rounded-2xl" disabled={busy} onClick={onSkip}>
            Ohne Mikrofon — ich tippe
          </Button>
        </div>
      </div>
    </div>
  );
}
