"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const EXAMPLE = `Kunde: Ja, Berger.
Ich: Grüß Gott Herr Berger, mein Name ist … von …. Ich rufe an, weil …
Kunde: Kein Interesse, wir haben schon einen Makler.
Ich: Verstehe. Darf ich fragen, was der für Sie macht?`;

export function CallIntake({ whisperReady }: { whisperReady: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"text" | "audio">("text");
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [consented, setConsented] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { title, counterpartName: name, consented };
      if (tab === "audio") {
        if (!file) throw new Error("Bitte eine Aufnahme wählen.");
        body.audioBase64 = await blobToBase64(file);
        body.mime = file.type || "audio/webm";
      } else {
        body.transcript = transcript;
      }
      const res = await fetch("/api/gespraeche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; id?: string };
      if (!res.ok || !data.id) throw new Error(data.error || "Speichern fehlgeschlagen");
      router.push(`/gespraeche/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setBusy(false);
    }
  }

  return (
    <section className="glass-card rounded-[1.7rem] border p-5 md:p-6">
      <p className="text-copper text-xs font-semibold tracking-[0.18em] uppercase">Gespräch einlesen</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Ein echtes Telefonat, ausgewertet mit demselben Maßstab wie eine Übung: B1–B4, die Stellen, an denen es
        kippte, und ein Satz zum Probieren. Transkript einfügen geht immer — Audio braucht Whisper.
      </p>

      <div className="mt-4 flex gap-1 rounded-2xl bg-secondary/60 p-1 text-sm">
        {(
          [
            ["text", "Transkript einfügen", FileText],
            ["audio", whisperReady ? "Aufnahme hochladen" : "Aufnahme (Whisper fehlt)", Upload],
          ] as const
        ).map(([id, caption, Icon]) => (
          <button
            key={id}
            type="button"
            disabled={id === "audio" && !whisperReady}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 transition disabled:opacity-50",
              tab === id ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
            onClick={() => setTab(id)}
          >
            <Icon className="size-4" />
            {caption}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium">
          Titel (optional)
          <input
            className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Erstanruf Zinshaus Ottakring"
          />
        </label>
        <label className="text-xs font-medium">
          Name der Gegenseite
          <input
            className="mt-1 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Herr Berger"
          />
        </label>
      </div>

      {tab === "text" ? (
        <div className="mt-3">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={EXAMPLE}
            className="min-h-48 rounded-2xl border-border/80 bg-background/80 font-mono text-xs leading-relaxed"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Zeilen mit „Ich:“ und „Kunde:“ (oder dem Namen) beginnen. Zeitmarken wie [00:12] werden ignoriert.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.webm"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => fileRef.current?.click()}>
            <Upload />
            Datei wählen
          </Button>
          {file ? <span className="text-muted-foreground text-xs">{file.name}</span> : null}
        </div>
      )}

      <label className="mt-4 flex items-start gap-2 text-sm leading-relaxed">
        <input type="checkbox" className="mt-1" checked={consented} onChange={(e) => setConsented(e.target.checked)} />
        Die Gegenseite weiß, dass dieses Gespräch aufgezeichnet und fürs Training ausgewertet wird.
      </label>

      <div className="mt-4 flex items-center gap-3">
        <Button type="button" className="h-11 rounded-2xl px-5" disabled={busy} onClick={() => void submit()}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          Auswerten
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </section>
  );
}
