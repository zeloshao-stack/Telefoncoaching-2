import { NextResponse } from "next/server";
import { isHangupReason } from "@/lib/openai-realtime";
import { hangUp, type HangupInfo } from "@/lib/sessions";

/** Ohne Body: der Trainee legt auf. Mit `by: "counterpart"`: die Figur hat per end_call aufgelegt. */
async function readHangupInfo(req: Request): Promise<HangupInfo> {
  try {
    const body = (await req.json()) as { by?: string; reason?: string; last_line?: string } | null;
    if (body?.by !== "counterpart") return {};
    return {
      by: "counterpart",
      reason: isHangupReason(body.reason) ? body.reason : undefined,
      lastLine: typeof body.last_line === "string" ? body.last_line : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const info = await readHangupInfo(req);
    const session = await hangUp(id, req.signal, info);
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
