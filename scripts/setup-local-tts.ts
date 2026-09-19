/**
 * Installiert gratis lokale TTS (Piper + deutsche Stimmen).
 * Einmal ausführen: npm run tts:setup
 * Danach: ohne API-Key sprechen.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

const ROOT = path.join(process.cwd(), "data", "voices", "piper");
const MODELS = path.join(ROOT, "models");
const VENV = path.join(ROOT, "venv");
const VENV_PIP = path.join(VENV, "bin", "pip");
const VENV_PYTHON = path.join(VENV, "bin", "python");

const VOICES = [
  "de/de_DE/thorsten/medium/de_DE-thorsten-medium",
  "de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium",
  "de/de_DE/kerstin/low/de_DE-kerstin-low",
  "de/de_DE/eva_k/x_low/de_DE-eva_k-x_low",
  "de/de_DE/ramona/low/de_DE-ramona-low",
  "de/de_DE/pavoque/low/de_DE-pavoque-low",
];

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

function download(url: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    const file = createWriteStream(dest);
    const get = (target: string, redirects = 0) => {
      https
        .get(target, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            if (redirects > 8) {
              reject(new Error("too many redirects"));
              return;
            }
            get(res.headers.location, redirects + 1);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${target}`));
            return;
          }
          pipeline(res, file).then(resolve).catch(reject);
        })
        .on("error", reject);
    };
    get(url);
  });
}

async function ensureVenv() {
  if (!fs.existsSync(VENV_PYTHON)) {
    console.log("→ Python-venv anlegen…");
    await run("python3", ["-m", "venv", VENV]);
  }
  // Absolute Python-Symlinks (nach /Library/…) lassen Next/Turbopack abstürzen — Wrapper statt Symlink.
  rewritePythonWrappers();
  console.log("→ piper-tts installieren…");
  await run(VENV_PIP, ["install", "-U", "pip", "piper-tts>=1.3.0"]);
}

/** Ersetzt ausgehende python*-Symlinks durch Shell-Wrapper (Turbopack-sicher). */
function rewritePythonWrappers() {
  const bin = path.join(VENV, "bin");
  let target: string | null = null;
  for (const name of ["python3.14", "python3", "python"]) {
    const p = path.join(bin, name);
    try {
      if (fs.lstatSync(p).isSymbolicLink()) {
        const resolved = fs.realpathSync(p);
        if (path.isAbsolute(resolved) && !resolved.startsWith(process.cwd())) {
          target = resolved;
          break;
        }
      }
    } catch {
      // fehlt — weiter
    }
  }
  if (!target) {
    try {
      target = fs.readFileSync(path.join(VENV, "pyvenv.cfg"), "utf8").match(/^executable\s*=\s*(.+)$/m)?.[1]?.trim() || null;
    } catch {
      target = null;
    }
  }
  if (!target || !fs.existsSync(target)) return;
  const script = `#!/bin/sh\nexec "${target}" "$@"\n`;
  for (const name of fs.readdirSync(bin)) {
    if (!/^python/i.test(name) && name !== "𝜋thon") continue;
    const p = path.join(bin, name);
    try {
      if (fs.lstatSync(p).isSymbolicLink()) {
        fs.unlinkSync(p);
        fs.writeFileSync(p, script, { mode: 0o755 });
      }
    } catch {
      // Eintrag überspringen
    }
  }
}

async function ensureVoices() {
  fs.mkdirSync(MODELS, { recursive: true });
  for (const voice of VOICES) {
    const base = path.basename(voice);
    const onnx = path.join(MODELS, `${base}.onnx`);
    const json = path.join(MODELS, `${base}.onnx.json`);
    for (const [file, suffix] of [
      [onnx, ".onnx"],
      [json, ".onnx.json"],
    ] as const) {
      if (fs.existsSync(file) && fs.statSync(file).size > 1000) {
        console.log(`✓ ${path.basename(file)}`);
        continue;
      }
      const url = `https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/${voice}${suffix}?download=true`;
      console.log(`↓ ${path.basename(file)}`);
      await download(url, file);
    }
  }
}

async function main() {
  console.log("Lokale gratis TTS (Piper) einrichten…");
  fs.mkdirSync(ROOT, { recursive: true });
  await ensureVenv();
  await ensureVoices();

  const piper = path.join(VENV, "bin", "piper");
  const model = path.join(MODELS, "de_DE-thorsten-medium.onnx");
  const out = path.join(ROOT, "smoke.wav");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(piper, ["-m", model, "-f", out], { stdio: ["pipe", "inherit", "inherit"] });
    child.stdin.write("Grüß Gott. Die lokale Stimme funktioniert.");
    child.stdin.end();
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`smoke exit ${code}`))));
  });
  console.log(`\nFertig. Test: ${out}`);
  console.log("Dev-Server neu starten — Stimmen laufen ohne API-Key.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
