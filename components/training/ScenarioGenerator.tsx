"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { DictationMic } from "@/components/training/DictationMic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  appendSpoken,
  chipIsSelected,
  HINT_CHIP_GROUPS,
  toggleChip,
} from "@/lib/scenario-seed";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ScenarioGenerator() {
  const router = useRouter();
  const [situation, setSituation] = useState(
    "Verhandlungsgespräch mit Zinshauseigentümer, der bereits einmal abgelehnt hat. Ich möchte doch mal reinkommen.",
  );
  const [counterpart, setCounterpart] = useState("");
  const [objekt, setObjekt] = useState("");
  const [happened, setHappened] = useState("");
  const [rollHidden, setRollHidden] = useState(true);
  const [showExtras, setShowExtras] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, counterpart, objekt, happened, rollHidden }),
        signal: ac.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erzeugen fehlgeschlagen");
      router.push(`/autor?id=${data.id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[1.7rem] border p-6 md:p-8">
      <div>
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Gespräch vorbereiten</p>
        <h2 className="font-heading mt-2 text-2xl tracking-tight">Situation beschreiben</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          In eigenen Worten, was Sie wissen und worauf Sie sich vorbereiten. Die KI macht daraus einen
          Leitfaden und ein Roleplay — öffentlich bleibt nur Ihre Akte.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="situation" className="text-xs font-medium">
            Situation
          </label>
          <DictationMic
            label="Diktieren"
            onTranscript={(spoken) => setSituation((value) => appendSpoken(value, spoken))}
          />
        </div>
        <Textarea
          id="situation"
          className="mt-1 min-h-28 rounded-xl text-base"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Verhandlungsgespräch mit Zinshauseigentümer, der bereits einmal abgelehnt hat. Ich möchte doch mal reinkommen."
        />
        <p className="text-muted-foreground mt-1 text-[0.7rem] leading-relaxed">
          Tippen oder auf das Mikrofon tippen und sprechen. Gesprochenes wird angehängt, nicht ersetzt.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {HINT_CHIP_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="text-copper mb-1.5 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.chips.map((chip) => {
                const selected = chipIsSelected(situation, chip.text);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSituation((value) => toggleChip(value, chip.text))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[0.7rem] font-medium transition",
                      selected
                        ? "border-primary/40 bg-background text-foreground border"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowExtras((open) => !open)}
        className="text-muted-foreground hover:text-foreground self-start text-xs font-medium"
      >
        {showExtras ? "Zusätze schließen" : "Optional ergänzen: Name, Objekt, letzter Kontakt"}
      </button>

      {showExtras ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="counterpart" className="text-xs font-medium">
                Gegenüber <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <DictationMic
                compact
                label="Gegenüber diktieren"
                onTranscript={(spoken) => setCounterpart((value) => appendSpoken(value, spoken))}
              />
            </div>
            <input
              id="counterpart"
              className={`${fieldClass} mt-1`}
              value={counterpart}
              onChange={(e) => setCounterpart(e.target.value)}
              placeholder="Name, Rolle"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="objekt" className="text-xs font-medium">
                Objekt <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <DictationMic
                compact
                label="Objekt diktieren"
                onTranscript={(spoken) => setObjekt((value) => appendSpoken(value, spoken))}
              />
            </div>
            <input
              id="objekt"
              className={`${fieldClass} mt-1`}
              value={objekt}
              onChange={(e) => setObjekt(e.target.value)}
              placeholder="Straße, Bezirk"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="happened" className="text-xs font-medium">
                Bisher <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <DictationMic
                compact
                label="Kontakt diktieren"
                onTranscript={(spoken) => setHappened((value) => appendSpoken(value, spoken))}
              />
            </div>
            <input
              id="happened"
              className={`${fieldClass} mt-1`}
              value={happened}
              onChange={(e) => setHappened(e.target.value)}
              placeholder="Letzter Kontakt"
            />
          </div>
        </div>
      ) : null}

      <label className="flex items-start gap-2 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-1"
          checked={rollHidden}
          onChange={(e) => setRollHidden(e.target.checked)}
        />
        <span>
          Verdecktes würfeln
          <span className="text-muted-foreground block text-xs">
            Dieselbe Akte, andere Wahrheit — die Figur muss nicht wollen, was Sie vermuten.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {busy ? (
          <Button type="button" variant="secondary" onClick={() => abortRef.current?.abort()} className="h-11 rounded-2xl px-5">
            <Square />
            Abbrechen
          </Button>
        ) : (
          <Button type="button" onClick={() => void generate()} className="h-11 rounded-2xl px-5">
            <Sparkles />
            Orientierung erzeugen
          </Button>
        )}
        {error ? <p className={cn("text-destructive text-sm")}>{error}</p> : null}
      </div>
    </section>
  );
}
