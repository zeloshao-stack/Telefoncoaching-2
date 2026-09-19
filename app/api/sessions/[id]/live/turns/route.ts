import { NextResponse } from "next/server";
import { appendLiveTraineeTurn, appendLiveUtterance } from "@/lib/sessions";

const dev = process.env.NODE_ENV !== "production";

/**
 * Transkript-Zug aus der Live-Leitung. Antwort ist die Sitzung; bei Trainee-Zügen zusätzlich
 * `live.instructions` (für session.update), wenn sich Register oder Auflege-Neigung verschoben haben.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { speaker?: string; text?: string };
    if (body.speaker === "counterpart") {
      return NextResponse.json(appendLiveUtterance(id, "counterpart", body.text ?? ""));
    }
    const result = appendLiveTraineeTurn(id, body.text ?? "");
    if (dev && result.instructions) {
      console.info(
        `live: Instructions erneuert (${result.instructions.length} Zeichen)` +
          (result.hangup ? ` — Auflegen: ${result.hangup.reason} (${result.hangup.trigger ?? "-"})` : ""),
      );
    }
    return NextResponse.json({
      ...result.session,
      live: { instructions: result.instructions, hangup: result.hangup },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
