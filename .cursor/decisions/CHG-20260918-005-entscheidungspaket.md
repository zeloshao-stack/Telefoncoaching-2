# CHG-20260918-005 — Entscheidungspaket an Produktüberwacher + Business Owner

```yaml
status: WARTE_AUF_ENTSCHEIDUNG
prozess: 14 isolierte Ideendossiers, kein Cross-Talk, kein Code
produktueberwacher: A02 (Kriterien unabhängig FREIGEGEBEN)
business_owner: Reinhard
naechster_schritt: eine Primärrolle bauen — erst nach GO
```

## Wie A02 den Sprung definiert (unabhängig)

Quantensprung = **Person am Telefon**, nicht ChatGPT-Voice-Klon. Menschlich **und** hilfreich = Fail. P0 vor jedem Stackwechsel. S2S nicht Default. Kein 2×-Claim.

## Unabhängige Konvergenz (ohne Austausch)

Dieselben drei Sätze tauchen bei A01, A06, A07, A11, A12, A13 auf:

1. **Nicht Gemini, nicht Deepgram, nicht Astra-Audio, nicht Mini.** Live bleibt OpenAI Realtime `gpt-realtime-2.1`.
2. **Der FAQ-Ton kommt vom Dossier im Prompt**, nicht vom Transport. Live ist schon Sprache-zu-Sprache.
3. **ChatGPT Voice = GPT-Live-1**, anderer Vertrag. Astra denkt, spricht nicht. 300-ms-GPT-4o-Zeile ist veraltet.

## Empfohlene Umsetzung (A00, gegen A02-P0)

| Prio | Was | Primär | Nicht |
|---|---|---|---|
| **GO-1** | Sprechkanal = Ich-Szene. REGELN/Telefonbuch/Diagnosefrage raus. Live-Fakten wie Text redigieren. Keine Nie-Listen. Trainer-Constraints stumm. | **A07** (A13 Vertrag) | Modell-Swap |
| **GO-2** | Barge-in-Sperre bis Cancel; Mic-Stop; Status „Leitung offen“, nicht „überlegt“ | A04 dann A03 | zweite VAD |
| **GO-3** | VAD: Denkpause ≠ Ende, mhm ≠ Barge-in; dann Truncate | A06 | Gemini |
| **DEFER** | GPT-Live-1, Gemini, Cascade-Live, Mini-Default, Telefon-UI-Komplettumbau, Ledger/Ops | — | Gate-A-Blocker |

## Gemini-Frage, eine Antwort

Es gibt kein „bestes LLM für STT+Antwort“. Gate A: **ein** Stack, der schon da ist. Qualität holen wir, indem die Figur aufhört, ihr Regelbuch vorzulesen.

## GO / NO-GO

- **GO-1 jetzt** — trifft Nutzerkritik „Rechtsregeln / Telefonbuch / KI-Antwort“.
- GO-2/GO-3 danach, getrennt, je eine Primärrolle.
- Kein All-15-Code.
