"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Square, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodeCallAudio, encodeWav } from "@/components/training/callAudio";
import { counterpartDuration, type CallSegment } from "@/lib/call-ingest";
import type { VoiceAge, VoiceGender, VoiceLocale } from "@/lib/voices";
import { cn } from "@/lib/utils";

type Label = "trainee" | "counterpart" | "skip";

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Datei nicht lesbar"));
    reader.readAsDataURL(blob);
  });
}

export function CallImport({ onCloned }: { onCloned: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [locale, setLocale] = useState<VoiceLocale>("de-AT");
  const [gender, setGender] = useState<VoiceGender>("female");
  const [age, setAge] = useState<VoiceAge>("older");
  const [rec, setRec] = useState(false);
  const [cloneC, setCloneC] = useState(false);
  const [synth, setSynth] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [segments, setSegments] = useState<CallSegment[]>([]);
  const [labels, setLabels] = useState<Record<string, Label>>({});
  const [busy, setBusy] = useState<"idle" | "transcribe" | "clone">("idle");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const chunks = useRef<Blob[]>([]);
  const recorder = useRef<MediaRecorder | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function applyLabels(next: CallSegment[]) {
    const initial: Record<string, Label> = {};
    for (const row of next) {
      initial[row.id] = row.suggested === "unknown" ? "skip" : row.suggested;
    }
    setLabels(initial);
  }

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recoder = new MediaRecorder(stream);
    chunks.current = [];
    recoder.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    recoder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks.current, { type: chunks.current[0]?.type || "audio/webm" });
      setFile(new File([blob], "gespraech.webm", { type: blob.type }));
    };
    recorder.current = recoder;
    recoder.start();
    setRecording(true);
  }

  function stopRec() {
    recorder.current?.stop();
    setRecording(false);
  }

  async function transcribe() {
    if (!file) {
      setError("Bitte eine Aufnahme wählen oder das Gespräch mitschneiden.");
      return;
    }
    setBusy("transcribe");
    setError(null);
    try {
      const audioBase64 = await blobToBase64(file);
      const res = await fetch("/api/stimme/gespraech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterpartName: name,
          consentedRecording: rec,
          consentedClone: cloneC,
          consentedSynthetic: synth,
          audioBase64,
          mime: file.type || "audio/webm",
        }),
      });
      const data = (await res.json()) as { error?: string; id?: string; segments?: CallSegment[] };
      if (!res.ok) throw new Error(data.error || "Transkription fehlgeschlagen");
      setCallId(data.id || null);
      setSegments(data.segments || []);
      applyLabels(data.segments || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy("idle");
    }
  }

  async function cloneCounterpart() {
    if (!file || !callId) return;
    const ranges = segments
      .filter((row) => labels[row.id] === "counterpart")
      .map((row) => ({ start: row.start, end: row.end }));
    const seconds = counterpartDuration(ranges);
    if (seconds < 8) {
      setError("Bitte mindestens acht Sekunden Gegenseite markieren. Telefonmitschnitte sind oft gemischt — lieber zu streng als falsch klonen.");
      return;
    }
    setBusy("clone");
    setError(null);
    try {
      let used = 0;
      const capped = [];
      for (const range of ranges) {
        if (used >= 90) break;
        capped.push(range);
        used += range.end - range.start;
      }
      const buffer = await decodeCallAudio(file);
      const wav = encodeWav(buffer, capped);
      const audioBase64 = await blobToBase64(wav);
      const res = await fetch("/api/stimme/stimmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role: "Gegenseite aus Gespräch",
          region: locale === "de-AT" ? "Wien" : locale === "de-CH" ? "Schweiz" : "Deutschland",
          gender,
          ageBand: age,
          locale,
          consent: "counterpart",
          callId,
          mime: "audio/wav",
          audioBase64,
        }),
      });
      const data = (await res.json()) as { error?: string; cloned?: boolean };
      if (!res.ok) throw new Error(data.error || "Klon fehlgeschlagen");
      await onCloned();
      setError(
        data.cloned
          ? "Gegenseite liegt in der Stimmenbank (ElevenLabs-Klon)."
          : "Abschnitte gespeichert. Für den echten Klon ELEVENLABS_API_KEY setzen.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy("idle");
    }
  }

  const counterpartSecs = counterpartDuration(
    segments.filter((row) => labels[row.id] === "counterpart").map((row) => ({ start: row.start, end: row.end })),
  );

  return (
    <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
      <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Echtes Gespräch</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Mitschnitt oder Datei, Transkript, dann Sie entscheiden: Ich oder Gegenseite. Nur markierte
        Gegenseite wird geklont. Am Anfang des Anrufs kurz sagen, dass aufgezeichnet und fürs Training
        verwendet wird — die drei Häkchen unten sind die schriftliche Spur.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium">
          Name der Gegenseite
          <input
            className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Helene Sommer"
          />
        </label>
        <label className="text-xs font-medium">
          Region
          <select
            className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as VoiceLocale)}
          >
            <option value="de-AT">Österreich</option>
            <option value="de-DE">Deutschland</option>
            <option value="de-CH">Schweiz</option>
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-2 text-sm leading-relaxed">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={rec} onChange={(e) => setRec(e.target.checked)} />
          Die Gegenseite hat der Aufnahme dieses Gesprächs zugestimmt.
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={cloneC} onChange={(e) => setCloneC(e.target.checked)} />
          Die Gegenseite hat dem Klonen ihrer Stimme zugestimmt.
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={synth} onChange={(e) => setSynth(e.target.checked)} />
          Die Gegenseite weiß, dass die Stimme im Training Sätze sagen kann, die sie so nie gesagt hat.
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.webm"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => fileRef.current?.click()}>
          <Upload />
          Datei
        </Button>
        {recording ? (
          <Button type="button" variant="destructive" className="rounded-2xl" onClick={stopRec}>
            <Square />
            Stopp
          </Button>
        ) : (
          <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => void startRec()}>
            <Mic />
            Mitschneiden
          </Button>
        )}
        <Button type="button" className="rounded-2xl" disabled={busy !== "idle"} onClick={() => void transcribe()}>
          {busy === "transcribe" ? <Loader2 className="animate-spin" /> : null}
          Transkript
        </Button>
        {file ? <span className="text-muted-foreground text-xs">{file.name}</span> : null}
      </div>

      {segments.length ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-medium">
            Abschnitte zuordnen · Gegenseite {counterpartSecs.toFixed(0)}s (Ziel: 30–90s, mindestens 8s)
          </p>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {segments.map((row) => {
              const label = labels[row.id] ?? "skip";
              return (
                <li key={row.id} className="rounded-2xl border border-border/70 px-3 py-2 text-sm">
                  <p className="text-muted-foreground text-[0.65rem]">
                    {row.start.toFixed(1)}–{row.end.toFixed(1)}s
                    {row.suggested !== "unknown" ? ` · Vorschlag: ${row.suggested === "trainee" ? "Sie" : "Gegenseite"}` : ""}
                  </p>
                  <p className="mt-1 leading-relaxed">{row.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(
                      [
                        ["trainee", "Ich"],
                        ["counterpart", "Gegenseite"],
                        ["skip", "Weg"],
                      ] as const
                    ).map(([id, caption]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs",
                          label === id ? "border-primary/40 bg-background" : "border-border text-muted-foreground",
                        )}
                        onClick={() => setLabels((prev) => ({ ...prev, [row.id]: id }))}
                      >
                        {caption}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-medium">
              Stimmlage
              <select
                className="ml-2 rounded-xl border border-border/80 bg-background/80 px-2 py-1"
                value={gender}
                onChange={(e) => setGender(e.target.value as VoiceGender)}
              >
                <option value="female">Weiblich</option>
                <option value="male">Männlich</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              Alter
              <select
                className="ml-2 rounded-xl border border-border/80 bg-background/80 px-2 py-1"
                value={age}
                onChange={(e) => setAge(e.target.value as VoiceAge)}
              >
                <option value="young">Jünger</option>
                <option value="mid">Mitte</option>
                <option value="older">Älter</option>
              </select>
            </label>
            <Button type="button" className="rounded-2xl" disabled={busy !== "idle"} onClick={() => void cloneCounterpart()}>
              {busy === "clone" ? <Loader2 className="animate-spin" /> : null}
              Nur Gegenseite klonen
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm leading-relaxed">{error}</p> : null}
    </section>
  );
}
