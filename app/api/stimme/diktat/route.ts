import { NextResponse } from "next/server";
import { decodeDictationAudio, transcribeDictation } from "@/lib/dictate";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { audioBase64?: string; mime?: string };
    const audio = decodeDictationAudio(body.audioBase64 || "");
    const text = await transcribeDictation(audio, body.mime || "audio/webm");
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
