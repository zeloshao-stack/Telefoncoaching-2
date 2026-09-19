import { NextResponse } from "next/server";
import { customCard, listCustomVoices, voiceBankCount } from "@/lib/voice-bank";
import { countLocalSamples, installedPiperModels } from "@/lib/tts-local";
import { resolveVoice, synthesizeSpeech, ttsStatus } from "@/lib/tts";
import { publicCard, SEED_VOICES, type ElevenDelivery, type VoiceMood } from "@/lib/voices";

export async function GET() {
  const status = ttsStatus();
  const byId = new Map<string, ReturnType<typeof publicCard>>();
  for (const seed of SEED_VOICES) byId.set(seed.id, publicCard(seed));
  for (const row of listCustomVoices()) byId.set(row.id, customCard(row));
  return NextResponse.json({
    ...status,
    bankCount: voiceBankCount(),
    sampleCount: countLocalSamples(),
    piperModels: installedPiperModels().length,
    voices: [...byId.values()],
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; voiceId?: string; mood?: VoiceMood; delivery?: ElevenDelivery };
    const voiceId = body.voiceId?.trim() || "";
    let spec;
    try {
      spec = resolveVoice(voiceId);
    } catch {
      return NextResponse.json({ error: "Stimme fehlt oder ist unbekannt." }, { status: 400 });
    }
    if (!ttsStatus().available) {
      return NextResponse.json(
        {
          error:
            "Keine Stimme. Einmal npm run tts:setup (gratis lokal), oder CARTESIA_API_KEY / ELEVENLABS_API_KEY / AZURE_SPEECH_KEY in .env.",
          fallback: false,
          needsKey: true,
          voice: publicCard(spec),
        },
        { status: 503 },
      );
    }
    const result = await synthesizeSpeech(voiceId, body.text || "", body.mood, body.delivery);
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
