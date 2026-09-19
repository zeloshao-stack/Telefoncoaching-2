import { NextResponse } from "next/server";
import { appendCoachTurn } from "@/lib/coach";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { text?: string };
    if (!body.text) {
      return NextResponse.json({ error: "Frage fehlt." }, { status: 400 });
    }
    const thread = await appendCoachTurn(id, body.text, req.signal);
    return NextResponse.json(thread);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
