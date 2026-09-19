import { NextResponse } from "next/server";
import { createCoachThread, listCoachThreads } from "@/lib/coach";
import { activeVerticalId } from "@/lib/workspace";

export async function GET() {
  return NextResponse.json(listCoachThreads(await activeVerticalId()));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const thread = createCoachThread({
      sessionId: body.sessionId,
      verticalId: await activeVerticalId(),
    });
    return NextResponse.json(thread);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
