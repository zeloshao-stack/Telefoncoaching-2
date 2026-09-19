"use client";

export type MicState = "granted" | "denied" | "prompt" | "insecure" | "unsupported" | "unknown";

export type Platform = {
  browser: "chrome" | "edge" | "safari" | "firefox" | "other";
  os: "mac" | "windows" | "ios" | "android" | "other";
};

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return { browser: "other", os: "other" };
  const ua = navigator.userAgent;
  const os: Platform["os"] = /iPhone|iPad|iPod/.test(ua)
    ? "ios"
    : /Android/.test(ua)
      ? "android"
      : /Mac OS X/.test(ua)
        ? "mac"
        : /Windows/.test(ua)
          ? "windows"
          : "other";
  const browser: Platform["browser"] = /Edg\//.test(ua)
    ? "edge"
    : /Chrome\//.test(ua) && !/Edg\//.test(ua)
      ? "chrome"
      : /Firefox\//.test(ua)
        ? "firefox"
        : /Safari\//.test(ua) && !/Chrome\//.test(ua)
          ? "safari"
          : "other";
  return { browser, os };
}

export function speechSupport() {
  if (typeof window === "undefined") return { secure: true, media: true, live: true, record: true };
  const w = window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return {
    secure: window.isSecureContext,
    media: Boolean(navigator.mediaDevices?.getUserMedia),
    live: Boolean(w.SpeechRecognition || w.webkitSpeechRecognition),
    record: typeof MediaRecorder !== "undefined",
  };
}

export async function queryMicState(): Promise<MicState> {
  if (typeof navigator === "undefined") return "unknown";
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  try {
    const perms = (navigator as Navigator & { permissions?: { query: (d: { name: string }) => Promise<{ state: string }> } })
      .permissions;
    if (perms?.query) {
      const result = await perms.query({ name: "microphone" });
      if (result.state === "granted" || result.state === "denied" || result.state === "prompt") return result.state;
    }
  } catch {
    /* Safari/Firefox kennen "microphone" in permissions.query nicht */
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((d) => d.kind === "audioinput");
    // Mit Label = bereits freigegeben; ohne Label = noch nicht gefragt
    if (mics.some((d) => d.label)) return "granted";
  } catch {
    /* egal */
  }
  return "prompt";
}

export type MicRequest = { ok: true; stream: MediaStream } | { ok: false; state: MicState; message: string };

export async function requestMicAccess(): Promise<MicRequest> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, state: "unsupported", message: "Dieser Browser gibt kein Mikrofon frei." };
  }
  if (!window.isSecureContext) {
    return {
      ok: false,
      state: "insecure",
      message: "Mikrofon nur über https oder localhost. Die Adresse im Browser beginnt mit http:// — so gibt kein Browser das Mikrofon frei.",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    return { ok: true, stream };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      return { ok: false, state: "denied", message: "Der Browser hat den Zugriff verweigert oder gemerkt, dass er einmal abgelehnt wurde." };
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return { ok: false, state: "unsupported", message: "Kein Mikrofon gefunden. Ist eines angeschlossen und im System ausgewählt?" };
    }
    if (name === "NotReadableError" || name === "AbortError") {
      return { ok: false, state: "denied", message: "Das Mikrofon ist von einem anderen Programm belegt (Zoom, Teams, Aufnahme?)." };
    }
    return { ok: false, state: "unknown", message: err instanceof Error ? err.message : "Mikrofon nicht erreichbar." };
  }
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Hangup-Beat: Track bleibt lebendig, sendet aber nichts. `stopStream` sobald die Sitzung tot ist. */
export function disableStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => {
    track.enabled = false;
  });
}

let lineAudio: AudioContext | null = null;

/** Im Klick „Leitung öffnen“ aufrufen, damit Pegel und Aufnahme später ohne neue Geste laufen. */
export function primeLineAudio() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!lineAudio || lineAudio.state === "closed") lineAudio = new Ctx();
  if (lineAudio.state === "suspended") void lineAudio.resume();
}

export function lineAudioContext() {
  return lineAudio;
}

/** Schrittfolge, um die Freigabe zu reparieren — je Browser und System. */
export function micHelp(platform: Platform, state: MicState): { title: string; steps: string[] } {
  if (state === "insecure") {
    return {
      title: "Verbindung ist nicht sicher",
      steps: [
        "Browser geben das Mikrofon nur über https:// oder auf localhost frei.",
        "Auf diesem Rechner: http://localhost:PORT statt der IP-Adresse öffnen.",
        "Von einem anderen Gerät: die App hinter https legen (z. B. Tunnel oder Zertifikat).",
      ],
    };
  }
  const browser: Record<Platform["browser"], string[]> = {
    chrome: [
      "Links neben der Adresse auf das Schloss- bzw. Einstellungssymbol tippen.",
      "„Mikrofon“ auf „Zulassen“ stellen, dann die Seite neu laden.",
      "Falls es dort nicht steht: chrome://settings/content/microphone öffnen und diese Seite aus „Blockiert“ entfernen.",
    ],
    edge: [
      "Links neben der Adresse auf das Schloss tippen → „Berechtigungen für diese Website“.",
      "„Mikrofon“ auf „Zulassen“, Seite neu laden.",
      "Sonst: edge://settings/content/microphone.",
    ],
    safari: [
      "Menü Safari → „Einstellungen für diese Website…“ (oder Rechtsklick in die Adressleiste).",
      "„Mikrofon“ auf „Erlauben“ stellen und die Seite neu laden.",
      "Safari fragt sonst bei jedem Start — „Erlauben“ wählen, nicht „Nie“.",
    ],
    firefox: [
      "Auf das Mikrofon-Symbol links in der Adressleiste tippen und die Blockierung aufheben.",
      "Oder: Einstellungen → Datenschutz & Sicherheit → Berechtigungen → Mikrofon → diese Seite erlauben.",
      "Firefox hat keine Live-Spracherkennung; die App nimmt auf und lässt Whisper transkribieren (OPENAI_API_KEY nötig).",
    ],
    other: ["In den Seiteneinstellungen des Browsers das Mikrofon für diese Adresse erlauben und neu laden."],
  };
  const os: Record<Platform["os"], string[]> = {
    mac: [
      "macOS: Systemeinstellungen → Datenschutz & Sicherheit → Mikrofon → den Browser einschalten. Danach den Browser neu starten.",
    ],
    windows: [
      "Windows: Einstellungen → Datenschutz → Mikrofon → „Apps den Zugriff erlauben“ und Desktop-Apps zulassen.",
    ],
    ios: ["iOS: Einstellungen → Safari → Mikrofon → „Erlauben“. Andere Browser auf iOS nutzen Safari-Technik."],
    android: ["Android: Einstellungen → Apps → Browser → Berechtigungen → Mikrofon erlauben."],
    other: [],
  };
  return {
    title: state === "denied" ? "Der Browser blockiert das Mikrofon" : "So geben Sie das Mikrofon frei",
    steps: [...browser[platform.browser], ...os[platform.os]],
  };
}

export function platformLabel(platform: Platform) {
  const b = { chrome: "Chrome", edge: "Edge", safari: "Safari", firefox: "Firefox", other: "Browser" }[platform.browser];
  const o = { mac: "macOS", windows: "Windows", ios: "iOS", android: "Android", other: "" }[platform.os];
  return o ? `${b} · ${o}` : b;
}
