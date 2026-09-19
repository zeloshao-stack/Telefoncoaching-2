import { notFound } from "next/navigation";
import { getCoachThread, listCoachThreads } from "@/lib/coach";
import { resolveCoachHandoff } from "@/lib/coach-handoff";
import { getSessionDto } from "@/lib/sessions";
import { CoachWorkspace } from "@/components/training/CoachWorkspace";
import { activeVertical } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function CoachThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vertical = await activeVertical();
  const threads = listCoachThreads(vertical.id);
  try {
    const thread = getCoachThread(id);
    let handoff = null;
    if (thread.sessionId) {
      try {
        const session = getSessionDto(thread.sessionId);
        if (session.status === "ended") handoff = resolveCoachHandoff(session);
      } catch {
        handoff = null;
      }
    }
    return (
      <CoachWorkspace
        initialThreads={threads}
        initialThread={thread}
        prompts={vertical.coachPrompts}
        lead={vertical.coachLead}
        placeholder={vertical.coachPlaceholder}
        emptyHint={vertical.coachEmptyHint}
        handoff={handoff}
        anchorTurnId={handoff?.turnId ?? null}
      />
    );
  } catch {
    notFound();
  }
}
