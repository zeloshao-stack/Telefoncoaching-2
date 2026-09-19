# CHG-20260918-006 — A12 Quality-Cost Deepsearch

```yaml
source: a12-quality-cost
change_id: CHG-20260918-006
status: DEEPSEARCH
deadline: "2026-09-19 02:00 Europe/Vienna"
code: none
contracts: none
cross_talk: none
fetch_date: "2026-09-18"
```

Ideen-only. Kein Produktcode, kein Provider-Default, Mini kapt den Floor nicht.

## Change Card (A12-Ausschnitt)

```yaml
change_id: CHG-20260918-006
raw_request: "Du bist A12 Quality-Cost. DEEPSEARCH. Kein Code. Kein Austausch. Deadline 02:00 Wien. Aktuelle Listenpreise 18-19.09.2026 fetch: OpenAI Realtime 2.1, Live-1, Gemini native audio, Deepgram, Eleven ConvAI, Hume, LiveKit inference. $/5-min drill Bänder. Mini nicht Floor-kappen. 5 Ideen + was NICHT empfehlen. Evidenzstufen. Qualität ≥ Floor."
user_outcome: "Business Owner sieht, was eine 5-Minuten-Übung wirklich kostet — nach Zählerart, nicht nach Marketing-€/min — und welche fünf Hebel den Floor halten."
acceptance_criteria:
  - "Listenpreise mit Primär-URL und Fetch-Datum"
  - "5-Min-Bänder LOW / EXPECTED / HIGH inklusive Idle, Retry, Abo-Untergrenze"
  - "Mini ist Vergleichsspalte, nicht Qualitätsfloor"
  - "fünf Ideen ohne Stackwechsel; explizite Nicht-Empfehlungen"
  - "Evidenz höchstens PLAUSIBEL aus Primärquelle; Drill-Dollar nie als gemessen behaupten"
non_goals:
  - "Produktcode, GO-2 anfassen, Providerwechsel als Default, 2×-Claim"
primary_owner: A12
reviewer: K12
full_scan_reason: null
```

## Floor (nicht in Dollar)

Gate A / G2: fünfminütiges glaubwürdiges Gespräch, Barge-in, Auflegen, Charakterkonsistenz. OpenAI selbst: Mini zuerst nicht; Instruction-Following und Tool-Use sind der Tradeoff. Mini bleibt Override, nicht Floor.

---

## 1. Zählerklassen — nicht eine €/min-Liste

| Klasse | Zählt | Schweigen | Cache |
|---|---|---|---|
| A Token-S2S | Audio- und Texttoken je Response; Historie wird erneut gesendet | Server-VAD: leeres Input-Audio ≈ 0 | Realtime: ja, best-effort |
| B Session-Minute | Wanduhr Start→Close, sekundengenau | voll | n. a. für die Stimme |
| C Verbindung | WebSocket/Call-Minute | voll | n. a. |
| D Abo+Overage | Monatsblock, dann €/min | voll | n. a. |
| E Kaskade | STT-Zeit + TTS-Zeichen + LLM-Token + Transport/Obs | STT oft Verbindungszeit | nur LLM-Prefix |

Zwei Stacks mit „$0.05/min“ sind nicht derselbe Euro, wenn einer Schweigen mitzählt und der andere nicht.

---

## 2. Listenpreis-Snapshot 2026-09-18 (Primärquellen)

Evidenz für die **Zahl auf der Seite**: Primärquelle, heute geholt. Evidenz für **unseren Drill**: PLAUSIBEL/HYPOTHESE, ungemessen.

### OpenAI Realtime `gpt-realtime-2.1` — Klasse A

Quelle: [Pricing](https://developers.openai.com/api/docs/pricing), [Modell](https://developers.openai.com/api/docs/models/gpt-realtime-2.1), [Cost optimization](https://developers.openai.com/api/docs/guides/voice-latency-cost)

| Modalität | Input / 1M | Cached / 1M | Output / 1M |
|---|---|---|---|
| Audio | $32.00 | $0.40 | $64.00 |
| Text | $4.00 | $0.40 | $24.00 |
| Image | $5.00 | $0.50 | — |

Wandlung (dieselbe Cost-Seite): Input-Audio 1 Token / 100 ms (600/min Sprache); Output-Audio 1 Token / 50 ms (1200/min Sprache). Leeres Input-Audio unter Server-VAD zählt nicht. Jede Response schickt die ganze Conversation. Spätere Turns werden teurer. Cache automatisch, nicht garantiert. Anweisungen mitten in der Session zu ändern zerstört den Cache.

Audio-only, nur Sprechzeit:

- Hören: 600 × $32 / 1e6 = **$0.0192 / min Nutzersprache**
- Sprechen: 1200 × $64 / 1e6 = **$0.0768 / min Modellsprache**

Kein Verbindungspreis. Optional Transkription extra (`gpt-4o-mini-transcribe` Listen ~$0.003/min; `gpt-realtime-whisper` $0.017/min). EU-Residency +10 % auf Modelle ab 5.3.2026, soweit eligible — für diesen Snapshot nicht in die Bänder gerechnet.

### OpenAI `gpt-realtime-2.1-mini` — Klasse A, **nicht Floor**

Quelle: [Pricing](https://developers.openai.com/api/docs/pricing), [Modell](https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini), Cost-Seite „Using a mini model“

| Modalität | Input / 1M | Cached / 1M | Output / 1M |
|---|---|---|---|
| Audio | $10.00 | $0.30 | $20.00 |
| Text | $0.60 | $0.06 | $2.40 |

Audio-only: Hören $0.0060 / min, Sprechen $0.0240 / min. OpenAI: Mini erst nach dem großen Modell; Instruction-Following und Function-Calling schwächer. **Nicht Floor-kappen.**

### OpenAI GPT-Live-1 — Klasse B + Backend extra

Quelle: [Pricing](https://developers.openai.com/api/docs/pricing), [Modell](https://developers.openai.com/api/docs/models/gpt-live-1), [Cost optimization](https://developers.openai.com/api/docs/guides/voice-latency-cost)

- Stimme: **$0.05 / min**, sekundengenau, **kein Aufrunden**
- Zählt Nutzer, Assistent, **beide still**, Backend denkt
- Muting schließt die Session nicht
- `POST /v1/live/sessions` stellt 15 s in Rechnung, wird auf die Laufzeit gutgeschrieben — nicht 15 s extra draufrechnen; Reconnects und Früh-Mint kosten trotzdem
- Backend (Responses, Tools) **zusätzlich** zur Stimme

### Gemini native audio (`gemini-3.8-live`) — Klasse A ohne Cache

Quelle: [Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing) (Gruppe 3.8 Live / 3.8 Live Extended Thinking / 3.1 Flash Live Preview), [Modellkarte](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live) Stand Sep 2026

Paid:

- Text in $0.75 / 1M, Text out $4.50 / 1M (inkl. Thinking)
- Audio in **$3.00 / 1M ≈ $0.005/min**
- Audio out **$12.00 / 1M ≈ $0.018/min**
- Bild/Video in $1.00 / 1M ≈ $0.002/min

Modellkarte: **Caching not supported.** Free Tier „used to improve our products“. Video-Default kann Kontext/Kosten treiben. Die $0.005+$0.018 sind Googles Minuten-Äquivalent für **neue** Audio-Token, nicht für rebilled Kontext.

Älteres `gemini-2.5-flash-native-audio-preview-12-2025`: $0.50 Text-in, $3 Audio/Video-in, $2 Text-out, $12 Audio-out — nicht die aktuelle 3.8-Liste.

### Deepgram — Klasse C (Agent) / STT+TTS separat

Quelle: [deepgram.com/pricing](https://deepgram.com/pricing) 2026-09-18. Flux-TTS-Promo **in** Voice Agent endete 12.09.2026; unten **Post-Promo**.

Voice Agent, PAYG, WebSocket-Verbindungszeit (Schweigen zählt):

| Tier | $/min |
|---|---|
| Standard | **$0.075** |
| Standard BYO TTS | $0.065 |
| Custom BYO LLM+TTS | $0.050 |
| Advanced | $0.163 |
| Advanced BYO TTS | $0.122 |

Growth darunter (Standard $0.068, Advanced $0.146, BYO LLM+TTS $0.041). Custom BYO LLM PAYG-Zelle in der Seite unvollständig; Growth **$0.059** sichtbar. BYO = Deepgram-Minute **plus** fremdes LLM/TTS.

Streaming-STT PAYG: Flux EN Promo $0.0065 / Liste $0.0077; Nova-3 mono Promo $0.0048 / Liste $0.0077. TCO mit **Liste**, nicht Promo. Aura-2 TTS $0.030 / 1k Zeichen PAYG. STT-Add-ons (Redaction $0.0020/min usw.) extra.

### Eleven ConvAI (ElevenAgents) — Klasse D + LLM extra

Quelle: [elevenlabs.io/pricing/agents](https://elevenlabs.io/pricing/agents)

| Plan | $/Mo | Inkl. Minuten | Concurrent |
|---|---|---|---|
| Free | 0 | 15 | 4 |
| Starter | 6 | 75 | 6 |
| Creator | 22 (1. Monat 11) | 275 | 10 |
| Pro | 99 | 1 238 | 20 |
| Scale | 299 | 3 738 | 30 |
| Business | 990 | 12 375 | 40 |

Zusatzminute **$0.080**. Burst über Concurrent **$0.160**. Textnachricht $0.003. **LLM und Telefonie extra.** Inkludierte Minuten sitzen arithmetisch auf ~$0.08. Speech-Engine-API ebenfalls $0.08/min Plattform (elevenlabs.io/pricing/api).

### Hume EVI — Klasse D + optionales Fremd-LLM

Quelle: [hume.ai/pricing](https://www.hume.ai/pricing), [Billing](https://dev.hume.ai/docs/resources/billing.mdx)

Offiziell heute vollständig lesbar: Abo bündelt TTS+EVI+Voice; Overage nach Plan; Business-Overage **$0.04/min**; EVI 3 und **EVI 4 mini** existieren (Mini nicht Floor); fremdes LLM über Hume wird extra berechnet, eigenes Key nicht. Untere Stufen: Seiten-Fetch unvollständig. Aggregatoren (Juli–Sep 2026, Pricing-Seite): Starter $3 / 40 min / $0.07; Creator $14 / 200 / $0.07; Pro $70 / 1 200 / $0.06; Scale $200 / 5 000 / $0.05; Business $500 / 12 500 / $0.04. Diese Stufen = PLAUSIBEL (Sekundär), nicht als eigene Messung.

### LiveKit Inference — Klasse E (+ Cloud-Session)

Quelle: [livekit.com/pricing/inference](https://livekit.com/pricing/inference), [livekit.com/pricing](https://livekit.com/pricing)

Credits: Build $2.50, Ship $5, Scale $50 (danach Modellpreis; Scale mit STT/TTS-Rabatt).

STT Build/Ship $/min: Nova-3 mono **$0.0048**, Flux **$0.0065**, Assembly Universal-Streaming $0.0025.

TTS $/1M Zeichen Build/Ship: Cartesia Sonic-Linie **$50** (LiveKit-Estimator **$0.0300/min**), Aura-2 $30, Flux TTS $45.

LLM: durchgereichte Listen (Beispiele Input/Cached/Output pro 1M): Gemini 3.8 Flash $0.75/$0.075/$3.75; GPT-5.6 Terra $2/$0.20/$12; GPT-5.6 Sol $4/$0.40/$20. LiveKit-Estimator „per minute“ (deren Mix, nicht unseres): GPT Realtime **$0.0676/min**, GPT Realtime mini $0.0216/min, Gemini Live 2.5 Flash Native Audio $0.0144/min, Default-Kaskade-Beispiel **$0.0672/min** (LLM 0.0100 + STT 0.0058 + TTS 0.0300 + Obs 0.0100; Session oft +$0.01 nach Kontingent).

Cloud extra nach Kontingent: Agent-Session $0.01/min, Recordings $0.005/min, WebRTC $0.0004–0.0005/min. Self-Host: Inference-Preise ohne diese Zeile, plus eigene Infra.

---

## 3. $/5-min-Drill-Bänder

Annahmen **PLAUSIBEL**, nicht am Produkt gemessen. Drill = 5 min Wanduhr, österreichisches Coaching-Gespräch.

Sprechmix EXPECTED: ~45 % Nutzer, ~35 % Figur, Rest Pause/Barge-in. LOW: weniger Figur, Cache hält, ein Versuch. HIGH: 1,3× inkl. Abbruch/Retry/Dev-Replay, Cache-Bruch oder Schweigezähler, Abo-Untergrenze.

Transkriptions-Add-on 2.1: `gpt-4o-mini-transcribe` ~$0.015/Drill in EXPECTED (klein). Nicht Whisper-$0.017/min.

| Stack | Klasse | LOW | EXPECTED | HIGH | Was HIGH enthält |
|---|---|---|---|---|---|
| **2.1 (Floor-Default)** | A | $0.15–0.25 | **$0.25–0.50** | $0.70–1.50 | Historie-Rebill, Reasoning, Retry 1,3×, Cache-Bust |
| 2.1-mini | A | $0.05–0.10 | $0.08–0.18 | $0.25–0.55 | **kein Floor** |
| GPT-Live-1 Stimme | B | $0.25 | $0.25 | $0.33–0.40 | 5 min × $0.05 immer; HIGH = Retry/Reconnect |
| Live-1 + Backend | B+Token | $0.30 | **$0.35–0.70** | $0.80–1.50 | Terra/Sol/Tools; Idle trotzdem $0.05/min |
| Gemini 3.8 Live **nur neue Audio-Token** | A | $0.08 | $0.12–0.25 | **nicht als TCO lesbar** | **Kein Cache.** EXPECTED ist **nicht** all-in. Kontext-Rebill UNBEKANNT |
| Deepgram VA Standard | C | $0.38 | $0.38 | $0.49–0.82 | 5 × $0.075 immer; Advanced $0.82; Retry |
| Deepgram BYO LLM+TTS | C+fremd | $0.25+ | $0.35–0.70 | $1+ | $0.25 + LLM + TTS |
| ElevenAgents **10 Drills/Mo auf Starter** | D | — | **~$0.60** blended | $0.80–1.50 | $6/50 min ≈ $0.12/min; plus LLM. $0.40 wäre nur Overage ohne Abo |
| ElevenAgents Overage allein | D | $0.40 | $0.40–0.70 | $0.80 Plattform Burst | $0.08×5 + LLM; Burst wenn Concurrent gerissen |
| Hume EVI **10 Drills auf Starter** | D | — | **~$0.37** blended | $0.50–1.20 | $3 + 10×$0.07 Overage / 10 Drills; plus LLM; Mini-EVI nicht Floor |
| Hume Overage allein | D | $0.20–0.35 | $0.20–0.45 | $0.50–1.20 | $0.04–0.07×5; Unterstufen Sekundär |
| LiveKit Kaskade Build | E | $0.15 | **$0.30–0.45** | $0.60–0.90 | Estimator ~$0.34 + Session/Obs nach Kontingent |
| LiveKit + GPT Realtime | E+A | — | ~$0.34 Modell + Transport | wie 2.1 HIGH + $0.05–0.10 | kein Sparpfad |

Nicht in der Live-Spalte: Post-Call Evaluator/Coach **+$0.02–0.15/Drill PLAUSIBEL** (ein Textmodell-Lauf). USt. nicht enthalten.

**Lesart:** Gut getuntes 2.1 EXPECTED sitzt in derselben Größenordnung wie Live-1+Backend, Deepgram Standard und LiveKit-Kaskade — oft **$0.25–0.50 / Drill**. Gemini-$0.12–0.25 ist **Audio-Liste ohne Kontext**, kein Vergleichspreis. Mini ist billiger und **darf den Floor nicht setzen**. Eleven/Hume bei Gate-A-Volumen über **Abo**, nicht über die Overage-Minute.

Gate-A-Monat (HYPOTHESE, K12-Neurechnung): 10 Zielnutzer-Drills + Dev/Test **5–20×** → 50–200 Drills. 2.1 EXPECTED **$15–100** Live, HIGH bis ~$300 wenn jede Session Retry+Cache-Bust ist. Eine Integrationswoche für einen anderen Zähler frisst die Spreizung.

---

## 4. Was bestehende Produkte tun (Beobachtung ≠ Übernahme)

| Produkt | Beobachtung | Quelle | Für uns |
|---|---|---|---|
| OpenAI Cost guide | Zwei Rechnungen: Stimme vs Backend; Idle schließen; 15 s Init; großes Modell zuerst, dann Mini testen | voice-latency-cost, 18.09.2026 | Ledger und Session-Close, kein Mini-Default |
| OpenAI Realtime | `response.done.usage` nach Modalität und Cache; VAD filtert Leere; Cache stirbt bei History-Edit | dieselbe Seite | Zähler existiert schon beim Provider |
| LiveKit Estimator | LLM+STT+TTS+Obs getrennt; GPT Realtime $0.0676/min als deren Mix | livekit.com/pricing | Vorlage für Ledger-Zeilen, nicht für Umzug |
| ElevenAgents | $0.08 Plattform, LLM extra, Burst 2× | pricing/agents | Abo+Burst tötet Prototype-TCO |
| Deepgram VA | Minute = Websocket, Promo im Agent tot seit 12.09. | deepgram.com/pricing | Liste $0.075, nicht $0.056 |
| Gemini 3.8 Live | Cheap audio, **Caching not supported**, Free=Training | model card + pricing | Billig-Liste ≠ billiger Drill |
| Hume | Abo+Overage, EVI 4 mini auf der Karte | hume.ai/pricing | Mini-Variante nicht Floor |
| GPT-Live-1 | $0.05 inkl. Stille; Backend extra; ChatGPT-Voice-Verwandter | pricing + model | Anderer Vertrag, kein Cost-Win ohne Idle-Messung |

Kein „wir nehmen Produkt X“.

---

## 5. Fünf Ideen (Qualität ≥ Floor)

Alle **HYPOTHESE**. Kleinster Hebel zuerst. Kein Stackwechsel.

1. **Ledger aus `response.done.usage` je `live_call_id`**  
   Audio-in/out, Text, cached, Transcribe getrennt, plus Wanduhr und Ausgang (Hangup/Abbruch/Retry). Gate A verlangt gemessene Kosten. Ohne Ledger sind alle Bänder Folklore. Qualität: null. Kostenwirkung: ermöglicht späteres Streichen ohne Floor-Schnitt.

2. **Session-Prefix einfrieren**  
   OpenAI: Cache hält, wenn History/Instructions statisch bleiben. Kein Mid-Call-Rewrite der Anweisungen, Tools unverändert. Doppelt: weniger Token, Figur bleibt dieselbe Person. Nicht GO-1 wieder öffnen — nur Stabilität nach GO-1.

3. **Session hart schließen wenn das Gespräch tot ist**  
   Live-1-Lehre, gilt analog: Mute ≠ Close; Früh-Mint und hängende WebRTC-Sessions sind echte Euro. Auflegen und Abbruch müssen die Realtime-Session beenden. Qualität: eher Gewinn (keine Geisterstimme). **Nicht GO-2 anfassen** (Barge-in/Mic-Stop läuft parallel). Nur Kostenbeobachtung; Bau erst nach A02+BO an genau eine Rolle.

4. **Audio-Floor 2.1; Post-Call darf billiger sein**  
   Evaluator/Coach liegen außerhalb des Realtime-Pfads. Eleven/Hume trennen Speech-Engine und LLM — dasselbe Muster, ohne deren Plattform zu kaufen. Semantischer Cache **nicht** auf individuelle Coaching-Scores. Evaluator-Modell nur mit A09-Floor, nicht „einfach Mini“.

5. **Nur gleiche Zählerklasse vergleichen + Dev/Retry in die Unit Economics**  
   Decision-Matrix für BO: Klasse A/B/C/D/E, Schweigen ja/nein, Cache ja/nein, Abo-Untergrenze. HIGH-Band ist die Planungszahl, nicht LOW. Verhindert den Fehlkauf „Gemini $0.023/min“.

---

## 6. Nicht empfehlen

- **Mini als Floor oder Gate-A-Default.** Liste ~3× billiger; OpenAI und Charakter-Floor widersprechen. Override bleibt.
- **Gemini native audio als Spar-Default.** Liste billig, Cache aus, AT-Deutsch/Zinshaus unbelegt, Free-Tier trainiert mit. HIGH UNBEKANNT.
- **Deepgram / Eleven ConvAI / Hume / LiveKit Inference als Gate-A-Austausch.** Andere Zähler, Lock-in, Integrationsstunden ≫ $15–100/Monat. Deepgram-Promo ist tot.
- **Live-1 weil $0.05 < $0.0768 Sprechen.** Idle und Backend und 15 s Init; neuer Vertrag; Qualitätsgewinn ungemessen.
- **EVI 4 mini / Realtime mini / günstigste LiveKit-LLM als Floor.**
- **Semantischer Cache individueller Bewertungen.**
- **Stilles Kostencap, das den Call tötet.** Degradierter Modus oder harter sichtbarer Stopp.
- **2×-Qualität oder Anbieter-Parität.**
- **Kaskade als Hauptstimme** (STT+LLM+TTS), um Liste zu drücken — Barge-in/Prosodie unbelegt, mehrere Rechnungen.

---

## 7. Quality-Cost Decision Matrix (Gate A)

| Option | Floor | 5-min EXPECTED | Lock-in / Bau | Urteil jetzt |
|---|---|---|---|---|
| 2.1 belassen + Ledger + Close + Cache-Hygiene | hält | $0.25–0.50 | schon da | **einzige Floor-treue Kostenarbeit** |
| Mini-Default | reißt Instruction-Floor | $0.08–0.18 | Env-Flag | **nein** |
| Live-1 | unbelegt | $0.35–0.70 inkl. Backend | neuer Pfad | DEFER / Experiment nach Messung |
| Gemini 3.8 Live | unbelegt | Audio-Liste $0.12–0.25; **TCO nicht lesbar** (kein Cache) | neuer Pfad + kein Cache | nicht Spardefault |
| Deepgram VA Standard | unbelegt | $0.38 | neuer Pfad | nicht Spardefault |
| Eleven $0.08+LLM | unbelegt | ~$0.60 blended bei 10 Drills/Mo | Abo+Burst | nicht Spardefault |
| Hume EVI | unbelegt | ~$0.37 blended bei 10 Drills/Mo + LLM | Abo | nicht Spardefault |
| LiveKit Kaskade | unbelegt | $0.30–0.45 | Transport+3 Modelle | nicht Spardefault |

Break-even Self-Host/Kaskade: erst wenn **gemessene** 2.1-Kosten × Volumen > Integrations-TCO + Qualitätsdelta. Bei Gate-A-Volumen nicht gegeben.

---

## 8. Grenzen

- Kein eigenes `usage`-Sample aus einer S01–S03-Session → Drill-Dollar nicht VERIFIZIERT.
- Hume-Unterstufen Sekundär.
- Deepgram Custom BYO LLM PAYG-Zelle lückenhaft.
- LiveKit $-/min für TTS/LLM = deren Estimator-Mix.
- USD, ohne USt., ohne Support-Stunden außer qualitativ.
- GO-2 unangetastet.

## K12 Gegenprüfung (nach A, getrennt)

Prüfumfang: Listen-Snapshot, Zählerklassen, 5-min-Bänder mit Idle/Retry/Abo, Mini-Floor, fünf Ideen, Nicht-Empfehlungen.

BEFUNDE (in dieser Datei eingearbeitet):

- K12-1 MAJOR — Eleven/Hume EXPECTED war Overage ohne Abo-Untergrenze bei 10 Drills/Mo. Verletzung: Unit Economics inkl. Mindesttarif. Korrektur: blended ~$0.60 / ~$0.37.
- K12-2 MAJOR — Gemini EXPECTED als vergleichbare Drill-Zahl lesbar, obwohl Caching not supported. Korrektur: Zeile „nur neue Audio-Token“, TCO nicht lesbar.
- K12-3 MINOR — Evaluator nicht in Live-Band. Korrektur: +$0.02–0.15 ausgewiesen.
- K12-4 MINOR — Dev 5–20× fehlte in der Monatsrechnung. Korrektur: Gate-A-Monat 50–200 Drills.
- K12-5 NOTE — Idee 3 darf GO-2 nicht berühren. Korrektur: explizit.

URTEIL: Dossier als DEEPSEARCH intern tragfähig. **Keine Bau-Freigabe.** Mini bleibt Nicht-Floor. Providerwechsel bleibt Nicht-Empfehlung.

## Nächster kleinster Hebel (HYPOTHESE)

Nach A02+BO, eine Primärrolle: **Kostenzeilen aus Realtime-`usage` persistieren** (A05 mit A12-Schema, oder A10 Telemetrie) — nicht Modell tauschen.
