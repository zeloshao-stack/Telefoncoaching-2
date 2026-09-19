import { NextResponse } from "next/server";
import { ingestCall } from "@/lib/call-store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      counterpartName?: string;
      consentedRecording?: boolean;
      consentedClone?: boolean;
      consentedSynthetic?: boolean;
      audioBase64?: string;
      mime?: string;
    };
    const raw = (body.audioBase64 || "").replace(/^data:[^;]+;base64,/, "");
    const audio = Buffer.from(raw, "base64");
    const result = await ingestCall({
      counterpartName: body.counterpartName || "",
      consentedRecording: Boolean(body.consentedRecording),
      consentedClone: Boolean(body.consentedClone),
      consentedSynthetic: Boolean(body.consentedSynthetic),
      audio,
      mime: body.mime || "audio/webm",
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
