import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { VoiceSpec } from "@/lib/voices";

/** Dynamisch gebaut, damit Turbopack das Piper-venv nicht als Bundle-Asset auflöst. */
function underCwd(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}
const MODELS = underCwd("data", "voices", "piper", "models");
const VENV_PIPER = underCwd("data", "voices", "piper", "venv", "bin", "piper");

export type LocalTtsResult = {
  audio: Buffer;
  contentType: "audio/wav";
  engine: "piper" | "macos-say";
};

type PiperVoice = {
  model: string;
  lengthScale: number;
};

const PIPER_BY_SEED: Record<string, PiperVoice> = {
  elisabeth: { model: "de_DE-kerstin-low", lengthScale: 1.12 },
  franz: { model: "de_DE-thorsten_emotional-medium", lengthScale: 0.92 },
  andreas: { model: "de_DE-thorsten-medium", lengthScale: 1.02 },
  helene: { model: "de_DE-kerstin-low", lengthScale: 1.18 },
  clara: { model: "de_DE-eva_k-x_low", lengthScale: 0.96 },
  bernd: { model: "de_DE-pavoque-low", lengthScale: 1.08 },
  klaus: { model: "de_DE-thorsten-medium", lengthScale: 1.1 },
  tanja: { model: "de_DE-ramona-low", lengthScale: 1 },
  leni: { model: "de_DE-ramona-low", lengthScale: 1.04 },
  jan: { model: "de_DE-pavoque-low", lengthScale: 1 },
  killian: { model: "de_DE-thorsten_emotional-medium", lengthScale: 0.9 },
  neutral: { model: "de_DE-thorsten-medium", lengthScale: 1 },
};

const SAY_BY_SEED: Record<string, string> = {
  elisabeth: "Grandma",
  franz: "Grandpa",
  andreas: "Reed",
  helene: "Shelley",
  clara: "Sandy",
  bernd: "Rocko",
  klaus: "Grandpa",
  tanja: "Anna",
  leni: "Flo",
  jan: "Eddy",
  killian: "Rocko",
  neutral: "Reed",
};

function run(cmd: string, args: string[], opts?: { input?: string; env?: NodeJS.ProcessEnv }): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      env: { ...process.env, ...opts?.env },
      stdio: ["pipe", "ignore", "pipe"],
    });
    let err = "";
    child.stderr.on("data", (chunk: Buffer) => {
      err += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code}: ${err.slice(0, 400)}`));
    });
    if (opts?.input != null) {
      child.stdin.write(opts.input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }
  });
}

function piperModelPath(name: string) {
  return path.join(MODELS, `${name}.onnx`);
}

export function piperReady(): boolean {
  if (!fs.existsSync(VENV_PIPER)) return false;
  try {
    return fs.readdirSync(MODELS).some((name) => name.endsWith(".onnx"));
  } catch {
    return false;
  }
}

export function macosSayReady(): boolean {
  return process.platform === "darwin" && fs.existsSync("/usr/bin/say");
}

export function localTtsReady(): boolean {
  return piperReady() || macosSayReady();
}

export function localTtsStatus() {
  const piper = piperReady();
  const macosSay = macosSayReady();
  return {
    available: piper || macosSay,
    piper,
    macosSay,
    preferred: piper ? ("piper" as const) : macosSay ? ("macos-say" as const) : null,
  };
}

function pickPiper(spec: VoiceSpec): PiperVoice {
  const fromRef = spec.elevenVoiceId?.startsWith("piper:") ? spec.elevenVoiceId.slice(6) : "";
  if (fromRef && fs.existsSync(piperModelPath(fromRef))) {
    return { model: fromRef, lengthScale: 1 / Math.max(0.7, spec.rate) };
  }
  const mapped = PIPER_BY_SEED[spec.id];
  if (mapped && fs.existsSync(piperModelPath(mapped.model))) return mapped;
  const female = spec.gender === "female";
  const fallback = female
    ? { model: "de_DE-kerstin-low", lengthScale: 1 / Math.max(0.7, spec.rate) }
    : { model: "de_DE-thorsten-medium", lengthScale: 1 / Math.max(0.7, spec.rate) };
  if (fs.existsSync(piperModelPath(fallback.model))) return fallback;
  for (const voice of Object.values(PIPER_BY_SEED)) {
    if (fs.existsSync(piperModelPath(voice.model))) {
      return { ...voice, lengthScale: 1 / Math.max(0.7, spec.rate) };
    }
  }
  throw new Error("Keine Piper-Stimme installiert. npm run tts:setup");
}

export function piperModelForSeed(seedId: string): string | null {
  const mapped = PIPER_BY_SEED[seedId];
  if (!mapped) return null;
  return fs.existsSync(piperModelPath(mapped.model)) ? mapped.model : null;
}

export function installedPiperModels(): string[] {
  try {
    return fs
      .readdirSync(MODELS)
      .filter((name) => name.endsWith(".onnx"))
      .map((name) => name.replace(/\.onnx$/, ""));
  } catch {
    return [];
  }
}

export function localSampleDir() {
  return underCwd("data", "voices", "samples");
}

export function countLocalSamples(): number {
  try {
    return fs.readdirSync(localSampleDir()).filter((name) => name.endsWith(".wav")).length;
  } catch {
    return 0;
  }
}

async function synthesizePiper(spec: VoiceSpec, text: string): Promise<LocalTtsResult> {
  const voice = pickPiper(spec);
  const model = piperModelPath(voice.model);
  const out = path.join(os.tmpdir(), `tc-piper-${process.pid}-${Date.now()}.wav`);
  const lengthScale = Number((voice.lengthScale / Math.max(0.75, Math.min(1.35, spec.rate))).toFixed(3));
  try {
    await run(VENV_PIPER, ["-m", model, "-f", out, "--length-scale", String(lengthScale)], { input: text });
    const audio = fs.readFileSync(out);
    if (audio.length < 64) throw new Error("Piper lieferte leeres Audio.");
    return { audio, contentType: "audio/wav", engine: "piper" };
  } finally {
    try {
      fs.unlinkSync(out);
    } catch {
      /* ignore */
    }
  }
}

function pickSayVoice(spec: VoiceSpec): string {
  return SAY_BY_SEED[spec.id] || (spec.gender === "female" ? "Anna" : "Reed");
}

async function synthesizeMacosSay(spec: VoiceSpec, text: string): Promise<LocalTtsResult> {
  const voice = pickSayVoice(spec);
  const base = path.join(os.tmpdir(), `tc-say-${process.pid}-${Date.now()}`);
  const aiff = `${base}.aiff`;
  const wav = `${base}.wav`;
  const rate = Math.round(175 * Math.max(0.75, Math.min(1.25, spec.rate)));
  try {
    await run("/usr/bin/say", ["-v", voice, "-r", String(rate), "-o", aiff, text]);
    await run("/usr/bin/afconvert", ["-f", "WAVE", "-d", "LEI16", aiff, wav]);
    const audio = fs.readFileSync(wav);
    if (audio.length < 64) throw new Error("macOS say lieferte leeres Audio.");
    return { audio, contentType: "audio/wav", engine: "macos-say" };
  } finally {
    for (const file of [aiff, wav]) {
      try {
        fs.unlinkSync(file);
      } catch {
        /* ignore */
      }
    }
  }
}

/** Kostenlose lokale Stimmen: Piper (neural) oder macOS say. */
export async function synthesizeLocal(spec: VoiceSpec, text: string): Promise<LocalTtsResult> {
  if (piperReady()) {
    try {
      return await synthesizePiper(spec, text);
    } catch (error) {
      if (!macosSayReady()) throw error;
    }
  }
  if (macosSayReady()) return synthesizeMacosSay(spec, text);
  throw new Error("Keine lokale TTS-Engine. npm run tts:setup");
}
