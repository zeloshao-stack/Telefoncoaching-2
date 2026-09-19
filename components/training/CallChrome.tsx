"use client";

import { useState, type ReactNode } from "react";
import { PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceOrb, type OrbPhase } from "@/components/training/VoiceOrb";
import { cn } from "@/lib/utils";

export function CallChrome({
  counterpartName,
  statusLine,
  ended,
  hangupDisabled,
  onHangup,
  hearOn,
  onToggleHear,
  liveLineOn,
  onToggleLiveLine,
  audioBlocked,
  onUnlock,
  orbPhase,
  orbLabel,
  onOrbClick,
  orbDisabled,
  micStream,
  error,
  micPrompt,
  captions,
}: {
  counterpartName: string;
  statusLine: string;
  ended: boolean;
  hangupDisabled: boolean;
  onHangup: () => void;
  hearOn: boolean;
  onToggleHear: () => void;
  liveLineOn: boolean;
  onToggleLiveLine: () => void;
  audioBlocked: boolean;
  onUnlock: () => void;
  orbPhase: OrbPhase;
  orbLabel: string;
  onOrbClick: () => void;
  orbDisabled: boolean;
  micStream: MediaStream | null;
  error: string | null;
  micPrompt: ReactNode;
  captions: ReactNode;
}) {
  return (
    <div
      data-testid="call-chrome"
      data-live-stage="phone"
      className="mx-auto flex w-full max-w-md flex-col gap-8 px-1 pt-2 pb-8"
    >
      <header className="text-center">
        <h1 className="font-heading text-3xl tracking-tight">{counterpartName}</h1>
        <p
          data-testid="call-status"
          aria-live="polite"
          className={cn("mt-3 text-base leading-snug", ended ? "text-muted-foreground" : "font-medium")}
        >
          {statusLine}
        </p>
      </header>

      <div className="flex justify-center">
        <button
          type="button"
          aria-label={orbLabel}
          title="Antippen: Mikrofon jetzt öffnen"
          disabled={orbDisabled}
          onClick={onOrbClick}
          className="rounded-2xl px-2 py-1 transition hover:bg-secondary/60 disabled:cursor-default disabled:hover:bg-transparent"
        >
          <VoiceOrb phase={orbPhase} stream={micStream} size="lg" />
        </button>
      </div>

      {audioBlocked ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/8 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>Der Browser hat den Ton noch nicht freigegeben.</p>
          <Button type="button" className="h-10 rounded-2xl px-4" onClick={onUnlock}>
            <Volume2 />
            Ton einschalten
          </Button>
        </div>
      ) : null}

      {micPrompt}

      <div className="flex flex-col items-stretch gap-3">
        <Button
          variant="destructive"
          data-testid="hangup"
          onClick={onHangup}
          disabled={hangupDisabled}
          className="h-14 rounded-2xl px-6 text-base"
        >
          <PhoneOff />
          Auflegen
        </Button>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant={hearOn ? "secondary" : "outline"}
            onClick={onToggleHear}
            className="h-10 rounded-2xl px-4"
          >
            <Volume2 />
            {hearOn ? "Hören an" : "Hören aus"}
          </Button>
          <Button
            type="button"
            variant={liveLineOn ? "secondary" : "outline"}
            onClick={onToggleLiveLine}
            className="h-10 rounded-2xl px-4"
          >
            {liveLineOn ? "Leitung an" : "Leitung aus"}
          </Button>
        </div>
      </div>

      {captions}
      {error ? <p className="text-destructive text-center text-sm">{error}</p> : null}
    </div>
  );
}

export function LiveCaptions({
  turns,
  counterpartName,
}: {
  turns: Array<{ id: string; speaker: string; text: string }>;
  counterpartName: string;
}) {
  const [on, setOn] = useState(false);
  return (
    <div className="w-full text-center">
      <button
        type="button"
        aria-pressed={on}
        data-testid="captions-toggle"
        onClick={() => setOn((value) => !value)}
        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
      >
        {on ? "Untertitel ausblenden" : "Untertitel"}
      </button>
      {on ? (
        <ol data-testid="live-captions" className="mt-3 max-h-40 space-y-2 overflow-y-auto text-left text-sm">
          {turns.length === 0 ? (
            <li className="text-muted-foreground">Noch kein Wort.</li>
          ) : (
            turns.map((turn) => (
              <li key={turn.id}>
                {turn.speaker !== "system" ? (
                  <span className="text-muted-foreground mr-1 text-xs font-semibold tracking-wider uppercase">
                    {turn.speaker === "trainee" ? "Sie" : counterpartName}
                  </span>
                ) : null}
                <span>{turn.text}</span>
              </li>
            ))
          )}
        </ol>
      ) : null}
    </div>
  );
}
