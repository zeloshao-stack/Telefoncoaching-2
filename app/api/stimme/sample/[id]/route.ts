import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCustomVoice } from "@/lib/voice-bank";
import { localSampleDir } from "@/lib/tts-local";
import { getSeedVoice } from "@/lib/voices";
import { synthesizeSpeech } from "@/lib/tts";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const voiceId = id?.trim();
  if (!voiceId) {
    return NextResponse.json({ error: "Stimme fehlt" }, { status: 400 });
  }

  const custom = getCustomVoice(voiceId);
  const candidates = [
    custom?.sample_path,
    path.join(localSampleDir(), `${voiceId}.wav`),
  ].filter(Boolean) as string[];

  for (const file of candidates) {
    try {
      if (fs.existsSync(file) && fs.statSync(file).size > 64) {
        const audio = fs.readFileSync(file);
        const type = file.endsWith(".mp3") ? "audio/mpeg" : "audio/wav";
        return new Response(new Uint8Array(audio), {
          headers: {
            "Content-Type": type,
            "Cache-Control": "private, max-age=86400",
            "X-Voice-Id": voiceId,
            "X-Tts-Provider": "sample",
          },
        });
      }
    } catch {
      /* next */
    }
  }

  const seed = getSeedVoice(voiceId);
  const text = seed?.sample || "Grüß Gott.";
  try {
    const result = await synthesizeSpeech(voiceId, text);
    try {
      fs.mkdirSync(localSampleDir(), { recursive: true });
      fs.writeFileSync(path.join(localSampleDir(), `${voiceId}.wav`), result.audio);
    } catch {
      /* ignore */
    }
    return new Response(new Uint8Array(result.audio), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Voice-Id": voiceId,
        "X-Tts-Provider": result.provider,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
