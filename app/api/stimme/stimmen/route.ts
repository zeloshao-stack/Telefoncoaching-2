import { NextResponse } from "next/server";
import { cloneWithElevenLabs, ttsStatus } from "@/lib/tts";
import { saveCustomVoice } from "@/lib/voice-bank";
import type { VoiceAge, VoiceGender, VoiceLocale } from "@/lib/voices";

const MAX_BYTES = 10_000_000;

function isGender(value: string): value is VoiceGender {
  return value === "female" || value === "male";
}

function isAge(value: string): value is VoiceAge {
  return value === "young" || value === "mid" || value === "older";
}

function isLocale(value: string): value is VoiceLocale {
  return value === "de-AT" || value === "de-DE" || value === "de-CH";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      role?: string;
      region?: string;
      gender?: string;
      ageBand?: string;
      locale?: string;
      consent?: string;
      callId?: string;
      audioBase64?: string;
      mime?: string;
    };
    if (body.consent !== "own" && body.consent !== "counterpart") {
      return NextResponse.json(
        { error: "Klon nur mit Einwilligung: eigene Stimme oder Gegenseite mit den drei Häkchen." },
        { status: 400 },
      );
    }
    if (body.consent === "counterpart") {
      if (!body.callId) {
        return NextResponse.json({ error: "Gesprächs-ID fehlt." }, { status: 400 });
      }
      const { assertCallAllowsClone } = await import("@/lib/call-store");
      assertCallAllowsClone(body.callId);
    }
    const name = body.name?.trim() || "";
    if (name.length < 2) {
      return NextResponse.json({ error: "Name der Stimme fehlt." }, { status: 400 });
    }
    const gender = body.gender || "";
    const ageBand = body.ageBand || "";
    const locale = body.locale || "";
    if (!isGender(gender) || !isAge(ageBand) || !isLocale(locale)) {
      return NextResponse.json({ error: "Geschlecht, Alter oder Region ungültig." }, { status: 400 });
    }
    const raw = (body.audioBase64 || "").replace(/^data:[^;]+;base64,/, "");
    const audio = Buffer.from(raw, "base64");
    if (!audio.length) {
      return NextResponse.json({ error: "Keine Aufnahme." }, { status: 400 });
    }
    if (audio.length > MAX_BYTES) {
      return NextResponse.json({ error: "Aufnahme zu groß. Bitte kürzer (unter 90 Sekunden)." }, { status: 400 });
    }

    const mime = body.mime || "audio/webm";
    const elevenVoiceId = await cloneWithElevenLabs(name, audio, mime);
    const saved = saveCustomVoice({
      name,
      role: body.role?.trim() || "Eigene Stimme",
      region: body.region?.trim() || "Wien",
      gender,
      ageBand,
      locale,
      consent: body.consent,
      audio,
      mime,
      elevenVoiceId,
    });
    return NextResponse.json({
      id: saved.id,
      cloned: Boolean(elevenVoiceId),
      provider: ttsStatus().preferred,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
