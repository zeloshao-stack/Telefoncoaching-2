"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rememberVoiceCatalog, speakUtterance, stopSpeech, unlockSpeech } from "@/components/training/speechPlayer";
import { CallImport } from "@/components/training/CallImport";
import { cn } from "@/lib/utils";
import type { VoiceAge, VoiceCard, VoiceGender, VoiceLocale } from "@/lib/voices";
import { voiceCards } from "@/lib/voices";

const SCRIPT =
  "Grüß Gott. Das Haus in der Wallnerstraße steht seit Jahren in der Familie. Die Fassade ist schön, das Stiegenhaus braucht Arbeit. Ich habe noch mit niemandem verbindlich gesprochen. Warum rufen Sie an? Vierundachtzigtausend ist keine Zahl, die ich am Telefon nenne.";

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Aufnahme nicht lesbar"));
    reader.readAsDataURL(blob);
  });
}

type Status = {
  preferred: string;
  available: boolean;
  needsKey?: boolean;
  providers: {
    cartesia?: boolean;
    azure?: boolean;
    elevenlabs?: boolean;
    openai?: boolean;
    piper?: boolean;
    macosSay?: boolean;
    local?: boolean;
  };
  voices: VoiceCard[];
  latencyHint?: string;
  bankCount?: number;
  sampleCount?: number;
  piperModels?: number;
};

export function VoiceStudio() {
  const [status, setStatus] = useState<Status | null>(null);
  const [voiceId, setVoiceId] = useState("elisabeth");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | VoiceLocale>("all");
  const [consent, setConsent] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneGender, setCloneGender] = useState<VoiceGender>("female");
  const [cloneAge, setCloneAge] = useState<VoiceAge>("older");
  const [cloneLocale, setCloneLocale] = useState<VoiceLocale>("de-AT");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const media = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);

  async function reload() {
    const res = await fetch("/api/stimme");
    const data = (await res.json()) as Status & { error?: string };
    if (!res.ok) throw new Error(data.error || "Stimmenstatus fehlgeschlagen");
    const voices = Array.isArray(data.voices) && data.voices.length > 0 ? data.voices : voiceCards();
    const next: Status = {
      ...data,
      voices,
      bankCount: data.bankCount ?? 0,
      sampleCount: data.sampleCount ?? 0,
      piperModels: data.piperModels ?? 0,
      providers: data.providers ?? {},
    };
    setStatus(next);
    rememberVoiceCatalog(voices);
    const current = voices.find((voice) => voice.id === voiceId) ?? voices[0];
    if (current?.sample && !text.trim()) setText(current.sample);
  }

  useEffect(() => {
    void reload().catch((e: unknown) => {
      const seeds = voiceCards();
      setStatus({
        preferred: "none",
        available: false,
        needsKey: true,
        providers: {},
        voices: seeds,
        latencyHint: e instanceof Error ? e.message : "npm run tts:setup für gratis lokale Stimmen.",
      });
      rememberVoiceCatalog(seeds);
      if (seeds[0]?.sample) setText(seeds[0].sample);
    });
    return () => {
      stopSpeech();
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voices = (status?.voices ?? []).filter((voice) => (filter === "all" ? true : voice.locale === filter));
  const selected = voices.find((voice) => voice.id === voiceId) ?? status?.voices.find((voice) => voice.id === voiceId);

  function pick(id: string) {
    const next = status?.voices.find((voice) => voice.id === id);
    setVoiceId(id);
    if (next && (!text.trim() || text === selected?.sample)) setText(next.sample);
    if (next?.sample) {
      void (async () => {
        try {
          await unlockSpeech();
          await speakUtterance(next.sample, id);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Stimme nicht erzeugt");
        }
      })();
    }
  }

  async function fillLibrary() {
    setFilling(true);
    setError(null);
    try {
      const res = await fetch("/api/stimme/bibliothek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = (await res.json()) as { error?: string; message?: string; added?: number };
      if (!res.ok) throw new Error(data.error || "Bibliothek nicht gefüllt");
      await reload();
      setError(data.message || `${data.added ?? 0} Stimmen geladen.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bibliothek fehlgeschlagen");
    } finally {
      setFilling(false);
    }
  }

  async function speak() {
    if (busy !== "idle") {
      stopSpeech();
      setBusy("idle");
      return;
    }
    if (!text.trim()) return;
    setBusy("loading");
    setError(null);
    try {
      await unlockSpeech();
      const play = speakUtterance(text, voiceId);
      setBusy("playing");
      await play;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stimme nicht erzeugt");
    } finally {
      setBusy("idle");
    }
  }

  async function startRec() {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    rec.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };
    media.current = rec;
    rec.start();
    setRecording(true);
    setSeconds(0);
    timer.current = window.setInterval(() => {
      setSeconds((n) => {
        if (n >= 89) {
          rec.stop();
          setRecording(false);
          if (timer.current) window.clearInterval(timer.current);
        }
        return n + 1;
      });
    }, 1000);
  }

  function stopRec() {
    media.current?.stop();
    setRecording(false);
    if (timer.current) window.clearInterval(timer.current);
  }

  async function saveClone() {
    if (!consent) {
      setError("Bitte die Einwilligung setzen: nur eigene Stimme oder Stimme mit Recht.");
      return;
    }
    if (seconds < 8 && chunks.current.length === 0) {
      setError("Bitte mindestens acht Sekunden vorlesen.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const blob = new Blob(chunks.current, { type: chunks.current[0]?.type || "audio/webm" });
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/stimme/stimmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cloneName || "Eigene Stimme",
          role: "Klon",
          region: cloneLocale === "de-AT" ? "Wien" : cloneLocale === "de-CH" ? "Schweiz" : "Deutschland",
          gender: cloneGender,
          ageBand: cloneAge,
          locale: cloneLocale,
          consent: "own",
          mime: blob.type,
          audioBase64,
        }),
      });
      const data = (await res.json()) as { error?: string; id?: string; cloned?: boolean };
      if (!res.ok) throw new Error(data.error || "Klon nicht gespeichert");
      chunks.current = [];
      setCloneName("");
      setConsent(false);
      await reload();
      if (data.id) {
        setVoiceId(data.id);
        setError(
          data.cloned
            ? "Klon liegt in der Bank und spricht über ElevenLabs."
            : "Aufnahme gespeichert. Für den echten Klon ELEVENLABS_API_KEY setzen, sonst spricht der nächste Neural-Ersatz.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klon fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  const hint = !status
    ? "Engine…"
    : status.latencyHint ||
      (status.providers?.piper
        ? "Lokal Piper — gratis, deutsche Neuralstimmen."
        : status.providers?.macosSay
          ? "Lokal macOS say — gratis. Besser: npm run tts:setup"
          : status.providers?.azure
            ? "Azure Neural: echte de-AT-Stimmen (Ingrid, Jonas) plus DE/CH-Figuren."
            : status.providers?.elevenlabs
              ? "ElevenLabs: Bibliothek füllen oder eigene Stimme klonen."
              : status.providers?.openai
                ? "OpenAI-Stimmen — ohne echte de-AT-Lautung."
                : "npm run tts:setup für gratis lokale Stimmen.");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <p className="text-copper mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Als Nächstes · Stimme</p>
        <h1 className="font-heading text-4xl tracking-tight md:text-5xl">Stimmenbank, nicht eine Stimme</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
          Gratis lokal mit Piper (einmal <code className="text-sm">npm run tts:setup</code>) — danach ohne
          API-Rechnung. Cloud-Keys bleiben optional für noch flüssigere Qualität.
        </p>
        {status?.needsKey ? (
          <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-relaxed">
            Noch keine Stimme aktiv. Einmal <code className="text-xs">npm run tts:setup</code> ausführen
            (gratis lokal), Dev-Server neu starten — oder optional Cloud-Keys in{" "}
            <code className="text-xs">.env</code>.
          </p>
        ) : status?.providers?.local ? (
          <p className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-relaxed">
            Lokale Engine aktiv ({status.preferred}).{" "}
            {(status.bankCount ?? 0) > 0
              ? `${status.bankCount} Stimmen in der Bank · ${status.sampleCount ?? 0} Samples auf Disk · ${status.piperModels ?? 0} Modelle.`
              : "Bank noch leer — „Bank füllen“ speichert die Figuren inkl. Hörproben lokal (ohne API-Kosten)."}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" className="rounded-2xl" disabled={filling} onClick={() => void fillLibrary()}>
            {filling ? <Loader2 className="animate-spin" /> : null}
            {(status?.bankCount ?? 0) > 0 ? "Bank aktualisieren" : "Bank füllen (lokal speichern)"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Alle Regionen"],
            ["de-AT", "Österreich"],
            ["de-DE", "Deutschland"],
            ["de-CH", "Schweiz"],
          ] as const
        ).map(([id, label]) => (
          <Button key={id} type="button" variant={filter === id ? "secondary" : "outline"} className="rounded-full" onClick={() => setFilter(id)}>
            {label}
          </Button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {voices.map((card) => {
          const active = card.id === voiceId;
          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => pick(card.id)}
                className={cn(
                  "glass-card w-full rounded-[1.4rem] border p-4 text-left transition",
                  active ? "border-primary/30 ring-1 ring-primary/20" : "border-border/80 hover:border-primary/20",
                )}
              >
                <p className="font-heading text-lg tracking-tight">{card.name}</p>
                <p className="text-primary mt-1 text-xs font-medium">
                  {card.region} · {card.locale} ·{" "}
                  {card.kind === "clone" ? "Klon" : card.kind === "library" ? "Bibliothek" : "Lokal"}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{card.description}</p>
                <p className="text-muted-foreground mt-3 text-[0.65rem] font-medium tracking-wide uppercase">
                  Tippen = anhören
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="glass-card rounded-[1.7rem] border p-5 md:p-6">
        <label className="text-xs font-medium">
          Satz am Hörer
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 min-h-32 resize-none rounded-2xl"
            placeholder="Was die Figur sagt…"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">{hint}</p>
          <Button type="button" onClick={() => void speak()} disabled={!text.trim() && busy === "idle"} className="h-11 rounded-2xl px-5">
            {busy === "loading" ? <Loader2 className="animate-spin" /> : null}
            {busy === "playing" ? <Square /> : null}
            {busy === "idle" ? <Volume2 /> : null}
            {busy === "playing" ? "Stopp" : "Sprechen"}
          </Button>
        </div>
      </div>

      <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
        <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Eigene Stimme in die Bank</p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          So macht ElevenLabs die schnelle Bank: 30–90 Sekunden saubere Aufnahme, Einwilligung, fertig.
          Lesen Sie den Text unten. Keine YouTube-Stimmen, keine ORF-Ausschnitte, keine fremden Anrufe.
        </p>
        <p className="mt-4 rounded-2xl bg-secondary/70 px-4 py-3 text-sm leading-relaxed">{SCRIPT}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder="z. B. Reinhard"
            />
          </label>
          <label className="text-xs font-medium">
            Region
            <select
              className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
              value={cloneLocale}
              onChange={(e) => setCloneLocale(e.target.value as VoiceLocale)}
            >
              <option value="de-AT">Österreich (de-AT)</option>
              <option value="de-DE">Deutschland (de-DE)</option>
              <option value="de-CH">Schweiz (de-CH)</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Stimmlage
            <select
              className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
              value={cloneGender}
              onChange={(e) => setCloneGender(e.target.value as VoiceGender)}
            >
              <option value="female">Weiblich</option>
              <option value="male">Männlich</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Alter
            <select
              className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
              value={cloneAge}
              onChange={(e) => setCloneAge(e.target.value as VoiceAge)}
            >
              <option value="young">Jünger</option>
              <option value="mid">Mitte</option>
              <option value="older">Älter</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm leading-relaxed">
          <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Ich darf diese Stimme klonen (eigene Stimme oder schriftliche Einwilligung). Keine fremden Videos.
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {recording ? (
            <Button type="button" variant="destructive" onClick={stopRec} className="rounded-2xl">
              <Square />
              Stopp · {seconds}s
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={() => void startRec()} className="rounded-2xl">
              <Mic />
              Aufnahme
            </Button>
          )}
          <Button type="button" onClick={() => void saveClone()} disabled={saving || recording} className="rounded-2xl">
            {saving ? <Loader2 className="animate-spin" /> : null}
            In die Bank
          </Button>
        </div>
      </section>

      <CallImport onCloned={reload} />

      {error ? <p className="text-sm leading-relaxed">{error}</p> : null}

      <p className="text-muted-foreground text-xs leading-relaxed">
        Gratis: <code className="text-[0.65rem]">npm run tts:setup</code>, dann „Bank füllen“ — Samples landen in{" "}
        <code className="text-[0.65rem]">data/voices/samples</code>. Optional Cloud-Keys nur für noch flüssigere
        Qualität oder Klone. Audio wird gecacht.
      </p>
    </div>
  );
}
