import { listCoachThreads, openCoachFromHandoff } from "@/lib/coach";
import { parseCoachHandoffSearchParams } from "@/lib/coach-handoff";
import { CoachWorkspace } from "@/components/training/CoachWorkspace";
import { activeVertical } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; turn?: string; focus?: string }>;
}) {
  const query = parseCoachHandoffSearchParams(await searchParams);
  const vertical = await activeVertical();
  const threads = listCoachThreads(vertical.id);
  let initialThread = null;
  let handoff = null;
  let handoffError: string | null = null;
  if (query) {
    try {
      const opened = openCoachFromHandoff(query.sessionId, query.turnId);
      initialThread = opened.thread;
      handoff = opened.handoff;
    } catch (error) {
      handoffError = error instanceof Error ? error.message : "Coach-Handoff fehlgeschlagen";
    }
  }
  return (
    <CoachWorkspace
      initialThreads={threads}
      initialThread={initialThread}
      prompts={vertical.coachPrompts}
      lead={vertical.coachLead}
      placeholder={vertical.coachPlaceholder}
      emptyHint={vertical.coachEmptyHint}
      handoff={handoff}
      anchorTurnId={handoff?.turnId ?? query?.turnId ?? null}
      handoffError={handoffError}
    />
  );
}
