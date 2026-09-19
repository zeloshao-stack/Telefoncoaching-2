# CHG-20260918-005 — A01 Live-Architektur (unabhängig)

```yaml
source: a01-systemarchitektur
agent_id: fd46767e-10ac-41af-abd4-54fe8263b843
status: EXPERIMENT ERFORDERLICH
```

Engpass: Regelbuch-Text auf dem S2S-Pfad, nicht Mini vs 2.1. Astra spricht nicht. ChatGPT-Differenz zeigt auf GPT-Live-1 (full-duplex + Delegate). Gemini Live kein Drop-in. Cascade als Hauptstimme: nein.

ADOPT-Verträge: Audio-Uhr ≠ State-Uhr; Speech Policy statt Persona-Dump; VoicePort vor zweitem Provider; Hangup-Owner = State Engine.

Experiment: GPT-Live-1 Delegate gegen heutiges Realtime. 300 ms ist kein SLA.
