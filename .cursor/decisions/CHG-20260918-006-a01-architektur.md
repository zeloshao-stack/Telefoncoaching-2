# CHG-20260918-006 — A01 Live-Architektur

```yaml
source: a01-systemarchitektur
agent_id: 4e225e29-051f-4248-8d41-50222f21ecbb
status: FREIGEGEBEN (Recherche, kein Code)
```

Kein Provider-Tausch. Härtester Fund: Gehört ≠ Generiert ≠ Instruction-Ack ≠ Tool-Return. `session.update`-Vollreplace und `end_call` auf dem S2S-Modell verletzen genau diese Grenzen.

Nächster Vertrag: `heard_ms`/`heard_text` in die State Engine; Hangup discard-on-interrupt; kein Vollreplace als Anti-Hilfe. Nicht senden: `conversation.item.truncate` auf WebRTC. Live-1 nur mit Append-Adapter. Kein zweites Framework (LiveKit/Pipecat/Vapi) für Gate A.
