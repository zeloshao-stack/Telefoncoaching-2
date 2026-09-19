import assert from "node:assert/strict";
import { test } from "node:test";
import { appendLiveTiming, LIVE_METRICS_LIMIT, readLiveTimings, type LiveTiming } from "../live-metrics";

test("transport measurements retain only the last bounded samples", () => {
  let samples: LiveTiming[] = [];
  for (let i = 0; i < 100; i++) samples = appendLiveTiming(samples, {kind: "speech_to_output", ms: i, at: "test"});
  assert.equal(samples.length, LIVE_METRICS_LIMIT);
  assert.equal(samples[0].ms, 20);
  assert.equal(samples.at(-1)?.ms, 99);
});

test("invalid measurements do not create fake zero timings", () => {
  const samples: LiveTiming[] = [];
  for (const ms of [-1, NaN, Infinity]) assert.deepEqual(appendLiveTiming(samples, {kind: "setup", ms, at: "test"}), []);
  assert.deepEqual(readLiveTimings(), []); // SSR/storage unavailable
});
