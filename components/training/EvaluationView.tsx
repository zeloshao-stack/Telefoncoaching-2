"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { ChevronDown, MessageCircle, Repeat2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeCall } from "@/lib/call-analytics";
import { DIMENSION_LABELS } from "@/lib/content/pack";
import { coachHandoffHref } from "@/lib/coach-handoff";
import {
  debriefScoreLabel,
  debriefTurnDomId,
  isNotAssessable,
  jumpToDebriefTurn,
  resolveDebriefMoment,
} from "@/lib/debrief-moments";
import type { EvaluationComparison } from "@/lib/evaluation";
import { getFocus } from "@/lib/focus";
import { fallbackRepeatTurnId } from "@/lib/practice-loop";
import type { SessionDTO } from "@/lib/session-types";
import { cn } from "@/lib/utils";
import { DEFAULT_VERTICAL, isVerticalId } from "@/lib/verticals";
import type { DimensionScore } from "@/src/role-engine/types";

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">{children}</p>;
}

function jumpFromHero(turnId: string | null, event: MouseEvent<HTMLAnchorElement>) {
  if (!turnId) return;
  const jumped = jumpToDebriefTurn(turnId, {
    getElementById: (id) => document.getElementById(id),
    replaceHash: (hash) => {
      history.replaceState(null, "", hash);
    },
  });
  if (jumped) event.preventDefault();
}

function endedHeading(session: SessionDTO): string {
  const system = [...session.turns].reverse().find((turn) => turn.speaker === "system");
  const text = system?.text?.trim() ?? "";
  if (/Sie haben aufgelegt/i.test(text)) return "Sie haben aufgelegt";
  if (/hat aufgelegt/i.test(text)) return `${session.counterpartName} hat aufgelegt`;
  return "Gespräch beendet";
}

/** Auflege-Grund aus der Protokollzeile — sichtbar für den Trainee, nicht versteckt im State. */
function hangupReasonLine(session: SessionDTO): string | null {
  const system = [...session.turns].reverse().find((turn) => turn.speaker === "system");
  const text = system?.text?.trim() ?? "";
  const match = text.match(/hat aufgelegt\s*[—–-]\s*(.+)$/i);
  return match?.[1]?.trim() || null;
}

function focusDimensionScore(session: SessionDTO, scores: DimensionScore[]): DimensionScore | undefined {
  const vertical = isVerticalId(session.verticalId) ? session.verticalId : DEFAULT_VERTICAL;
  const focus = getFocus(vertical, session.focusId);
  return scores.find((score) => score.dimension === focus.dimension);
}

async function fetchEvaluationPage(
  sessionId: string,
): Promise<{ session: SessionDTO; comparison: EvaluationComparison | null }> {
  const res = await fetch(`/api/sessions/${sessionId}`);
  const data = (await res.json()) as SessionDTO & { error?: string };
  if (!res.ok) throw new Error(data.error || "Nicht gefunden");
  let comparison: EvaluationComparison | null = null;
  if (data.evaluation) {
    const cmp = await fetch(`/api/sessions/${sessionId}/evaluation`);
    if (cmp.ok) {
      const payload = (await cmp.json()) as { comparison: EvaluationComparison | null };
      comparison = payload.comparison ?? null;
    }
  }
  return { session: data, comparison };
}

export function EvaluationView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [comparison, setComparison] = useState<EvaluationComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reevaluating, setReevaluating] = useState(false);

  function load() {
    return fetchEvaluationPage(sessionId).then(({ session: next, comparison: cmp }) => {
      setSession(next);
      setComparison(cmp);
    });
  }

  useEffect(() => {
    let cancelled = false;
    fetchEvaluationPage(sessionId)
      .then(async ({ session: next, comparison: cmp }) => {
        if (cancelled) return;
        // Auflegen hat beendet, Auswertung noch nicht da (z. B. Client-Abort während /end).
        if (next.status === "ended" && !next.evaluation) {
          setSession(next);
          setReevaluating(true);
          try {
            const res = await fetch(`/api/sessions/${sessionId}/evaluation`, { method: "POST" });
            if (!res.ok) {
              const err = (await res.json()) as { error?: string };
              throw new Error(err.error || "Auswertung fehlgeschlagen");
            }
            if (cancelled) return;
            const refreshed = await fetchEvaluationPage(sessionId);
            if (cancelled) return;
            setSession(refreshed.session);
            setComparison(refreshed.comparison);
          } catch (e) {
            if (!cancelled) setError(e instanceof Error ? e.message : "Auswertung fehlgeschlagen");
          } finally {
            if (!cancelled) setReevaluating(false);
          }
          return;
        }
        setSession(next);
        setComparison(cmp);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function repeat(fromTurnId?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/repeat`, {
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

  async function reevaluate() {
    setReevaluating(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/evaluation`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Neu bewerten nicht möglich");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setReevaluating(false);
    }
  }

  if (error && !session) {
    return (
      <div className="glass-card mx-auto max-w-lg rounded-3xl border p-8 text-center">
        <h1 className="font-heading text-2xl">Auswertung fehlt</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        <Link href="/" className="text-primary mt-4 inline-block text-sm underline">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-3">
        <div className="bg-secondary h-10 w-64 rounded-full" />
        <div className="glass-card h-64 rounded-3xl border" />
        <p className="text-muted-foreground text-sm">Auswertung wird gelegt…</p>
      </div>
    );
  }

  if (session.status !== "ended") {
    return (
      <div className="glass-card mx-auto max-w-lg rounded-3xl border p-8 text-center">
        <h1 className="font-heading text-2xl">Noch kein Ende</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Legen Sie zuerst auf oder führen Sie das Gespräch zu Ende. Die Bewertung startet erst danach.
        </p>
        <Link href={`/sitzung/${sessionId}`} className="text-primary mt-4 inline-block text-sm underline">
          Zurück ins Gespräch
        </Link>
      </div>
    );
  }

  // Beendet, aber keine Bewertung — ehrlich bleiben, nicht ewig „wird gelegt“ vortäuschen.
  if (!session.evaluation && !reevaluating) {
    return (
      <div className="glass-card mx-auto max-w-lg rounded-3xl border p-8 text-center">
        <h1 className="font-heading text-2xl">{endedHeading(session)}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {error
            ? `Die Auswertung ist fehlgeschlagen: ${error}`
            : "Das Gespräch ist beendet, die Auswertung liegt noch nicht vor."}
        </p>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Keine Fake-Noten. Sie können die Bewertung nachziehen oder denselben Moment später üben.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button onClick={() => void reevaluate()} disabled={busy} className="h-11 rounded-2xl px-5">
            <RefreshCw />
            Auswertung nachziehen
          </Button>
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
            Zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  if (!session.evaluation || reevaluating) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-3">
        <div className="bg-secondary h-10 w-64 rounded-full" />
        <div className="glass-card h-64 rounded-3xl border" />
        <p className="text-muted-foreground text-sm">Auswertung wird gelegt…</p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    );
  }

  const ev = session.evaluation;
  const spokenTurns = session.turns.filter((t) => t.speaker !== "system");
  const analytics = analyzeCall(session.turns);
  const hangupReason = hangupReasonLine(session);
  const moment = resolveDebriefMoment(session.turns, ev);
  const nextLine = ev.nextLine?.trim() || analytics.suggestedLine;
  const nextStep = ev.nextStep?.trim() || "";
  const noContribution = isNotAssessable(ev);
  const scored = ev.scores.filter((s) => s.score != null);
  const abstained = ev.scores.filter((s) => s.score == null);
  const focusScore = focusDimensionScore(session, ev.scores);
  const repeatFromTurnId = fallbackRepeatTurnId(session.turns, moment.turnId);
  const showStrength = !noContribution && ev.strengthTurnId !== null;
  const strengthTurn = ev.strengthTurnId ? spokenTurns.find((t) => t.id === ev.strengthTurnId) : undefined;
  const momentHref = moment.turnId ? `#${debriefTurnDomId(moment.turnId)}` : undefined;
  const coachHref = coachHandoffHref({ sessionId: session.id, turnId: moment.turnId, focusId: session.focusId });

  // Belegte Stellen im Transkript: Turn → Dimensionen, die sich darauf stützen
  const evidenceByTurn = new Map<string, string[]>();
  if (strengthTurn) evidenceByTurn.set(strengthTurn.id, ["Stärke"]);
  for (const score of ev.scores) {
    if (score.score == null) continue;
    for (const id of score.evidenceTurnIds) {
      const list = evidenceByTurn.get(id) ?? [];
      list.push(DIMENSION_LABELS[score.dimension] ?? score.dimension);
      evidenceByTurn.set(id, list);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <section data-debrief="hero" className="glass-card rounded-[1.7rem] border p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {ev.engine === "openai" ? "Modellauswertung" : "Regel-Auswertung"}
          </Badge>
        </div>
        <h1 className="font-heading mt-4 text-4xl tracking-tight">{endedHeading(session)}</h1>
        {hangupReason ? (
          <p className="text-copper mt-2 text-sm font-medium leading-relaxed">Grund: {hangupReason}</p>
        ) : null}

        {noContribution ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-background/60 px-4 py-3 text-sm leading-relaxed">
            Kein bewertbarer eigener Beitrag — keine Noten. Üben Sie denselben Moment mit einem klaren Satz.
          </p>
        ) : (
          <p className="mt-4 text-base leading-relaxed">
            <span className="font-medium">{session.focusLabel}:</span>{" "}
            <span className="tabular-nums">{debriefScoreLabel(focusScore?.score ?? null)}</span>
            <span className="text-muted-foreground mt-2 block">{ev.summary}</span>
          </p>
        )}
        {!noContribution && ev.calibration?.note ? (
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{ev.calibration.note}</p>
        ) : null}

        {moment.clickable && momentHref ? (
          <a
            data-debrief="quote"
            href={momentHref}
            onClick={(event) => jumpFromHero(moment.turnId, event)}
            className="border-copper/40 mt-5 block rounded-2xl border border-l-2 bg-background/40 px-4 py-3 text-left no-underline transition hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Kicker>{noContribution ? "Die Stelle" : "Schlüsselmoment"}</Kicker>
            {moment.quote ? (
              <blockquote className="mt-2">
                <p className="text-lg leading-relaxed">„{moment.quote}“</p>
                <footer className="text-muted-foreground mt-2 text-xs">
                  {moment.isTrainee ? "Sie sagten" : session.counterpartName} · zur Zeile springen
                </footer>
              </blockquote>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">Zur markierten Stelle im Transkript</p>
            )}
          </a>
        ) : (
          <div className="mt-5">
            <Kicker>{noContribution ? "Die Stelle" : "Schlüsselmoment"}</Kicker>
            <p className="text-muted-foreground mt-2 text-base leading-relaxed">
              {moment.quote
                ? `„${moment.quote}“`
                : `Kein eigener Beitrag im Transkript — ${session.counterpartName} hat gesprochen, Sie nicht.`}
            </p>
          </div>
        )}
        {moment.whatHappened ? <p className="mt-4 text-base leading-relaxed">{moment.whatHappened}</p> : null}
        {moment.counterfactual ? (
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            <span className="text-foreground font-medium">{session.counterpartName}:</span> „{moment.counterfactual}“
          </p>
        ) : null}

        {showStrength ? (
          <div className="mt-5 border-t border-border/60 pt-4">
            <Kicker>Was gelungen ist</Kicker>
            {strengthTurn ? (
              <blockquote className="border-copper/40 mt-2 border-l-2 pl-4 text-sm leading-relaxed">
                „{strengthTurn.text}“
              </blockquote>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed">{ev.strength}</p>
          </div>
        ) : null}

        {nextStep ? (
          <div className="mt-5">
            <Kicker>Nächstes Mal so</Kicker>
            <p className="mt-2 text-lg leading-relaxed">{nextStep}</p>
          </div>
        ) : null}
        {nextLine ? (
          <details className="group mt-3">
            <summary className="text-muted-foreground flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
              Beispielsatz (nach Ihrem Versuch)
              <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed">„{nextLine}“</p>
          </details>
        ) : null}

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:items-start">
          <Button
            onClick={() => void repeat(repeatFromTurnId ?? undefined)}
            disabled={busy}
            className="h-12 rounded-2xl px-6"
          >
            <Repeat2 />
            Jetzt denselben Moment nochmal
          </Button>
          <Link
            data-debrief="coach"
            href={coachHref}
            className="text-muted-foreground hover:text-foreground inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium hover:bg-muted"
          >
            <MessageCircle className="size-4" />
            Drill mit dem Coach
          </Link>
        </div>
      </section>

      <section data-debrief="transcript" className="glass-card rounded-[1.7rem] border p-5 md:p-6">
        <Kicker>Transkript</Kicker>
        <p className="text-muted-foreground mt-1 text-xs">
          Schlüsselmoment und belegte Stellen sind markiert. Kein verdeckter Zustand.
        </p>
        <ol className="mt-4 space-y-3">
          {session.turns.map((turn) => {
            if (turn.speaker === "system") {
              return (
                <li
                  key={turn.id}
                  id={debriefTurnDomId(turn.id)}
                  className="text-muted-foreground scroll-mt-24 px-4 py-1 text-center text-xs italic leading-relaxed"
                >
                  {turn.text}
                </li>
              );
            }
            const isMoment = turn.id === moment.turnId;
            const evidence = evidenceByTurn.get(turn.id) ?? [];
            return (
              <li
                key={turn.id}
                id={debriefTurnDomId(turn.id)}
                tabIndex={-1}
                data-debrief-turn={turn.id}
                data-debrief-moment={isMoment ? "true" : undefined}
                className={cn(
                  "scroll-mt-24 rounded-2xl px-4 py-3 text-sm leading-relaxed outline-none target:ring-2 target:ring-primary/50",
                  isMoment
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : evidence.length
                      ? "bg-background/80 ring-1 ring-border"
                      : "bg-background/60",
                )}
              >
                <p className="flex flex-wrap items-baseline gap-x-2 text-[0.65rem] font-semibold tracking-wider uppercase opacity-70">
                  <span>{turn.speaker === "trainee" ? "Sie" : session.counterpartName}</span>
                  {isMoment ? <span className="text-copper">· Schlüsselmoment</span> : null}
                  {evidence.length ? (
                    <span className="text-muted-foreground normal-case tracking-normal">
                      · Beleg für {evidence.join(", ")}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1">{turn.text}</p>
                {turn.speaker === "trainee" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void repeat(turn.id)}
                    className="text-primary mt-2 text-xs underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Ab hier üben
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <details className="glass-card group rounded-[1.7rem] border p-5 md:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
          <span>
            Rubrik 0–4
            <span className="text-muted-foreground ml-2 font-normal">
              {scored.length} bewertet · {abstained.length} N/A
            </span>
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
          Jede Note stützt sich auf Ihren eigenen Wortlaut. {ev.abstainNote ?? ""}
        </p>
        <div className="mt-4 grid gap-3">
          {[...scored, ...abstained].map((score) => (
            <ScoreCard key={score.dimension} score={score} />
          ))}
        </div>
        {ev.mustNotice.length ? (
          <ul className="text-muted-foreground mt-5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {ev.mustNotice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </details>

      {comparison ? (
        <details className="glass-card group rounded-[1.7rem] border p-5 md:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
            Gegenüber der letzten Sitzung
            <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed">{comparison.reading}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {comparison.dimensions
              .filter((d) => d.before !== null || d.after !== null)
              .map((d) => (
                <li key={d.dimension} className="rounded-2xl border border-border/70 bg-background/50 px-3 py-2 text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                    {debriefScoreLabel(d.before)} → {debriefScoreLabel(d.after)}
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-muted-foreground mt-3 text-xs">
            <Link href={`/sitzung/${comparison.previousSessionId}/auswertung`} className="underline-offset-2 hover:underline">
              Letzte Sitzung öffnen
            </Link>{" "}
            · {new Date(comparison.previousCreatedAt).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </details>
      ) : null}

      {/* Eingeklappt: Gesprächsbeobachtung (Kontext, keine Note) */}
      <details className="glass-card group rounded-[1.7rem] border p-5 md:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
          Gesprächsbeobachtung (Kontext, keine Note)
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{analytics.shareReading}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { k: "Eigene Beiträge", v: `${analytics.traineeTurns}` },
            { k: "Offene Fragen", v: String(analytics.openQuestions) },
            { k: "Längster Beitrag", v: `${analytics.longestTraineeWords} Wörter` },
          ].map((item) => (
            <div key={item.k} className="rounded-2xl border border-border/70 bg-background/60 p-3">
              <dt className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">{item.k}</dt>
              <dd className="mt-1 text-sm font-medium">{item.v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {analytics.skills.map((skill) => (
            <li key={skill.id} className="rounded-2xl border border-border/70 bg-background/50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{skill.label}</p>
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
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{skill.evidence}</p>
            </li>
          ))}
        </ul>
        {session.heard.length > 0 ? (
          <>
            <p className="text-muted-foreground mt-5 text-xs leading-relaxed">
              Was {session.counterpartName} in Ihren Sätzen gehört hat — nach dem Auflegen, nicht als Flüstern im Ohr.
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {session.heard.map((cue) => (
                <li key={cue.type} className="rounded-2xl border border-border/70 bg-background/50 p-3">
                  <p className="text-sm font-medium">{cue.label}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">„{cue.evidence}“</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </details>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          data-debrief="coach-recap"
          href={coachHref}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Recap mit dem Coach
        </Link>
        <Button
          variant="ghost"
          onClick={() => void reevaluate()}
          disabled={reevaluating || busy}
          className="h-11 rounded-2xl px-5"
        >
          <RefreshCw className={cn(reevaluating && "animate-spin")} />
          {reevaluating ? "Wird neu bewertet…" : "Neu bewerten"}
        </Button>
        {session.realCallId ? (
          <Link
            href={`/gespraeche/${session.realCallId}`}
            className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center px-2 text-sm"
          >
            Zurück zum echten Gespräch
          </Link>
        ) : (
          <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center px-2 text-sm">
            Anderes Szenario
          </Link>
        )}
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

function ScoreCard({ score }: { score: DimensionScore }) {
  const label = DIMENSION_LABELS[score.dimension] ?? score.dimension;
  const abstained = score.score == null;
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 p-4",
        abstained ? "bg-background/30" : "bg-background/50",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={cn("font-medium", abstained && "text-muted-foreground")}>{label}</h3>
        <span className={cn("text-sm tabular-nums", abstained && "text-muted-foreground")}>{debriefScoreLabel(score.score)}</span>
      </div>
      {!abstained && score.quote ? (
        <blockquote className="border-copper/40 mt-3 border-l-2 pl-3 text-sm leading-relaxed">„{score.quote}“</blockquote>
      ) : null}
      <p className={cn("mt-2 text-sm leading-relaxed", abstained && "text-muted-foreground text-xs")}>{score.rationale}</p>
    </article>
  );
}
