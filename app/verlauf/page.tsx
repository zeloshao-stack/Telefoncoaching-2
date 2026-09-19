import Link from "next/link";
import { ArrowLeft, ArrowRight, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listRecentSessions } from "@/lib/sessions";
import { activeVerticalId } from "@/lib/workspace";
import { analyzeCall } from "@/lib/call-analytics";
import { skillHistory } from "@/lib/practice-loop";
import { listRealCalls } from "@/lib/real-calls";
import { recurringPatterns } from "@/lib/patterns";
import {
  PRACTICE_LANES,
  PRACTICE_LANE_HINT,
  PRACTICE_LANE_LABEL,
  buildPracticePipeline,
  type PracticeLane,
} from "@/lib/practice-pipeline";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function VerlaufPage() {
  const verticalId = await activeVerticalId();
  const sessions = listRecentSessions(40, verticalId);
  const history = skillHistory(sessions, analyzeCall);
  const cards = buildPracticePipeline(sessions);
  const realCalls = listRealCalls(verticalId);
  const patterns = recurringPatterns([
    ...realCalls.map((call) => ({ id: call.id, title: call.title, kind: "echt" as const, turns: call.turns })),
    ...sessions
      .filter((s) => s.status === "ended" && !s.realCallId)
      .map((s) => ({ id: s.id, title: s.scenarioTitle, kind: "uebung" as const, turns: s.turns })),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> Alle Szenarien
      </Link>

      <div>
        <p className="text-copper mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Persönlich</p>
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">Verlauf</h1>
        <p className="text-muted-foreground mt-3 max-w-xl text-lg leading-relaxed">
          Offen, ausgewertet, denselben Moment oder ruhend. Wählen Sie den nächsten angemessenen
          Schritt — nicht die neueste Sitzung.
        </p>
      </div>

      {cards.length === 0 ? (
        <section className="glass-card rounded-[1.7rem] border p-8">
          <History className="text-copper mb-4 size-6" />
          <h2 className="font-heading text-2xl tracking-tight">Noch keine Sitzung</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Starten Sie mit dem Honorarvergleich. Danach liegen die Gespräche hier.
          </p>
          <Link href="/szenario/S01" className={cn(buttonVariants(), "mt-6 h-11 rounded-2xl px-4")}>
            Honorarvergleich öffnen
            <ArrowRight />
          </Link>
        </section>
      ) : (
        <div className="grid gap-8">
          {PRACTICE_LANES.map((lane) => {
            const inLane = cards.filter((card) => card.lane === lane);
            if (inLane.length === 0) return null;
            return <LaneSection key={lane} lane={lane} cards={inLane} />;
          })}
        </div>
      )}

      {patterns.calls >= 2 ? (
        <details className="glass-card rounded-[1.7rem] border p-5 md:p-6">
          <summary className="cursor-pointer text-sm font-medium">Was sich wiederholt</summary>
          <p className="mt-3 text-sm leading-relaxed">{patterns.reading}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {patterns.objections.slice(0, 4).map((row) => (
              <span key={row.id} className="rounded-full border border-border/70 px-2.5 py-1">
                {row.label} · {row.count}×
              </span>
            ))}
            <span className="text-muted-foreground">
              {patterns.calls} Gespräche, davon {patterns.echt} echt
            </span>
          </div>
        </details>
      ) : null}

      {history.length > 0 ? (
        <details className="text-muted-foreground text-sm">
          <summary className="cursor-pointer">Frühere Skill-Sicht</summary>
          <p className="mt-2 text-xs">
            Nur zur Einsicht. Die Übungszustände oben sind der nächste Schritt. B1 Klarheit · B2
            Zuhören · B3 Widerstand · B4 Verbindlichkeit.
          </p>
          <ul className="mt-3 grid gap-2">
            {history.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{row.title}</span>
                <span className="flex gap-2 text-[0.65rem] tracking-wide uppercase">
                  {row.skills.map((skill) => (
                    <span key={skill.id}>
                      {skill.id}{" "}
                      {skill.state === "sichtbar" ? "ok" : skill.state === "luecke" ? "Lücke" : "—"}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function LaneSection({
  lane,
  cards,
}: {
  lane: PracticeLane;
  cards: ReturnType<typeof buildPracticePipeline>;
}) {
  const headingId = `lane-${lane}`;
  return (
    <section aria-labelledby={headingId} className="grid gap-4">
      <div>
        <h2 id={headingId} className="font-heading text-2xl tracking-tight">
          {PRACTICE_LANE_LABEL[lane]}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{PRACTICE_LANE_HINT[lane]}</p>
      </div>
      <ul className="grid gap-4">
        {cards.map((card) => (
          <li key={card.rootId}>
            <Link
              href={card.href}
              aria-label={`${card.laneLabel}: ${card.counterpartName}, ${card.focusLabel}`}
              className="glass-card flex flex-col gap-3 rounded-[1.5rem] border p-5 transition hover:border-primary/25"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {card.laneLabel}
                </Badge>
                {card.lane === "denselben_moment" ? (
                  <Badge variant="secondary" className="rounded-full">
                    {card.attemptCount}× dieselbe Stelle
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl tracking-tight">{card.counterpartName}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {card.focusLabel}
                    <span className="text-muted-foreground/80">
                      {" "}
                      · {card.scenarioTitle} · {formatWhen(card.latestCreatedAt)}
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{card.hebel}</p>
                </div>
                <ArrowRight className="text-muted-foreground mt-1 size-4 shrink-0" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
