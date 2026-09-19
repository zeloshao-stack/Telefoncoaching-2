import { NextResponse } from "next/server";
import { createSessionFromRealCall } from "@/lib/sessions";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { momentTurnId?: string; focusId?: string };
    const session = createSessionFromRealCall(id, body.momentTurnId, body.focusId);
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
