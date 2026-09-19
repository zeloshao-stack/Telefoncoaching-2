"use client";

import type { VoiceCard, VoiceMood, ElevenDelivery } from "@/lib/voices";
import { pickBrowserVoice } from "@/lib/voices";
import { splitSentences } from "@/lib/speech-chunks";

type Playing = {
  stop: () => void;
};

let current: Playing | null = null;
let unlocked = false;
let catalog: VoiceCard[] | null = null;
const blobUrls = new Map<string, string>();

const UNLOCK_KEY = "tc-tts-unlocked";

function readUnlockFlag() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function writeUnlockFlag() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isSpeechUnlocked() {
  return unlocked || readUnlockFlag();
}

export async function unlockSpeech() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
      // Kurz warm halten, dann schließen — entsperrt Autoplay fürs nächste Audio
      window.setTimeout(() => {
        void ctx.close().catch(() => undefined);
      }, 200);
    }
  } catch {
    /* Autoplay-Entsperren ist Best-Effort */
  }
  unlocked = true;
  writeUnlockFlag();
}

export function stopSpeech() {
  current?.stop();
  current = null;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function rememberVoiceCatalog(voices: VoiceCard[]) {
  catalog = voices;
}

async function cardFor(voiceId: string): Promise<VoiceCard | null> {
  if (!catalog) {
    try {
      const res = await fetch("/api/stimme");
      const data = (await res.json()) as { voices?: VoiceCard[] };
      catalog = data.voices ?? [];
    } catch {
      catalog = [];
    }
  }
  return catalog.find((voice) => voice.id === voiceId) ?? null;
}

export async function speakUtterance(
  text: string,
  voiceId: string,
  mood?: VoiceMood,
  delivery?: ElevenDelivery,
): Promise<void> {
  stopSpeech();
  await unlockSpeech();
  const key = `${voiceId}:${mood ?? ""}:${delivery?.breath ?? ""}:${text}`;
  const url = await audioUrlFor(key, text, voiceId, mood, delivery);
  await playElement(url);
}

/**
 * Spricht satzweise: der erste Satz läuft, während die weiteren noch geladen werden.
 * Deutlich weniger Warteloch als ein Stück Audio für die ganze Antwort.
 */
export async function speakSentences(
  text: string,
  voiceId: string,
  mood?: VoiceMood,
  delivery?: ElevenDelivery,
): Promise<void> {
  stopSpeech();
  await unlockSpeech();
  const sentences = splitSentences(text);
  if (sentences.length <= 1) {
    const key = `${voiceId}:${mood ?? ""}:${delivery?.breath ?? ""}:${text}`;
    const url = await audioUrlFor(key, text, voiceId, mood, delivery);
    await playElement(url);
    return;
  }
  const token = { cancelled: false };
  let elementStop: (() => void) | null = null;
  const stopAll = () => {
    token.cancelled = true;
    elementStop?.();
  };
  current = { stop: stopAll };
  const urls = sentences.map((sentence, index) =>
    audioUrlFor(
      `${voiceId}:${mood ?? ""}:${delivery?.breath ?? ""}:${sentence}`,
      sentence,
      voiceId,
      mood,
      index === 0 ? delivery : { ...delivery, breath: "normal", warmth: "neutral" },
    ),
  );
  for (const pending of urls) {
    if (token.cancelled) return;
    const url = await pending;
    if (token.cancelled) return;
    await playElement(url, (stop) => {
      elementStop = stop;
    });
    if (token.cancelled) return;
  }
  if (current?.stop === stopAll) current = null;
}

/** Lädt Audio in den Cache (z. B. beim Gesprächsstart, noch im User-Gesture). */
export async function prefetchSpeech(
  text: string,
  voiceId: string,
  mood?: VoiceMood,
  delivery?: ElevenDelivery,
): Promise<void> {
  if (!text.trim() || !voiceId) return;
  const key = `${voiceId}:${mood ?? ""}:${delivery?.breath ?? ""}:${text}`;
  if (blobUrls.has(key)) return;
  await audioUrlFor(key, text, voiceId, mood, delivery);
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const finish = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish);
    window.setTimeout(finish, 400);
  });
}

async function audioUrlFor(
  key: string,
  text: string,
  voiceId: string,
  mood?: VoiceMood,
  delivery?: ElevenDelivery,
): Promise<string> {
  const cached = blobUrls.get(key);
  if (cached) return cached;

  // Zuerst gespeicherte Hörprobe, wenn Text = Sample der Figur
  const card = await cardFor(voiceId);
  if (card?.sample && card.sample.trim() === text.trim() && !mood) {
    try {
      const sampleRes = await fetch(`/api/stimme/sample/${encodeURIComponent(voiceId)}`);
      if (sampleRes.ok) {
        const url = await blobUrlFromResponse(sampleRes);
        blobUrls.set(key, url);
        return url;
      }
    } catch {
      /* synthetisieren */
    }
  }

  const res = await fetch("/api/stimme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, mood, delivery }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; voice?: VoiceCard };
    if (data.voice) rememberVoiceCatalog([...(catalog ?? []), data.voice]);
    throw new Error(data.error || "Stimme nicht erzeugt");
  }
  const url = await blobUrlFromResponse(res);
  blobUrls.set(key, url);
  return url;
}

async function blobUrlFromResponse(res: Response): Promise<string> {
  const type = res.headers.get("Content-Type") || "audio/wav";
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength < 64) throw new Error("Leeres Audio");
  const blob = new Blob([buffer], { type: type.split(";")[0].trim() || "audio/wav" });
  return URL.createObjectURL(blob);
}

function playElement(url: string, register?: (stop: () => void) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "auto";
    let settled = false;
    const stop = () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    if (register) register(stop);
    else current = { stop };
    audio.onended = () => {
      if (!register && current?.stop === stop) current = null;
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    audio.onerror = () => {
      if (!register && current?.stop === stop) current = null;
      if (!settled) {
        settled = true;
        reject(new Error("Wiedergabe fehlgeschlagen"));
      }
    };
    audio.src = url;
    void audio.play().catch((err: unknown) => {
      if (!register && current?.stop === stop) current = null;
      if (!settled) {
        settled = true;
        reject(err instanceof Error ? err : new Error("Autoplay blockiert — nochmal auf Hören tippen"));
      }
    });
  });
}

/** Fallback nur wenn Neural bewusst nicht verfügbar (nicht default). */
export async function playBrowser(text: string, voiceId: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Keine Stimme verfügbar");
  }
  const card = await cardFor(voiceId);
  const voices = await waitForVoices();
  const picked = pickBrowserVoice(voices, {
    id: voiceId,
    gender: card?.gender ?? "female",
    ageBand: card?.ageBand ?? "mid",
    locale: card?.locale ?? "de-AT",
  });
  return new Promise((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    if (picked) utter.voice = picked;
    utter.lang = picked?.lang || card?.locale || "de-AT";
    utter.rate = card?.rate ?? 0.96;
    const stop = () => window.speechSynthesis.cancel();
    current = { stop };
    utter.onend = () => {
      if (current?.stop === stop) current = null;
      resolve();
    };
    utter.onerror = () => {
      if (current?.stop === stop) current = null;
      reject(new Error("Browser-Stimme fehlgeschlagen"));
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}
