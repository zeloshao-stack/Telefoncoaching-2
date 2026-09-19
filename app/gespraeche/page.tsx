import Link from "next/link";
import { ArrowRight, PhoneIncoming } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CallIntake } from "@/components/training/CallIntake";
import { listRealCalls } from "@/lib/real-calls";
import { listRecentSessions } from "@/lib/sessions";
import { recurringPatterns } from "@/lib/patterns";
import { whisperKey } from "@/lib/whisper";
import { activeVerticalId } from "@/lib/workspace";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" });
}

export default async function GespraechePage() {
  const verticalId = await activeVerticalId();
  const calls = listRealCalls(verticalId);
  const practice = listRecentSessions(40, verticalId).filter((s) => s.status === "ended" && !s.realCallId);
  const patterns = recurringPatterns([
    ...calls.map((call) => ({ id: call.id, title: call.title, kind: "echt" as const, turns: call.turns })),
    ...practice.map((s) => ({ id: s.id, title: s.scenarioTitle, kind: "uebung" as const, turns: s.turns })),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <p className="text-copper mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Echt</p>
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">Echte Gespräche</h1>
        <p className="text-muted-foreground mt-3 max-w-xl text-lg leading-relaxed">
          Ihre Telefonate, ausgewertet wie eine Übung. Nicht der Redeanteil zählt, sondern die Stelle, an der es
          kippte — und dass Sie genau die noch einmal sprechen können.
        </p>
      </div>

      <CallIntake whisperReady={Boolean(whisperKey())} />

      {calls.length > 0 ? (
        <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
          <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Was sich wiederholt</p>
          <p className="mt-2 text-sm leading-relaxed">{patterns.reading}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Lücken über {patterns.calls} Gespräche ({patterns.echt} echt)</p>
              <ul className="mt-2 space-y-1 text-sm">
                {patterns.gaps.map((gap) => (
                  <li key={gap.id} className="flex items-center justify-between gap-3">
                    <span>
                      {gap.id} {gap.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        gap.luecke >= 2 && gap.luecke * 2 >= gap.gelegenheit ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {gap.luecke} / {gap.gelegenheit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Einwände, die wiederkommen</p>
              {patterns.objections.length ? (
                <ul className="mt-2 space-y-1 text-sm">
                  {patterns.objections.slice(0, 5).map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3">
                      <span>{row.label}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">{row.count}×</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">Noch keine.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {calls.length === 0 ? (
        <section className="glass-card rounded-[1.7rem] border p-8">
          <PhoneIncoming className="text-copper mb-4 size-6" />
          <h2 className="font-heading text-2xl tracking-tight">Noch kein echtes Gespräch</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Oben ein Transkript einfügen. Danach sehen Sie B1–B4, die Momente und den Satz zum Probieren.
          </p>
        </section>
      ) : (
        <ul className="grid gap-4">
          {calls.map((call) => {
            const top = call.moments[0];
            const gaps = call.analytics.skills.filter((s) => s.state === "luecke");
            return (
              <li key={call.id}>
                <Link
                  href={`/gespraeche/${call.id}`}
                  className="glass-card flex flex-col gap-3 rounded-[1.5rem] border p-5 transition hover:border-primary/25"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {call.source === "audio" ? "Aufnahme" : "Transkript"}
                    </Badge>
                    {call.moments.length ? (
                      <Badge variant="outline" className="rounded-full">
                        {call.moments.length} {call.moments.length === 1 ? "Moment" : "Momente"}
                      </Badge>
                    ) : null}
                    {call.practiced.length ? (
                      <Badge variant="outline" className="rounded-full">
                        {call.practiced.length}× geübt
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl tracking-tight">{call.title}</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {call.counterpartName} · {formatWhen(call.createdAt)}
                        {gaps.length ? ` · Lücke: ${gaps.map((g) => g.id).join(", ")}` : " · keine Lücke"}
                      </p>
                      {top ? (
                        <p className="mt-2 text-sm leading-relaxed">
                          <span className="text-copper font-medium">{top.kindLabel}:</span> „{top.quote}“
                        </p>
                      ) : null}
                    </div>
                    <ArrowRight className="text-muted-foreground mt-1 size-4 shrink-0" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
