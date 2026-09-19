"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { listVerticals, type VerticalId } from "@/lib/verticals";
import { cn } from "@/lib/utils";

export function VerticalSwitch({ activeId }: { activeId: VerticalId }) {
  const path = usePathname() ?? "/";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(id: VerticalId) {
    if (id === activeId || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId: id }),
      });
      if (!res.ok) throw new Error("Branche nicht übernommen");
      window.location.assign(path.startsWith("/coach") ? "/coach" : "/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Branche nicht übernommen");
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground px-0.5 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
        Branche
      </p>
      <div className="flex flex-col gap-0.5">
        {listVerticals().map((vertical) => (
          <button
            key={vertical.id}
            type="button"
            disabled={pending}
            onClick={() => void choose(vertical.id)}
            className={cn(
              "rounded-xl px-2.5 py-2 text-left text-sm transition",
              activeId === vertical.id
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/70"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <span className="block font-medium">{vertical.label}</span>
            <span className="text-muted-foreground block text-[0.7rem]">{vertical.shortLabel}</span>
          </button>
        ))}
      </div>
      {error ? <p className="text-destructive pt-1 text-[0.7rem]">{error}</p> : null}
    </div>
  );
}
