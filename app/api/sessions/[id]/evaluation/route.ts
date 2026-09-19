import { NextResponse } from "next/server";
import { compareWithPrevious, reevaluateSession } from "@/lib/evaluation";
import { getSessionDto } from "@/lib/sessions";

/** Auswertung samt Vergleich zur letzten Sitzung im selben Szenario. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const session = getSessionDto(id);
    return NextResponse.json({
      evaluation: session.evaluation,
      comparison: session.evaluation ? compareWithPrevious(id) : null,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 404 });
  }
}

/** Auswertung neu legen — nur für beendete Sitzungen. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await reevaluateSession(id, req.signal);
    return NextResponse.json(getSessionDto(id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
