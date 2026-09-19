"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewScenarioButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/scenarios", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Anlegen fehlgeschlagen");
      router.push(`/autor?id=${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" onClick={() => void create()} disabled={busy} className="h-10 rounded-2xl">
        <Plus />
        {busy ? "Legt an…" : "Neues Szenario"}
      </Button>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
