import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { StartSessionButton } from "@/components/training/StartSessionButton";
import { SceneGoals } from "@/components/training/SceneGoals";
import type { SceneCardModel } from "@/lib/scene-card";
import { secondaryDrillHref } from "@/lib/scene-card";
import type { VerticalId } from "@/lib/verticals";
export function SceneCard({ card, verticalId, featured = false }: { card: SceneCardModel; verticalId: VerticalId; featured?: boolean }) {
  return <article className="scenario-card" data-testid={featured ? "featured-drill" : "scene-card"} data-scene-id={card.id}>
    <div className="scenario-meta"><span>{card.id.replace("S", "Fall ")}</span><span><Phone size={13} /> {card.channelLabel}</span></div>
    <h3><Link href={secondaryDrillHref(card.id)}>{card.title}</Link></h3>
    <p className="scenario-challenge">{card.challenge}</p>
    <div className="scenario-person"><span className="person-initials" data-testid="scene-initials">{card.initials}</span><div><strong>{card.name}</strong><span>{card.roleChip}</span></div></div>
    <div className="scenario-goals"><p className="eyebrow">Das üben Sie</p><SceneGoals goals={card.goals} focusLine={card.focusLine} /></div>
    <div className="scenario-actions"><Link href={secondaryDrillHref(card.id)} className="briefing-link">Briefing lesen <ArrowUpRight size={16} /></Link><StartSessionButton scenarioId={card.id} verticalId={verticalId} focusPicker={false} /></div>
  </article>;
}
