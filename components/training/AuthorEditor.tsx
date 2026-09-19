"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneCall, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SpeakButton } from "@/components/training/SpeakButton";
import { GuidePanel } from "@/components/training/GuidePanel";
import type { AuthoredScenario, CallGuide } from "@/lib/authored-types";
import { voiceIdForScenario } from "@/lib/voices";

const fieldClass =
  "w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuthorEditor({ initial }: { initial: AuthoredScenario }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState<"save" | "play" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(initial.updated_at);

  function setPublic<K extends "title" | "counterpartName" | "public_brief" | "opening" | "acceptable_outcome">(
    key: K,
    value: string,
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setPrivate(key: keyof AuthoredScenario["private_state"], value: string) {
    setDraft((d) => ({ ...d, private_state: { ...d.private_state, [key]: value } }));
  }

  function setGuide(guide: CallGuide) {
    setDraft((d) => ({ ...d, guide }));
  }

  async function persist() {
    const res = await fetch(`/api/scenarios/${draft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");
    setDraft(data);
    setSavedAt(data.updated_at);
    return data as AuthoredScenario;
  }

  async function save() {
    setBusy("save");
    setError(null);
    try {
      await persist();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(null);
    }
  }

  async function play() {
    setBusy("play");
    setError(null);
    try {
      const saved = await persist();
      if (!saved.public_brief.trim() || !saved.opening.trim()) {
        throw new Error("Briefing und Eröffnung brauchen Text, bevor Sie üben.");
      }
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: saved.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sitzung konnte nicht starten.");
      router.push(`/sitzung/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {draft.draft ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm leading-relaxed">
          Entwurf. Die verdeckten Motive sind synthetisch, bis Sie sie überschreiben. Der Trainee sieht
          sie nicht.
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="glass-card flex flex-col gap-4 rounded-[1.7rem] border p-6">
          <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">
            Öffentlich · public_brief
          </p>
          <label className="text-xs font-medium">
            Titel
            <input
              className={`${fieldClass} mt-1`}
              value={draft.title}
              onChange={(e) => setPublic("title", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Name der Gegenseite
            <input
              className={`${fieldClass} mt-1`}
              value={draft.counterpartName}
              onChange={(e) => setPublic("counterpartName", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Briefing
            <Textarea
              className="mt-1 min-h-28 rounded-xl"
              value={draft.public_brief}
              onChange={(e) => setPublic("public_brief", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Eröffnung (spricht sie zuerst)
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.opening}
              onChange={(e) => setPublic("opening", e.target.value)}
            />
          </label>
          <SpeakButton
            text={draft.opening}
            voiceId={voiceIdForScenario(draft.id, draft.counterpartName)}
            label="Eröffnung hören"
          />
          <label className="text-xs font-medium">
            Erlaubtes Ergebnis
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.acceptable_outcome}
              onChange={(e) => setPublic("acceptable_outcome", e.target.value)}
            />
          </label>
        </section>

        <section className="glass-card flex flex-col gap-4 rounded-[1.7rem] border border-primary/20 p-6">
          <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">
            Verdeckt · private_state
          </p>
          <label className="text-xs font-medium">
            Wie geht es ihr?
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.private_state.wellbeing}
              onChange={(e) => setPrivate("wellbeing", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Will sie verkaufen — oder nicht?
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.private_state.sell_will}
              onChange={(e) => setPrivate("sell_will", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Hat sie schon mit jemandem gesprochen?
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.private_state.prior_talk}
              onChange={(e) => setPrivate("prior_talk", e.target.value)}
            />
          </label>
          <label className="text-xs font-medium">
            Körperliche Verfassung
            <Textarea
              className="mt-1 min-h-20 rounded-xl"
              value={draft.private_state.constitution}
              onChange={(e) => setPrivate("constitution", e.target.value)}
            />
          </label>
        </section>
      </div>

      {draft.guide ? <GuidePanel guide={draft.guide} onChange={setGuide} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void save()} disabled={Boolean(busy)} className="h-11 rounded-2xl px-5">
          <Save />
          {busy === "save" ? "Speichert…" : "Speichern"}
        </Button>
        <Button
          onClick={() => void play()}
          disabled={Boolean(busy)}
          variant="secondary"
          className="h-11 rounded-2xl px-5"
        >
          <PhoneCall />
          {busy === "play" ? "Gespräch startet…" : "Diese Figur üben"}
        </Button>
        <p className="text-muted-foreground text-xs" suppressHydrationWarning>
          Zuletzt gespeichert:{" "}
          {new Date(savedAt).toLocaleString("de-AT", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Vienna",
          })}
        </p>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
