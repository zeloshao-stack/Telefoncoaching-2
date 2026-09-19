"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Repeat2, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CoachPrompt } from "@/lib/verticals";
import { groupEnablementPrompts, SITUATION_LABELS } from "@/lib/coach-canon";
import { playbookHeading, type CoachHandoff } from "@/lib/coach-handoff";
import type { CoachThread, CoachThreadSummary } from "@/lib/coach-types";
import { parseSpotlight } from "@/lib/spotlight";
import { cn } from "@/lib/utils";
import { SpotlightBlocks } from "@/components/training/SpotlightBlocks";
import { DictationMic } from "@/components/training/DictationMic";

export function CoachWorkspace({
  initialThreads,
  initialThread,
  prompts,
  lead,
  placeholder,
  emptyHint,
  handoff = null,
  anchorTurnId = null,
  handoffError = null,
}: {
  initialThreads: CoachThreadSummary[];
  initialThread: CoachThread | null;
  prompts: CoachPrompt[];
  lead: string;
  placeholder: string;
  emptyHint: string;
  handoff?: CoachHandoff | null;
  anchorTurnId?: string | null;
  handoffError?: string | null;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [thread, setThread] = useState(initialThread);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setThread(initialThread);
    setThreads(initialThreads);
  }, [initialThread, initialThreads]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function create(sessionId?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionId ? { sessionId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat nicht angelegt");
      router.push(`/coach/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
    }
  }

  async function send(text = draft) {
    if (!text.trim() || busy) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setBusy(true);
    setError(null);
    try {
      let id = thread?.id;
      if (!id) {
        const created = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: ac.signal,
        });
        const data = await created.json();
        if (!created.ok) throw new Error(data.error || "Chat nicht angelegt");
        id = data.id as string;
        router.replace(`/coach/${id}`);
      }
      const res = await fetch(`/api/coach/${id}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: ac.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Antwort fehlgeschlagen");
      setThread(data);
      setDraft("");
      const list = await fetch("/api/coach").then((r) => r.json());
      setThreads(list);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setBusy(false);
    }
  }

  async function practiceLinkedSession() {
    if (!thread?.sessionId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const fromTurnId = anchorTurnId || undefined;
      const res = await fetch(`/api/sessions/${thread.sessionId}/repeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fromTurnId ? { fromTurnId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wiederholung nicht möglich");
      router.push(`/sitzung/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
    }
  }

  const empty = !thread || thread.messages.filter((m) => m.role !== "system").length === 0;
  const groups = groupEnablementPrompts(prompts, {
    includeEinwand: !handoff || handoff.situation === "einwand",
  });

  return (
    <div className="flex min-h-[70vh] gap-5">
      <aside className="glass-card hidden w-56 shrink-0 flex-col rounded-[1.4rem] border p-3 md:flex">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold tracking-wide uppercase">Letzte Chats</p>
          <Button variant="ghost" size="icon-sm" onClick={() => void create()} disabled={busy} aria-label="Neuer Chat">
            <Plus />
          </Button>
        </div>
        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {threads.length === 0 ? (
            <li className="text-muted-foreground px-2 py-3 text-xs">Noch kein Chat.</li>
          ) : (
            threads.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/coach/${item.id}`}
                  className={cn(
                    "block rounded-xl px-2.5 py-2 text-sm",
                    thread?.id === item.id ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/60",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <p className="text-copper mb-2 text-xs font-semibold tracking-[0.2em] uppercase">Fragen · zweite Handhabe</p>
          <h1 className="font-heading text-3xl tracking-tight md:text-4xl">Vertriebscoach</h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">{lead}</p>
        {thread?.sessionId ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 h-10 rounded-2xl px-4"
            disabled={busy}
            onClick={() => void practiceLinkedSession()}
          >
            <Repeat2 />
            Dieselbe Stelle jetzt üben
          </Button>
        ) : null}
        {handoffError ? <p className="text-destructive mt-2 text-sm">{handoffError}</p> : null}
        {handoff ? (
          <section data-coach="playbook" className="mt-4 rounded-2xl border border-border/70 bg-background/50 px-4 py-3">
            <p className="text-copper text-xs font-semibold tracking-[0.16em] uppercase">
              {SITUATION_LABELS[handoff.situation]}
            </p>
            <p className="mt-1 text-sm font-medium">{playbookHeading(handoff.playbook)}</p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{handoff.playbook.goal}</p>
            {handoff.phrase ? (
              <p className="mt-2 text-sm leading-relaxed">
                Formulierung: „{handoff.phrase}“
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {handoff.reviewQuestions.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  data-coach="review"
                  className="rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium hover:border-primary/40"
                  onClick={() => void send(item.text)}
                  disabled={busy}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>
        ) : null}
        </div>

        <div className="glass-card flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-[1.6rem] border">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
            {empty && !handoff ? (
              <div>
                <p className="font-heading text-center text-xl">Willkommen beim Vertriebscoach</p>
                <p className="text-muted-foreground mt-2 text-center text-sm">{emptyHint}</p>
                <div className="mt-6 space-y-5">
                  {groups.map((group) => (
                    <section key={group.id}>
                      <p className="text-muted-foreground mb-2 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
                        {group.label}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.prompts.map((prompt) => (
                          <button
                            key={prompt.title}
                            type="button"
                            className="rounded-2xl border border-border/80 bg-background/70 p-4 text-left text-sm transition hover:border-primary/30"
                            onClick={() => void send(prompt.text)}
                            disabled={busy}
                          >
                            <p className="font-medium">{prompt.title}</p>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{prompt.text}</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              (thread?.messages ?? []).map((message) => {
                const spotlight = message.role === "coach" ? parseSpotlight(message.text) : null;
                return (
                <div
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "min-w-0 rounded-3xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user" && "max-w-[90%] bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap",
                      message.role === "coach" && "w-full max-w-full bg-secondary text-secondary-foreground rounded-bl-md",
                      message.role === "system" && "bg-muted text-muted-foreground mx-auto max-w-[90%] text-center text-xs whitespace-pre-wrap",
                    )}
                  >
                    {spotlight ? (
                      <SpotlightBlocks {...spotlight} compact />
                    ) : (
                      <span className="whitespace-pre-wrap">{message.text}</span>
                    )}
                  </div>
                </div>
                );
              })
            )}
            {busy ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">Coach überlegt…</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-xl"
                  onClick={() => {
                    abortRef.current?.abort();
                    setBusy(false);
                  }}
                >
                  <Square className="size-3" />
                  Abbrechen
                </Button>
              </div>
            ) : null}
            <div ref={bottom} />
          </div>
          <form
            className="border-t border-border/70 p-3 md:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={busy}
              className="min-h-20 resize-none rounded-2xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">Mikrofon: tippen, sprechen, nochmal tippen. Enter sendet.</p>
              {busy ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 rounded-2xl px-4"
                  onClick={() => {
                    abortRef.current?.abort();
                    setBusy(false);
                  }}
                >
                  <Square />
                  Abbrechen
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <DictationMic
                    label="Sprechen"
                    onPartial={setDraft}
                    onTranscript={(spoken) => void send(spoken)}
                  />
                  <Button type="submit" disabled={!draft.trim()} className="h-10 rounded-2xl px-4">
                    <Send />
                    Senden
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
