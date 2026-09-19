/** Browser-observed transport timings, never a claim about sound reaching a listener. */
export type LiveTiming = {
  kind: "setup" | "speech_to_output" | "text_to_output";
  ms: number;
  at: string;
};
export const LIVE_METRICS_LIMIT = 80;
export const LIVE_METRICS_KEY = "tc-live-timings-v1";

export function appendLiveTiming(previous: LiveTiming[], sample: LiveTiming): LiveTiming[] {
  if (!Number.isFinite(sample.ms) || sample.ms < 0) return previous;
  return [...previous, { ...sample, ms: Math.round(sample.ms) }].slice(-LIVE_METRICS_LIMIT);
}

/** Only timings; no transcripts, credentials, names, session IDs or audio. */
export function readLiveTimings(): LiveTiming[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(LIVE_METRICS_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is LiveTiming =>
      !!v && ["setup", "speech_to_output", "text_to_output"].includes(v.kind) &&
      Number.isFinite(v.ms) && v.ms >= 0 && typeof v.at === "string",
    ).slice(-LIVE_METRICS_LIMIT).map(({ kind, ms, at }) => ({ kind, ms, at }));
  } catch { return []; }
}

export function saveLiveTiming(sample: LiveTiming): LiveTiming[] {
  const samples = appendLiveTiming(readLiveTimings(), sample);
  try { sessionStorage.setItem(LIVE_METRICS_KEY, JSON.stringify(samples)); } catch { /* storage disabled */ }
  return samples;
}
