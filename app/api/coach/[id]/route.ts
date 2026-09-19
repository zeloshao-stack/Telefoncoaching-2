import { NextResponse } from "next/server";
import { getCoachThread } from "@/lib/coach";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    return NextResponse.json(getCoachThread(id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 404 });
  }
}
