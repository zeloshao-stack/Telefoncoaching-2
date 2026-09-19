"use client";

import { useEffect, useState } from "react";

type Status = {
  connected: boolean;
  provider: string;
  model: string;
};

export function EngineBadge({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/engine")
      .then((res) => res.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus({ connected: false, provider: "mock", model: "regel-fallback" }));
  }, []);

  if (!status) {
    return (
      <span className="text-muted-foreground text-xs" suppressHydrationWarning>
        Engine…
      </span>
    );
  }

  if (status.connected) {
    return (
      <span className="text-xs">
        {compact ? status.model : `${status.provider} · ${status.model} · Abbruch möglich`}
      </span>
    );
  }

  return (
    <span className="text-muted-foreground text-xs">
      {compact ? "Fallback" : "Kein Modell-Key — Regel-Fallback. Abbruch trotzdem möglich."}
    </span>
  );
}
