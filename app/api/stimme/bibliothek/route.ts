import { NextResponse } from "next/server";
import { fillVoiceBank } from "@/lib/voice-library";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { limit?: number };
    const result = await fillVoiceBank(Math.min(40, Math.max(4, body.limit ?? 20)));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
