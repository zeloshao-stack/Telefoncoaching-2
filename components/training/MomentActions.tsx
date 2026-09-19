"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PracticeMomentButton({
  callId,
  momentTurnId,
  suggestedLine: _suggestedLine,
  label = "Diese Stelle üben",
}: {
  callId: string;
  momentTurnId: string;
  suggestedLine: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/gespraeche/${callId}/ueben`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ momentTurnId }),
      });
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok || !data.id) throw new Error(data.error || "Übung konnte nicht starten");
      router.push(`/sitzung/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" className="h-10 rounded-2xl px-4" disabled={busy} onClick={() => void start()}>
        {busy ? <Loader2 className="animate-spin" /> : <Phone />}
        {label}
      </Button>
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </div>
  );
}
