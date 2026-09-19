"use client";

/**
 * Nur Kaskade (lokales TTS). Der WebRTC-Live-Pfad nutzt Client-Stufe A/B
 * (`interrupt_response: false` im server_vad-Default) — keine zweite RMS-Watch.
 *
 * Wacht am Mikrofon, während die Gegenseite spricht.
 * Sobald echte Stimme über dem Grundrauschen liegt, wird gemeldet — Dazwischengehen wie am Telefon.
 * Echo-Unterdrückung des Browsers hält die eigene Wiedergabe weitgehend draußen.
 */
export function startBargeInWatch(onVoice: () => void, existing?: MediaStream | null): () => void {
  let stopped = false;
  let stream: MediaStream | null = null;
  let ctx: AudioContext | null = null;
  let raf = 0;
  const owned = !existing;

  const stop = () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    if (owned) stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    void ctx?.close().catch(() => undefined);
    ctx = null;
  };

  if (typeof navigator === "undefined" || (!existing && !navigator.mediaDevices?.getUserMedia)) return stop;

  void (async () => {
    try {
      stream =
        existing ??
        (await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
        }));
      if (stopped) {
        if (owned) stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);

      const started = performance.now();
      let floor = 0;
      let floorSamples = 0;
      let loudSince = 0;

      const tick = () => {
        if (stopped || !ctx) return;
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
        const rms = Math.sqrt(sum / buffer.length);
        const elapsed = performance.now() - started;

        if (elapsed < 500) {
          floor += rms;
          floorSamples += 1;
        } else {
          const base = floorSamples ? floor / floorSamples : 0.005;
          const threshold = Math.max(base * 3.5, 0.02);
          if (rms > threshold) {
            if (!loudSince) loudSince = performance.now();
            if (performance.now() - loudSince > 220) {
              stop();
              onVoice();
              return;
            }
          } else {
            loudSince = 0;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      /* kein Mikrofon — Dazwischengehen bleibt über die Taste möglich */
    }
  })();

  return stop;
}
