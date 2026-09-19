import { NextResponse } from "next/server";
import { repeatSession } from "@/lib/sessions";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { fromTurnId?: string };
    const fromTurnId = typeof body.fromTurnId === "string" ? body.fromTurnId : undefined;
    const session = repeatSession(id, fromTurnId);
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
