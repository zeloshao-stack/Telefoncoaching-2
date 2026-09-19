import { NextResponse } from "next/server";
import { listRealCalls, saveRealCallFromAudio, saveRealCallFromText } from "@/lib/real-calls";
import { activeVerticalId } from "@/lib/workspace";

export async function GET() {
  const verticalId = await activeVerticalId();
  return NextResponse.json({ calls: listRealCalls(verticalId) });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      title?: string;
      counterpartName?: string;
      consented?: boolean;
      transcript?: string;
      audioBase64?: string;
      mime?: string;
    };
    const verticalId = await activeVerticalId();
    if (body.audioBase64) {
      const raw = body.audioBase64.replace(/^data:[^;]+;base64,/, "");
      const call = await saveRealCallFromAudio({
        title: body.title,
        counterpartName: body.counterpartName,
        verticalId,
        audio: Buffer.from(raw, "base64"),
        mime: body.mime || "audio/webm",
        consented: Boolean(body.consented),
      });
      return NextResponse.json(call);
    }
    const call = saveRealCallFromText({
      title: body.title,
      counterpartName: body.counterpartName,
      verticalId,
      transcript: body.transcript || "",
      consented: Boolean(body.consented),
    });
    return NextResponse.json(call);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
