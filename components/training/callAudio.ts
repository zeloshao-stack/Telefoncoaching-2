export function encodeWav(buffer: AudioBuffer, ranges: { start: number; end: number }[]) {
  const sampleRate = buffer.sampleRate;
  const channel = buffer.getChannelData(0);
  const pieces: Float32Array[] = [];
  let total = 0;
  for (const range of ranges) {
    const from = Math.max(0, Math.floor(range.start * sampleRate));
    const to = Math.min(channel.length, Math.ceil(range.end * sampleRate));
    if (to <= from) continue;
    const slice = channel.subarray(from, to);
    pieces.push(slice);
    total += slice.length;
  }
  if (!total) throw new Error("Keine Gegenseite-Abschnitte markiert.");
  const pcm = new Float32Array(total);
  let offset = 0;
  for (const slice of pieces) {
    pcm.set(slice, offset);
    offset += slice.length;
  }
  const bytes = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(bytes);
  const write = (pos: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(pos + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  let cursor = 44;
  for (let i = 0; i < pcm.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, pcm[i] ?? 0));
    view.setInt16(cursor, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    cursor += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

export async function decodeCallAudio(file: File) {
  const ctx = new AudioContext();
  const data = await file.arrayBuffer();
  return ctx.decodeAudioData(data.slice(0));
}
