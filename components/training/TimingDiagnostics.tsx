"use client";
import { useState } from "react";
import { readLiveTimings, type LiveTiming } from "@/lib/live-metrics";

export function TimingDiagnostics() {
  const [samples, setSamples] = useState<LiveTiming[] | null>(null);
  return <section className="connection-panel"><h2>Reaktionszeiten prüfen</h2>
    <p>Messwerte dieses Browser-Tabs. Ausgabe bedeutet das gemeldete Startsignal der Audioausgabe, nicht den akustisch gehörten Beginn.</p>
    <button type="button" onClick={() => setSamples(readLiveTimings())}>Messwerte laden</button>
    {samples !== null && (samples.length ? <ul>{(["setup", "speech_to_output", "text_to_output"] as const).map(kind => {
      const values = samples.filter(s => s.kind === kind).map(s => s.ms).sort((a,b) => a-b);
      if (!values.length) return null;
      const labels = { setup: "Verbindungsaufbau", speech_to_output: "Sprechende bis Ausgabestart", text_to_output: "Texteingabe bis Ausgabestart" };
      return <li key={kind}>{labels[kind]}: Median {values[Math.floor(values.length / 2)]} ms · {values.length} Messungen</li>;
    })}</ul> : <p>Noch keine Messungen vorhanden. Zuerst ein Telefontraining durchführen.</p>)}
  </section>;
}
