import { transcribeWithWhisper } from "@/lib/whisper";

export function decodeDictationAudio(audioBase64: string) {
  const raw = (audioBase64 || "").replace(/^data:[^;]+;base64,/, "").trim();
  if (!raw) throw new Error("Keine Aufnahme.");
  const audio = Buffer.from(raw, "base64");
  if (audio.length < 800) throw new Error("Aufnahme zu kurz. Bitte noch einmal sprechen oder die Lage tippen.");
  if (audio.length > 12_000_000) throw new Error("Aufnahme zu groß (max. ca. 12 MB).");
  return audio;
}

export async function transcribeDictation(audio: Buffer, mime: string): Promise<string> {
  const { text } = await transcribeWithWhisper(audio, mime || "audio/webm", "diktat");
  if (!text) throw new Error("Kein Transkript. Die Aufnahme ist zu leise oder zu kurz — oder tippen Sie die Lage.");
  return text;
}
