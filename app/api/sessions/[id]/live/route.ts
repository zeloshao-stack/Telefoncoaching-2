import { NextResponse } from "next/server";
import { LiveCallBusyError, mintLiveClientSecret } from "@/lib/live-session";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    let ownCallId: string | null = null;
    try {
      const body = (await req.json()) as { own_call_id?: string } | null;
      ownCallId = typeof body?.own_call_id === "string" ? body.own_call_id : null;
    } catch {
      /* kein Body — normaler Erstaufruf */
    }
    const token = await mintLiveClientSecret(id, ownCallId);
    return NextResponse.json({ value: token.value, claim_id: token.claim_id });
  } catch (e) {
    const status = e instanceof LiveCallBusyError ? 409 : 400;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Live-Leitung fehlgeschlagen" },
      { status },
    );
  }
}
