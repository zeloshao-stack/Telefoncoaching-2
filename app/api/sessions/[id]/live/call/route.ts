import { NextResponse } from "next/server";
import { LiveCallBusyError, registerLiveCall, releaseLiveCall } from "@/lib/live-session";

async function readCallBody(req: Request) {
  try {
    const body = (await req.json()) as { call_id?: string; previous_call_id?: string } | null;
    const callId = typeof body?.call_id === "string" && body.call_id.trim() ? body.call_id.trim() : null;
    const previousCallId =
      typeof body?.previous_call_id === "string" && body.previous_call_id.trim()
        ? body.previous_call_id.trim()
        : null;
    return { callId, previousCallId };
  } catch {
    return { callId: null, previousCallId: null };
  }
}

/** Anruf anmelden oder Heartbeat (alle ~20 s). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { callId, previousCallId } = await readCallBody(req);
    if (!callId) return NextResponse.json({ error: "call_id fehlt" }, { status: 400 });
    registerLiveCall(id, callId, previousCallId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof LiveCallBusyError ? 409 : 400;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status });
  }
}

/** Auflegen: call_id wieder freigeben (best effort). */
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { callId } = await readCallBody(req);
    releaseLiveCall(id, callId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
