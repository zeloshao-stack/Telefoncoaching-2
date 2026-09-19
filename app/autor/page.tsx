import Link from "next/link";
import { AuthorEditor } from "@/components/training/AuthorEditor";
import { NewScenarioButton } from "@/components/training/NewScenarioButton";
import { ScenarioGenerator } from "@/components/training/ScenarioGenerator";
import { getAuthored, listAuthored } from "@/lib/authored";

export const dynamic = "force-dynamic";

export default async function AutorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const current = id ? getAuthored(id) : undefined;
  const all = listAuthored();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <p className="text-copper mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
          Als Nächstes · Gespräch vorbereiten
        </p>
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">Skript und Roleplay</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
          Lage schildern, Orientierung bekommen, dann gegen eine Figur üben. Der Trainee sieht Briefing und
          Leitfaden — nicht den verdeckten Zustand.
        </p>
      </div>

      <ScenarioGenerator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-2">
          {all.map((scenario) => {
            const active = scenario.id === current?.id;
            return (
              <li key={scenario.id}>
                <Link
                  href={`/autor?id=${scenario.id}`}
                  className={`inline-flex rounded-full border px-3 py-1 text-sm ${
                    active ? "border-primary/30 bg-background" : "border-border text-muted-foreground"
                  }`}
                >
                  {scenario.title || scenario.id}
                </Link>
              </li>
            );
          })}
        </ul>
        <NewScenarioButton />
      </div>

      {current ? (
        <>
          <AuthorEditor key={current.id} initial={current} />
          <p className="text-muted-foreground text-xs">
            Nach dem Speichern liegt der Fall unter Üben. Briefing:{" "}
            <Link href={`/szenario/${current.id}`} className="text-primary underline">
              {current.title} öffnen
            </Link>
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-sm leading-relaxed">
          Nach dem Erzeugen erscheinen Leitfaden, öffentliche Akte und verdeckte Figur hier. Bestehende Fälle
          öffnen Sie über die Liste.
        </p>
      )}
    </div>
  );
}
