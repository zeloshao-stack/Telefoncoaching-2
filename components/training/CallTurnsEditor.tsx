"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TranscriptTurn } from "@/src/role-engine/types";

/**
 * Transkript mit Sprecherwechsel per Klick. Wer falsch zugeordnet ist, wird getauscht,
 * dann neu ausgewertet — die Momente hängen an der richtigen Seite.
 */
export function CallTurnsEditor({
  callId,
  turns,
  counterpartName,
  highlightIds,
}: {
  callId: string;
  turns: TranscriptTurn[];
  counterpartName: string;
  highlightIds: string[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(turns);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const marked = new Set(highlightIds);

  function flip(id: string) {
    setRows((prev) =>
      prev.map((turn) =>
        turn.id === id
          ? { ...turn, speaker: turn.speaker === "trainee" ? "counterpart" : "trainee" }
          : turn,
      ),
    );
    setDirty(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      // Aufeinanderfolgende gleiche Sprecher zusammenziehen
      const merged: TranscriptTurn[] = [];
      for (const turn of rows) {
        const last = merged[merged.length - 1];
        if (last && last.speaker === turn.speaker) last.text = `${last.text} ${turn.text}`;
        else merged.push({ ...turn });
      }
      const res = await fetch(`/api/gespraeche/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: merged }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");
      setDirty(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ul className="space-y-2">
        {rows.map((turn) => (
          <li
            key={turn.id}
            className={cn("flex", turn.speaker === "trainee" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                turn.speaker === "trainee" && "bg-primary/90 text-primary-foreground rounded-br-md",
                turn.speaker === "counterpart" && "bg-secondary text-secondary-foreground rounded-bl-md",
                marked.has(turn.id) && "ring-2 ring-copper/60",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-[0.65rem] font-semibold tracking-wider uppercase opacity-70">
                  {turn.speaker === "trainee" ? "Sie" : counterpartName}
                </p>
                <button
                  type="button"
                  title="Sprecher tauschen"
                  className="inline-flex items-center gap-1 text-[0.65rem] opacity-60 hover:opacity-100"
                  onClick={() => flip(turn.id)}
                >
                  <ArrowLeftRight className="size-3" />
                  tauschen
                </button>
              </div>
              <span className="block">{turn.text}</span>
            </div>
          </li>
        ))}
      </ul>
      {dirty ? (
        <div className="mt-3 flex items-center gap-3">
          <Button type="button" size="sm" className="rounded-2xl" disabled={busy} onClick={() => void save()}>
            {busy ? <Loader2 className="animate-spin" /> : <Check />}
            Zuordnung speichern und neu auswerten
          </Button>
          {error ? <span className="text-destructive text-xs">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
