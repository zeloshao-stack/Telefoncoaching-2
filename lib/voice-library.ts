import fs from "node:fs";
import path from "node:path";
import { listCustomVoices, saveLibraryVoice, upsertLocalBankVoice, voiceBankCount } from "@/lib/voice-bank";
import { countLocalSamples, installedPiperModels, localSampleDir, localTtsReady, piperModelForSeed } from "@/lib/tts-local";
import { synthesizeSpeech } from "@/lib/tts";
import { SEED_VOICES, type VoiceAge, type VoiceGender, type VoiceLocale } from "@/lib/voices";

type SharedVoice = {
  public_owner_id: string;
  voice_id: string;
  name: string;
  accent: string;
  gender: string;
  age: string;
  descriptive?: string;
  use_case?: string;
  description?: string | null;
  language?: string | null;
  locale?: string | null;
  free_users_allowed?: boolean;
  preview_url?: string | null;
};

function elevenKey() {
  return process.env.ELEVENLABS_API_KEY?.trim() || "";
}

function mapGender(value: string): VoiceGender {
  return /^f|w|female|weiblich/i.test(value) ? "female" : "male";
}

function mapAge(value: string): VoiceAge {
  if (/young|jung|child|teen/i.test(value)) return "young";
  if (/old|senior|middle.?aged|mid/i.test(value)) return /old|senior/i.test(value) ? "older" : "mid";
  return "mid";
}

function mapLocale(voice: SharedVoice): VoiceLocale {
  const blob = `${voice.locale || ""} ${voice.accent || ""} ${voice.description || ""} ${voice.name}`.toLowerCase();
  if (/austria|österreich|wien|vienn|austrian|de-at/.test(blob)) return "de-AT";
  if (/swiss|schweiz|zurich|de-ch/.test(blob)) return "de-CH";
  return "de-DE";
}

function regionFor(locale: VoiceLocale, accent: string) {
  if (locale === "de-AT") return "Österreich";
  if (locale === "de-CH") return "Schweiz";
  return accent?.trim() || "Deutschland";
}

async function fetchGermanShared(pageSize = 40): Promise<SharedVoice[]> {
  const key = elevenKey();
  if (!key) throw new Error("ELEVENLABS_API_KEY fehlt — Bibliothek lässt sich nicht füllen.");

  const queries = [
    "language=de&page_size=40&sort=trending",
    "language=de&locale=de-AT&page_size=20&sort=trending",
    "search=german&page_size=30&sort=cloned_by_count",
    "search=österreich&page_size=15&sort=trending",
    "search=austrian&page_size=15&sort=trending",
  ];

  const byId = new Map<string, SharedVoice>();
  for (const query of queries) {
    const res = await fetch(`https://api.elevenlabs.io/v1/shared-voices?${query}`, {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Bibliothek ${res.status}: ${err.slice(0, 300)}`);
    }
    const data = (await res.json()) as { voices?: SharedVoice[] };
    for (const voice of data.voices || []) {
      const lang = (voice.language || "").toLowerCase();
      const isGerman =
        lang === "de" ||
        lang.startsWith("de") ||
        /german|deutsch|österreich|austrian|swiss german/i.test(
          `${voice.description || ""} ${voice.accent || ""} ${voice.name}`,
        );
      if (!isGerman) continue;
      if (voice.free_users_allowed === false) continue;
      byId.set(voice.voice_id, voice);
      if (byId.size >= pageSize) break;
    }
    if (byId.size >= pageSize) break;
  }
  return [...byId.values()].slice(0, pageSize);
}

async function addSharedToAccount(voice: SharedVoice): Promise<string> {
  const key = elevenKey();
  const res = await fetch(`https://api.elevenlabs.io/v1/voices/add/${voice.public_owner_id}/${voice.voice_id}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ new_name: `TC · ${voice.name}`.slice(0, 80), bookmarked: true }),
  });
  if (!res.ok) {
    const err = await res.text();
    // Bereits hinzugefügt → Original-ID weiterverwenden
    if (res.status === 400 || res.status === 422) return voice.voice_id;
    throw new Error(`Stimme ${voice.name}: ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as { voice_id?: string };
  return data.voice_id || voice.voice_id;
}

export async function fillLocalVoiceBank() {
  if (!localTtsReady()) {
    throw new Error("Lokale TTS fehlt. Zuerst npm run tts:setup ausführen.");
  }

  const samplesDir = localSampleDir();
  fs.mkdirSync(samplesDir, { recursive: true });

  const saved: string[] = [];
  for (const seed of SEED_VOICES) {
    const piperModel = piperModelForSeed(seed.id) || (seed.gender === "female" ? "de_DE-kerstin-low" : "de_DE-thorsten-medium");
    const samplePath = path.join(samplesDir, `${seed.id}.wav`);
    const result = await synthesizeSpeech(seed.id, seed.sample);
    fs.writeFileSync(samplePath, result.audio);
    upsertLocalBankVoice({
      id: seed.id,
      name: seed.name,
      role: `${seed.role} · lokal`,
      region: seed.region,
      gender: seed.gender,
      ageBand: seed.ageBand,
      locale: seed.locale,
      piperModel,
      samplePath,
    });
    saved.push(seed.name);
  }

  return {
    added: saved.length,
    skipped: 0,
    names: saved,
    models: installedPiperModels().length,
    samples: countLocalSamples(),
    bank: voiceBankCount(),
    message: `${saved.length} Stimmen lokal gespeichert (${installedPiperModels().length} Piper-Modelle, ohne API-Kosten).`,
  };
}

export async function fillVoiceBank(limit = 24) {
  if (!elevenKey()) {
    return fillLocalVoiceBank();
  }
  try {
    return await fillVoiceBankFromLibrary(limit);
  } catch (error) {
    // Cloud fehlgeschlagen → trotzdem lokal befüllen
    const local = await fillLocalVoiceBank();
    return {
      ...local,
      message: `${local.message} (ElevenLabs: ${error instanceof Error ? error.message : "Fehler"})`,
    };
  }
}

export async function fillVoiceBankFromLibrary(limit = 24) {
  const existing = new Set(
    listCustomVoices()
      .map((row) => row.eleven_voice_id)
      .filter(Boolean),
  );
  const shared = await fetchGermanShared(limit + 10);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const voice of shared) {
    if (added.length >= limit) break;
    if (existing.has(voice.voice_id)) {
      skipped.push(voice.name);
      continue;
    }
    try {
      const accountVoiceId = await addSharedToAccount(voice);
      if (existing.has(accountVoiceId)) {
        skipped.push(voice.name);
        continue;
      }
      const locale = mapLocale(voice);
      const gender = mapGender(voice.gender || "female");
      const ageBand = mapAge(voice.age || "middle_aged");
      saveLibraryVoice({
        name: voice.name,
        role: voice.use_case || voice.descriptive || "Bibliothek",
        region: regionFor(locale, voice.accent || ""),
        gender,
        ageBand,
        locale,
        description:
          voice.description ||
          `${voice.descriptive || "Natürlich"} · ${voice.accent || locale} — aus ElevenLabs Voice Library (lizenziert).`,
        elevenVoiceId: accountVoiceId,
        sample:
          "Grüß Gott. Ja, das Haus gehört mir. Warum rufen Sie an? Ich habe gerade nur kurz Zeit.",
      });
      existing.add(accountVoiceId);
      added.push(voice.name);
    } catch {
      skipped.push(voice.name);
    }
  }

  return {
    added: added.length,
    skipped: skipped.length,
    names: added,
    message:
      added.length > 0
        ? `${added.length} Bibliotheksstimmen in der Bank.`
        : "Keine neuen Stimmen. Key prüfen oder Bank ist schon voll.",
  };
}
