"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultFocusForScenario, focusesForVertical, type FocusId } from "@/lib/focus";
import { catalogSessionBody } from "@/lib/scene-card";
import type { VerticalId } from "@/lib/verticals";
import { cn } from "@/lib/utils";

export function StartSessionButton({
  scenarioId,
  verticalId,
  focusPicker = false,
}: {
  scenarioId: string;
  verticalId: VerticalId;
  focusPicker?: boolean;
}) {
  const router = useRouter();
  const focuses = focusesForVertical(verticalId);
  const defaultFocus = defaultFocusForScenario(scenarioId, verticalId);
  const [focusId, setFocusId] = useState<FocusId>(defaultFocus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = focuses.find((item) => item.id === focusId) ?? focuses[0];

  async function start() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catalogSessionBody(scenarioId, focusId)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sitzung konnte nicht starten.");
      router.push(`/sitzung/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {focusPicker ? (
        <div>
          <p className="text-muted-foreground mb-1.5 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
            Heute eine Sache
          </p>
          <div className="flex flex-wrap gap-1.5">
            {focuses.map((focus) => (
              <button
                key={focus.id}
                type="button"
                onClick={() => setFocusId(focus.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[0.7rem] font-medium transition",
                  focusId === focus.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {focus.label}
              </button>
            ))}
          </div>
          {selected ? <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{selected.hint}</p> : null}
        </div>
      ) : null}
      <Button onClick={() => void start()} disabled={pending} className="h-12 w-full rounded-2xl px-6 text-base">
        <PhoneCall />
        {pending ? "Gespräch wird vorbereitet…" : "Gespräch starten"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
