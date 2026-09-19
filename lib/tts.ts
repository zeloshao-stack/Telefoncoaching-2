import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { customToSpec, getCustomVoice } from "@/lib/voice-bank";
import { localTtsReady, localTtsStatus, synthesizeLocal } from "@/lib/tts-local";
import {
  cartesiaEmotion,
  cartesiaVoiceFor,
  elevenVoiceFor,
  elevenVoiceSettings,
  getSeedVoice,
  moodSpeakHint,
  prepareSpokenText,
  toAzureSsml,
  toElevenSpokenText,
  type ElevenDelivery,
  type VoiceMood,
  type VoiceSpec,
} from "@/lib/voices";

const cache = new Map<string, Buffer>();
const CACHE_LIMIT = 64;
const DISK_CACHE = path.join(process.cwd(), "data", "voices", "cache");

export type SpeechResult = {
  audio: Buffer;
  contentType: "audio/mpeg" | "audio/wav";
  provider: string;
};

function openaiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

function azureKey() {
  return process.env.AZURE_SPEECH_KEY?.trim() || "";
}

function azureRegion() {
  return process.env.AZURE_SPEECH_REGION?.trim() || "westeurope";
}

function elevenKey() {
  return process.env.ELEVENLABS_API_KEY?.trim() || "";
}

function cartesiaKey() {
  return process.env.CARTESIA_API_KEY?.trim() || "";
}

function elevenModel() {
  return process.env.ELEVENLABS_TTS_MODEL?.trim() || "eleven_v3";
}

function cartesiaModel() {
  return process.env.CARTESIA_TTS_MODEL?.trim() || "sonic-3";
}

function requestedProvider() {
  return process.env.TTS_PROVIDER?.trim().toLowerCase() || "";
}

function preferLocal() {
  const flag = process.env.TTS_PREFER_LOCAL?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

function forceLocalOnly() {
  const provider = requestedProvider();
  return provider === "local" || provider === "piper";
}

export function ttsStatus() {
  const local = localTtsStatus();
  const cartesia = Boolean(cartesiaKey());
  const azure = Boolean(azureKey());
  const elevenlabs = Boolean(elevenKey());
  const openai = Boolean(openaiKey());
  const cloudTts = cartesia || azure || elevenlabs;
  const localOnly = forceLocalOnly() || preferLocal() || !cloudTts;

  const requested = requestedProvider();

  let preferred: string;
  if (forceLocalOnly() && local.available) preferred = local.preferred || "local";
  else if (preferLocal() && local.available) preferred = local.preferred || "local";
  else if ((requested === "elevenlabs" || requested === "eleven") && elevenlabs) preferred = "elevenlabs";
  else if (requested === "cartesia" && cartesia) preferred = "cartesia";
  else if (requested === "azure" && azure) preferred = "azure";
  else if (elevenlabs) preferred = "elevenlabs";
  else if (cartesia) preferred = "cartesia";
  else if (azure) preferred = "azure";
  else if (local.available) preferred = local.preferred || "local";
  else if (openai) preferred = "openai";
  else preferred = "none";

  const available = cloudTts || local.available || openai;

  return {
    available,
    preferred,
    providers: {
      cartesia,
      azure,
      elevenlabs,
      openai,
      piper: local.piper,
      macosSay: local.macosSay,
      local: local.available,
      browser: false as const,
    },
    model:
      preferred === "cartesia"
        ? cartesiaModel()
        : preferred === "elevenlabs"
          ? elevenModel()
          : preferred === "azure"
            ? "azure-neural-de-AT"
            : preferred === "openai"
              ? process.env.TTS_MODEL?.trim() || "gpt-4o-mini-tts"
              : preferred === "piper"
                ? "piper-de"
                : preferred === "macos-say"
                  ? "macos-say-de"
                  : "none",
    latencyHint:
      preferred === "piper"
        ? "Lokal Piper — kostenlos, deutsche Neuralstimmen auf Ihrem Rechner."
        : preferred === "macos-say"
          ? "Lokal macOS say — kostenlos (Systemstimmen). Für bessere Qualität: npm run tts:setup"
          : preferred === "cartesia"
            ? "Cartesia Sonic — flüssiges Deutsch, niedrige Latenz (~90–200ms TTFA)."
            : preferred === "elevenlabs"
              ? "ElevenLabs v3 — Stimme folgt der Lage (Seufzer, Lachen, Tempo)."
              : preferred === "azure"
                ? "Azure Neural de-AT — echte österreichische Sprecher."
                : preferred === "openai"
                  ? "OpenAI TTS — brauchbar, schwächer auf de-AT."
                  : "Keine Stimme. npm run tts:setup für gratis lokale Stimmen.",
    needsKey: !available,
    localOnly,
  };
}

export function resolveVoice(id: string): VoiceSpec {
  const seed = getSeedVoice(id);
  if (seed) return seed;
  const custom = getCustomVoice(id);
  if (custom) return customToSpec(custom);
  throw new Error("Unbekannte Stimme.");
}

function cacheKey(voiceId: string, text: string, provider: string, model: string, mood = "", breath = "") {
  return createHash("sha256").update(`${provider}:${model}:${voiceId}:${mood}:${breath}:${text}`).digest("hex");
}

function diskPath(key: string, ext: "mp3" | "wav") {
  return path.join(DISK_CACHE, `${key}.${ext}`);
}

function remember(key: string, audio: Buffer, ext: "mp3" | "wav") {
  cache.set(key, audio);
  if (cache.size > CACHE_LIMIT) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  try {
    fs.mkdirSync(DISK_CACHE, { recursive: true });
    fs.writeFileSync(diskPath(key, ext), audio);
  } catch {
    /* Cache ist Best-Effort */
  }
}

function recall(key: string): { audio: Buffer; ext: "mp3" | "wav" } | null {
  const hit = cache.get(key);
  if (hit) {
    const wav = diskPath(key, "wav");
    if (fs.existsSync(wav)) return { audio: hit, ext: "wav" };
    return { audio: hit, ext: "mp3" };
  }
  try {
    for (const ext of ["wav", "mp3"] as const) {
      const file = diskPath(key, ext);
      if (fs.existsSync(file)) {
        const buf = fs.readFileSync(file);
        cache.set(key, buf);
        return { audio: buf, ext };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function cartesiaSpeech(spec: VoiceSpec, text: string): Promise<Buffer> {
  const key = cartesiaKey();
  if (!key) throw new Error("no cartesia");
  const res = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Cartesia-Version": "2026-08-14",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: cartesiaModel(),
      transcript: text,
      voice: { id: cartesiaVoiceFor(spec) },
      language: spec.locale.startsWith("de") ? "de" : "de",
      output_format: {
        container: "mp3",
        sample_rate: 44100,
        bit_rate: 128000,
      },
      generation_config: {
        speed: Math.min(1.5, Math.max(0.6, spec.rate)),
        emotion: cartesiaEmotion(spec.mood),
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cartesia ${res.status}: ${err.slice(0, 400)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function azureSpeech(spec: VoiceSpec, text: string): Promise<Buffer> {
  const key = azureKey();
  if (!key) throw new Error("no azure");
  const res = await fetch(`https://${azureRegion()}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-48khz-192kbitrate-mono-mp3",
      "User-Agent": "Telefoncoaching",
    },
    body: toAzureSsml(spec, text),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure TTS ${res.status}: ${err.slice(0, 400)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function elevenSpeech(spec: VoiceSpec, text: string, mood?: VoiceMood, delivery?: ElevenDelivery): Promise<Buffer> {
  const key = elevenKey();
  if (!key) throw new Error("no eleven");
  const voiceId = elevenVoiceFor(spec);
  const model = elevenModel();
  const tagged = model.includes("v3") ? toElevenSpokenText(text, mood, delivery) : prepareSpokenText(text);
  const settings = elevenVoiceSettings(mood);
  const tryOnce = async (modelId: string, spoken: string, withStyle: boolean) => {
    const body: Record<string, unknown> = {
      text: spoken,
      model_id: modelId,
      voice_settings: withStyle
        ? settings
        : { stability: settings.stability, similarity_boost: settings.similarity_boost },
    };
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 400)}`);
    }
    return Buffer.from(await res.arrayBuffer());
  };
  try {
    return await tryOnce(model, tagged, true);
  } catch (first) {
    if (model !== "eleven_multilingual_v2") {
      try {
        return await tryOnce("eleven_multilingual_v2", prepareSpokenText(text), false);
      } catch {
        throw first;
      }
    }
    throw first;
  }
}

async function openaiSpeech(spec: VoiceSpec, text: string): Promise<Buffer> {
  const key = openaiKey();
  if (!key) throw new Error("no openai");
  const preferred = process.env.TTS_MODEL?.trim() || "gpt-4o-mini-tts";
  const tryOnce = async (model: string, voice: string, withInstructions: boolean) => {
    const body: Record<string, unknown> = {
      model,
      voice,
      input: text,
      response_format: "mp3",
    };
    if (withInstructions) body.instructions = spec.instructions;
    if (model.startsWith("tts-")) body.speed = spec.rate;
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS ${res.status}: ${err.slice(0, 400)}`);
    }
    return Buffer.from(await res.arrayBuffer());
  };
  try {
    return await tryOnce(preferred, spec.openaiVoice, true);
  } catch {
    return tryOnce("tts-1-hd", "nova", false);
  }
}

export async function synthesizeSpeech(
  voiceId: string,
  rawText: string,
  mood?: VoiceMood,
  delivery?: ElevenDelivery,
): Promise<SpeechResult> {
  const text = prepareSpokenText(rawText);
  const resolved = resolveVoice(voiceId);
  const hint = moodSpeakHint(mood ?? resolved.mood);
  const spec: VoiceSpec = {
    ...resolved,
    mood: mood ?? resolved.mood,
    instructions: hint ? `${resolved.instructions} ${hint}` : resolved.instructions,
  };
  const status = ttsStatus();
  const key = cacheKey(voiceId, text, status.preferred, status.model, spec.mood ?? "", delivery?.breath ?? "");
  const hit = recall(key);
  if (hit) {
    return {
      audio: hit.audio,
      contentType: hit.ext === "wav" ? "audio/wav" : "audio/mpeg",
      provider: status.preferred,
    };
  }

  const errors: string[] = [];
  const hasCloudTts = Boolean(cartesiaKey() || elevenKey() || azureKey());
  const paidAllowed = !forceLocalOnly();
  const localFirst = forceLocalOnly() || preferLocal() || !hasCloudTts;

  async function tryLocal(): Promise<SpeechResult | null> {
    if (!localTtsReady()) return null;
    try {
      const local = await synthesizeLocal(spec, text);
      remember(key, local.audio, "wav");
      return { audio: local.audio, contentType: local.contentType, provider: local.engine };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "local");
      return null;
    }
  }

  if (localFirst) {
    const local = await tryLocal();
    if (local) return local;
    if (forceLocalOnly()) {
      throw new Error(errors[0] || "Lokale TTS fehlgeschlagen. npm run tts:setup");
    }
  }

  if (paidAllowed && elevenKey()) {
    try {
      const audio = await elevenSpeech(spec, text, spec.mood, delivery);
      remember(key, audio, "mp3");
      return { audio, contentType: "audio/mpeg", provider: "elevenlabs" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "eleven");
    }
  }

  if (paidAllowed && cartesiaKey()) {
    try {
      const audio = await cartesiaSpeech(spec, text);
      remember(key, audio, "mp3");
      return { audio, contentType: "audio/mpeg", provider: "cartesia" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "cartesia");
    }
  }

  if (paidAllowed && azureKey()) {
    try {
      const audio = await azureSpeech(spec, text);
      remember(key, audio, "mp3");
      return { audio, contentType: "audio/mpeg", provider: "azure" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "azure");
    }
  }

  if (paidAllowed && openaiKey()) {
    try {
      const audio = await openaiSpeech(spec, text);
      remember(key, audio, "mp3");
      return { audio, contentType: "audio/mpeg", provider: "openai" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "openai");
    }
  }

  const local = await tryLocal();
  if (local) return local;

  throw new Error(
    errors[0] ||
      "Keine Stimme verfügbar. npm run tts:setup für gratis lokal, oder CARTESIA_API_KEY / ELEVENLABS_API_KEY / AZURE_SPEECH_KEY setzen.",
  );
}

export async function cloneWithElevenLabs(name: string, audio: Buffer, mime: string): Promise<string | undefined> {
  const key = elevenKey();
  if (!key) return undefined;
  const form = new FormData();
  form.append("name", name);
  form.append("description", "Telefoncoaching, Einwilligung: eigene Stimme");
  form.append("remove_background_noise", "true");
  form.append("labels", JSON.stringify({ language: "de", accent: "at" }));
  form.append("files", new Blob([new Uint8Array(audio)], { type: mime || "audio/webm" }), "sample.webm");
  const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Klon fehlgeschlagen (${res.status}): ${err.slice(0, 300)}`);
  }
  const data = (await res.json()) as { voice_id?: string };
  return data.voice_id;
}
