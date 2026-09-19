"use client";

import { useState } from "react";
import { Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakUtterance, stopSpeech, unlockSpeech } from "@/components/training/speechPlayer";
import type { VoiceId, VoiceMood, ElevenDelivery } from "@/lib/voices";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  voiceId,
  mood,
  delivery,
  label = "Anhören",
  className,
  variant = "secondary",
}: {
  text: string;
  voiceId: VoiceId;
  mood?: VoiceMood;
  delivery?: ElevenDelivery;
  label?: string;
  className?: string;
  variant?: "secondary" | "outline" | "ghost";
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (state === "playing" || state === "loading") {
      stopSpeech();
      setState("idle");
      return;
    }
    if (!text.trim()) return;
    setState("loading");
    setError(null);
    try {
      await unlockSpeech();
      const play = speakUtterance(text, voiceId, mood, delivery);
      setState("playing");
      await play;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stimme nicht erzeugt");
    } finally {
      setState("idle");
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={cn("rounded-xl", className)}
        onClick={() => void toggle()}
        disabled={!text.trim() && state === "idle"}
        aria-label={state === "playing" ? "Stoppen" : label}
      >
        {state === "loading" ? <Loader2 className="animate-spin" /> : null}
        {state === "playing" ? <Square /> : null}
        {state === "idle" ? <Volume2 /> : null}
        {state === "playing" ? "Stopp" : label}
      </Button>
      {error ? <span className="text-destructive max-w-[14rem] text-[0.65rem] leading-snug">{error}</span> : null}
    </span>
  );
}
