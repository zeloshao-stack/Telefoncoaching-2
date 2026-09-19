import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PracticeMomentButton } from "@/components/training/MomentActions";
import { CallTurnsEditor } from "@/components/training/CallTurnsEditor";
import { getRealCall } from "@/lib/real-calls";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" });
}

export default async function GespraechPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let call;
  try {
    call = getRealCall(id);
  } catch {
    notFound();
  }
  const { analytics, moments } = call;
  const practicedFor = new Map<string, number>();
  for (const p of call.practiced) {
    if (p.momentTurnId) practicedFor.set(p.momentTurnId, (practicedFor.get(p.momentTurnId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/gespraeche"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> Alle echten Gespräche
      </Link>

      <div>
        <p className="text-copper text-xs font-semibold tracking-[0.16em] uppercase">
          Echtes Gespräch · {call.counterpartName}
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight md:text-4xl">{call.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {formatWhen(call.createdAt)} · {analytics.traineeTurns} Ihre Züge, {analytics.counterpartTurns} Gegenseite ·{" "}
          {analytics.openQuestions} offene, {analytics.closedQuestions} geschlossene Fragen
        </p>
      </div>

      <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Handbuch B1–B4</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {analytics.skills.map((skill) => (
            <li key={skill.id} className="rounded-2xl border border-border/70 px-3 py-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="font-medium">
                  {skill.id} {skill.label}
                </span>
                <span
                  className={cn(
                    "text-[0.65rem] tracking-wide uppercase",
                    skill.state === "sichtbar" && "text-primary",
                    skill.state === "luecke" && "text-destructive",
                    skill.state === "keine_gelegenheit" && "text-muted-foreground",
                  )}
                >
                  {skill.state === "sichtbar" ? "sichtbar" : skill.state === "luecke" ? "Lücke" : "keine Gelegenheit"}
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{skill.evidence}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 text-xs">{analytics.shareReading}</p>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Wo es kippte</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Zitat, Ihre Antwort, ein Hebel. Jede Stelle lässt sich sofort noch einmal sprechen — die Figur sagt
              den echten Satz, Sie antworten neu.
            </p>
          </div>
        </div>
        {moments.length === 0 ? (
          <div className="glass-card rounded-[1.5rem] border p-5 text-sm leading-relaxed">
            Kein Kipp-Moment gefunden: Einwände wurden aufgenommen, Fragen beantwortet, das Ende war verbindlich.
            Wenn die Sprecher vertauscht sind, unten tauschen und neu auswerten.
          </div>
        ) : (
          <ul className="grid gap-4">
            {moments.map((moment, index) => (
              <li key={moment.id} className="glass-card rounded-[1.5rem] border p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {index + 1}. {moment.kindLabel}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {moment.skillId} {moment.skillLabel}
                  </Badge>
                  {practicedFor.get(moment.turnId) ? (
                    <Badge variant="outline" className="rounded-full">
                      {practicedFor.get(moment.turnId)}× geübt
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">{call.counterpartName}</span>
                  <br />
                  <span className="font-medium">„{moment.quote}“</span>
                </p>
                {moment.reply ? (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Sie</span>
                    <br />
                    <span className="text-muted-foreground">„{moment.reply}“</span>
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-relaxed">
                  <span className="text-copper font-medium">Hebel:</span> {moment.reason}
                </p>
                <p className="mt-2 rounded-2xl bg-secondary/60 px-3 py-2 text-sm leading-relaxed">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Zum Probieren</span>
                  <br />
                  {moment.suggestedLine}
                </p>
                <div className="mt-3">
                  <PracticeMomentButton
                    callId={call.id}
                    momentTurnId={moment.turnId}
                    suggestedLine={moment.suggestedLine}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {call.practiced.length ? (
        <section className="glass-card rounded-[1.7rem] border p-5">
          <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Aus diesem Gespräch geübt</p>
          <ul className="mt-3 space-y-2 text-sm">
            {call.practiced.map((p) => (
              <li key={p.sessionId}>
                <Link
                  href={p.status === "ended" ? `/sitzung/${p.sessionId}/auswertung` : `/sitzung/${p.sessionId}`}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  {formatWhen(p.createdAt)} · {p.status === "ended" ? "ausgewertet" : "offen"}
                  <ArrowRight className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Transkript</p>
        <p className="text-muted-foreground mt-1 mb-4 text-xs">
          Markiert: die Stellen oben. Falsch zugeordnet? „tauschen“ und speichern — die Auswertung folgt.
        </p>
        <CallTurnsEditor
          callId={call.id}
          turns={call.turns}
          counterpartName={call.counterpartName}
          highlightIds={moments.map((m) => m.turnId)}
        />
      </section>
    </div>
  );
}
