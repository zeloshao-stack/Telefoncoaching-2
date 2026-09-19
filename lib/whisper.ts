export function whisperKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export type WhisperVerbose = {
  text: string;
  segments: { start?: number; end?: number; text?: string }[];
};

export async function transcribeWithWhisper(
  audio: Buffer,
  mime: string,
  filename: string,
): Promise<WhisperVerbose> {
  const key = whisperKey();
  if (!key) {
    throw new Error("Transkription braucht OPENAI_API_KEY (Whisper). Die Lage können Sie weiterhin tippen.");
  }
  const form = new FormData();
  const ext = filename.includes(".") ? filename : `${filename}.${mime.includes("mpeg") || mime.includes("mp3") ? "mp3" : mime.includes("wav") ? "wav" : mime.includes("mp4") ? "m4a" : "webm"}`;
  form.append("file", new File([new Uint8Array(audio)], ext, { type: mime || "audio/webm" }));
  form.append("model", "whisper-1");
  form.append("language", "de");
  form.append("response_format", "verbose_json");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    text?: string;
    segments?: { start?: number; end?: number; text?: string }[];
  };
  const segments = data.segments || [];
  const text = (data.text || segments.map((row) => row.text || "").join(" ")).replace(/\s+/g, " ").trim();
  return { text, segments };
}
