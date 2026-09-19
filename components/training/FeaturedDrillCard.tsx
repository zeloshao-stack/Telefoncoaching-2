import { SceneCard } from "@/components/training/SceneCard";
import type { SceneCardModel } from "@/lib/scene-card";
import type { VerticalId } from "@/lib/verticals";

export function FeaturedDrillCard({
  card,
  verticalId,
}: {
  card: SceneCardModel;
  verticalId: VerticalId;
  sessionCountLabel?: string;
}) {
  return <SceneCard card={card} verticalId={verticalId} featured />;
}
