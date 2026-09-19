import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { MicGate } from "@/components/training/MicGate";
import { SceneGoals } from "@/components/training/SceneGoals";
import { StartSessionButton } from "@/components/training/StartSessionButton";
import { SCENARIO_BLURBS, SCENARIO_COUNTERPARTS, type FrozenScenarioId } from "@/lib/content/pack";
import { getScenario } from "@/lib/scenarios";
import { toSceneBriefing, trainingPageSurface } from "@/lib/scene-briefing";
import { activeVertical } from "@/lib/workspace";

export default async function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();
  const vertical = await activeVertical();
  const blurb = SCENARIO_BLURBS[scenario.id as FrozenScenarioId];
  const briefing = toSceneBriefing({
    id: scenario.id,
    title: scenario.title,
    publicBrief: scenario.public_brief,
    acceptableOutcome: scenario.acceptable_outcome,
    knowledgeCardIds: scenario.knowledge_card_ids,
    guide: scenario.guide,
    blurb,
    draft: Boolean(scenario.private_state.draft),
    verticalId: vertical.id,
  });
  if (!briefing) notFound();
  const surface = trainingPageSurface(briefing);

  return (
    <div>
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> Alle Szenarien
      </Link>

      <div className="briefing-layout"><div><header className="flex items-start justify-between gap-3">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">{surface.title}</h1>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/80 px-2.5 py-0.5 text-xs">
          <Phone className="size-3" aria-hidden />
          Telefonat
        </span>
      </header>

      <p data-testid="scene-brief" className="briefing-story">{surface.scene}</p>
      <section className="briefing-objective">
        <p className="text-copper text-[0.7rem] font-semibold tracking-[0.16em] uppercase">Ziel des Trainings</p>
        <p data-testid="scene-goal" className="mt-2 text-base leading-relaxed">
          {surface.goal}
        </p>
      </section>

      <p data-testid="scene-notice" className="text-muted-foreground mt-6 text-sm">
        {surface.notice}
      </p>
      </div><aside className="briefing-sidebar"><p className="eyebrow">Ihr Gegenüber</p><p className="mt-3 mb-6 text-lg font-semibold">{SCENARIO_COUNTERPARTS[id as FrozenScenarioId] || scenario.title}</p><p className="eyebrow">Darauf kommt es an</p><SceneGoals goals={surface.goals} />
      <MicGate />
      <StartSessionButton scenarioId={scenario.id} verticalId={vertical.id} focusPicker={false} />
      <p className="mt-4 text-sm text-muted-foreground">Sprechen Sie frei. Es gibt keinen vorgeschriebenen Gesprächsverlauf.</p></aside></div>
    </div>
  );
}
