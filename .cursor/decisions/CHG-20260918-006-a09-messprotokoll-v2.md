# CHG-20260918-006 — A09 Messprotokoll v2 (DEEPSEARCH)

```yaml
change_id: CHG-20260918-006-A09
source: a09-evaluation
status: DEEPSEARCH — kein Code, kein Cross-Talk
supersedes: CHG-20260918-005-a09-messung.md (v1 Kurzprotokoll)
deadline: "2026-09-19 02:00 Europe/Vienna"
product_quality: UNBEKANNT
```

Change Card (Auszug):

```yaml
raw_request: "Du bist A09 Evaluation. DEEPSEARCH. Kein Code. Kein Austausch. Deadline 02:00 Wien. BLOCK unbelegte Claims. Wie messen Hume, MOS papers 2025-26, Full Duplex Bench, SpokenWOZ, human-likeness evals, A/B voice arena? Was ist in 1 Woche für „nicht Telefonbuch“ belastbar vs was Vendor-Folie ist. Liefere Messprotokoll v2 mit Quellen. ChatGPT/Astra/Gemini nicht als Parität."
user_outcome: "Ein reproduzierbares Messprotokoll, das „nicht Telefonbuch / Person am Telefon“ operationalisiert; unbelegte Qualitätsclaims blockt; ChatGPT Voice / Astra / Gemini nicht als Paritätsziel setzt."
primary_owner: A09
reviewer: K09
non_goals:
  - Produktcode, Contract-Änderung, Providerwechsel
  - MOS als Gate A
  - Parität zu ChatGPT Voice, Astra, Gemini Live, Hume EVI
  - SpokenWOZ-Leaderboard als Coaching-Beweis
full_scan_reason: null
```

v1 bleibt gültig in der Kernaussage (Telefonbuch-Turn-Rate, Golden 24, A/B nur gegen Freeze, n≈12–18 kein Gate). v2 spezifiziert Konstrukte, Quellen, was in 7 Tagen belastbar ist, und ein Claim-Register.

---

## A — Auftragsverständnis

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung: Reinhard kann in 1 Woche entscheiden, ob die Figur aufhört, Rechtsregeln/FAQ vorzulesen — mit Stichprobe, Metrik, Fehlertoleranz. Kein „klingt wie ChatGPT“.
- betroffene Komponente: Evaluation / Claim Register / Annotation; nicht Live-Stack, nicht Prompt (GO-1 bleibt zu).
- Nicht Ziele: MOS-Gate, Vendor-Parität, SpokenWOZ-SOTA, Voice-Arena-Elo, automatische MOS-Predictor, Produktcode.
- Annahmen: „Telefonbuch“ = Rezitation von Regel/FAQ/Trainerstimme statt Ich-Szene (A02 P0). Messung Wien, österreichisches Deutsch.
- Unbekannt: aktuelle TB-Rate am Live-System nach GO-1 (kein eigener Lauf in diesem Dossier).
- Akzeptanz: Protokoll mit Quellen; BLOCK-Liste; 1-Wochen-Design mit Power-Grenze; unabhängige K09-Prüfung.
```

---

## A — Impact

```text
IMPACT_PLAN
- Dateien: nur dieses Dossier. Kein Produktcode. GO-2 unangetastet.
- Verträge: keine. Claim-Register ist Messpolitik, kein Runtime-Vertrag.
- abhängige Rollen (nach BO, nicht jetzt): A07/A13 liefern Stimuli; A06 Timing-Logs; A08 Rubrik bleibt getrennt vom Role Player; A11 Consent für Hörtester.
- Wiederverwendung: Gate-A Checkliste (S01/S02), v1 Kurzprotokoll, existing `unverifiableClaims` nur für Trainee-Pitches — nicht für Figur-Telefonbuch.
- kleinster Umfang: Operationalisierung + Annotation Manual + was NICHT gemessen wird.
- Zieltests: keine in DEEPSEARCH.
- Qualität: ohne Messung UNBEKANNT. Kosten: 2 Annotatoren × ~4 h + 12–18 Hörvergleiche, kein Crowdsourcing-MOS.
```

---

## 1. Konstrukt (sonst ist jede Zahl Theater)

**Zielkonstrukt C0 — „nicht Telefonbuch“.** Die Gegenseite spricht in diesem Anruf als Person in der Szene. Sie zitiert keine Rechtsregeln, kein FAQ, kein Dossier, keine Trainerfrage.

Das ist **kein** Konstrukt von:

| Fremdkonstrukt | Misst | Warum nicht C0 |
|---|---|---|
| ITU MOS / Naturalness | Hörqualität isolierter Sätze | Sättigung; unterdefiniert; kontextlos |
| Human-likeness 1–5 real vs synth | Spoofing / Detektion | Eine FAQ-Stimme kann „menschlich“ klingen |
| SpokenWOZ JGA / INFORM / SUCCESS | Slot-Füllung in engl. TOD | Anderes Genre, anderes Ziel |
| Voice Arena Elo | Pairwise TTS-Naturalness, meist EN | Falsche Sprache, falsche Unit (Clip ≠ Call) |
| Hume EVI 7 Dimensionen | Unstrukturiertes „say something interesting“ | Anderes Produkt, Vendor-Protokoll |
| ChatGPT Voice / Astra / Gemini | Andere Verträge, andere Apps | Parität ist Kategoriefehler |

**Zwei Achsen, getrennt berichten** (A02 P1, hier als Messregel):

1. **Person** — Szene/Motiv, nicht Skript.
2. **No-Help** — nicht Trainer, nicht Assistent.

Menschlich **und** hilfreich = Fail. Eine Achse allein ist kein Erfolg.

**Text vs Stimme getrennt** (Hume RW-Voice-EQ, STS-Ablation; siehe Quellen). Ein Turn kann im Wortlaut Telefonbuch sein bei natürlicher Stimme, oder im Wortlaut in der Szene bei Vorlese-Prosodie. Aggregation über Modalitäten ist Leakage.

---

## 2. Wie die genannten Systeme wirklich messen

Evidenzstufe hier: **VERIFIZIERT = so steht es in der Primärquelle.** Übertragbarkeit auf uns: **PLAUSIBEL oder HYPOTHESE**, nie Produktbeweis.

### 2.1 Hume

**EVI 3 Blog (Cowen, 2025-05-29).** Drei interne Studien, keine ITU-Referenz, keine vollständige Stichprobenbeschreibung in der Primärquelle.

1. **Overall preference.** Blind auf Hume-Survey-Plattform vs GPT-4o. 1–3 min unstrukturiert, Prompt „Get the AI to say something interesting.“ Sieben 5-Punkt-Dimensionen: amusement, audio quality, empathy, expressiveness, interruption handling, naturalness, response speed. Ergebnis: EVI 3 höher „on average“. **Kein n, kein CI, keine Interrater-Angabe in der Primärquelle.**
2. **Emotion/style modulation.** 30 Zielstile. EVI 3 und GPT-4o über API blind auf der Plattform. **Gemini und Sesame: Teilnehmer wurden in die jeweiligen Apps geschickt** — anderes UI, andere Blindheit, nicht dasselbe Protokoll. Rating 1–5 „wie gut ausgedrückt“.
3. **Emotion understanding.** Gleiche Lexik, neun gespielte Emotionen. Teilnehmer bewerten Erkennungsgenauigkeit und Naturalness 1–5 vs GPT-4o.
4. **Latency.** Praktische Lücke User-Ende → Assistant-Start, gemessen **aus dem New Yorker Büro**; EVI auf US-Westküste. Tabelle: Gemini Live API ~1.5 s, GPT-4o Realtime ~2.6 s, Sesame Web ~1 s, EVI 3 Web ~1.2 s. Hume selbst: Endnutzerlatenz hängt von Netz, Last, Implementierung ab.

**BLOCK:** n=1720, „23 % expressiver“, „94 % Emotionserkennung“ — in Drittblogs, **nicht** im Hume-Blog. Stufe **UNBEKANNT**. Nicht zitieren.

**RW-Voice-EQ (Ayllon et al., arXiv:2607.14846, Hume Research).** Das ist die belastbare Hume-Methode, nicht der EVI-3-Launch.

- Vier Domänen, **kein Gesamtscore**: TTS, STS, Speech Understanding, ASR. Dimensionen getrennt, weil sie nicht dasselbe messen.
- TTS/STS: 3 Generierungen/Item, globale Shuffle, **3 unabhängige Rater/Clip**, aufgabenspezifische Rubrik, 5-Punkt Likert außer wo anders definiert. ≥1 Mio Ratings in der Entwicklung; Benchmark 785 679 TTS + 48 053 STS. Rater: native English US/GB/CA.
- STS-Kern: **Audio-only vs Transcript-only Ablation** — nutzt der Agent die Stimme oder nur das Transkript? Hume: Audio-Zugang hilft nicht konsistent; manche Systeme bleiben transkriptgetrieben.
- Human-likeness in diesem Paper: **Synthetic-speech detection**, Skala 1–5, native Metrik = **mean human-likeness gap** (real − synth). Schwelle >3 = real ist nur illustrativ. Hume selbst: viele Judge-Modelle geben **beiden** hohe Human-likeness.
- LLM-as-judge: höchste Übereinstimmung mit Menschen bei **verifizierbaren** Aufgaben (Aussprache); schwach bei Ausdruck. Hume warnt vor Leakage, wenn Modelle gegen LLM-Judge iteriert werden (Voice Controllability Leaderboard, Hume Blog).

**Für uns übertragbar (Methode, nicht Score):** Dimension-Profil statt Gesamtscore; Text/Audio-Ablation; 3 Rater wo subjektiv; Human-likeness-Gap **nicht** als C0.

**Vendor-Folie:** EVI-3 „world’s most realistic“, Sieben-Dimensionen-Sieg, Gemini/Sesame im selben Satz, 300 ms, Parität zu GPT-4o.

### 2.2 MOS-Papers 2025–26

| Quelle | Was sie tun | Was sie für C0 bedeuten |
|---|---|---|
| ITU-T P.800 (1996) | Listening-only ACR, MOS 1–5 Bad–Excellent | Telefon-Gesprächsqualität ist **nicht** P.800. Conversational MOS (P.805) hier nur **PLAUSIBEL** als richtige ITU-Familie — P.805-Text in diesem Lauf nicht vollständig gelesen. |
| ITU-T P.800.1 / P.800.2 | Terminologie und **Reporting**; MOS ist **relativ zur Testdurchführung** | MOS aus Paper A ≠ MOS aus Paper B. |
| ITU-T P.808 (2018/2021) | Crowdsourcing-MOS; Qualifikation, Training, Gold/Trap ~1/10; **≥8 Hörer/Stimulus**, oft 96 Votes/Condition empfohlen | 1-Wochen-Panel in Wien erfüllt P.808 **nicht**. Nicht „MOS light“ nennen. |
| Cooper, Le Maguer, Klabbers, Yamagishi, *Good practices…* (Okt 2025, arXiv:2503.03250v2) | MOS-Naturalness saturiert; Naturalness unterdefiniert; **ein einzelner MOS ist bedeutungslos**; Predicted MOS darf nicht „MOS“ heißen; Wilcoxon/Mann-Whitney, nicht t-Test auf ordinalen Scores; Hörer, Samples, Ratings, Frage, Skala, Statistik müssen berichtet werden | MOS-Gate für Gate A = Methodenfehler. |
| Le Maguer et al., CSL 2023, *Limits of MOS* | ACR misst nicht, was neuere TTS unterscheidet | Bestätigt Sättigung. |
| Chiang, Huang, Lee, Interspeech 2023 | Dieselben Clips, >10 MOS-Läufe, **mindestens drei verschiedene Rangfolgen** je nach Instruktion/Plattform/Filter | Unser „MOS 4.2“ wäre nicht reproduzierbar. |
| Blizzard 2023 (Le Maguer et al., CSL 2025) | Relativer Vergleich trennt Top-Systeme, wo MOS ununterscheidbar ist; Speaker-Similarity hängt von Vertrautheit ab | Pairwise > ACR nahe der Decke. |
| Shirali-Shahreza & Penn, SSW 2025 | Blizzard 2025: Naturalness in **8 Dimensionen** (Accent, Clarity, Fluency, HComp, Mechanical, Pronunciation, Spontaneity, Understandability); ACR 5-Punkt, nicht Pairwise (Kosten/Niederländisch) | HComp ≈ „Mensch vs Computer“ — immer noch nicht C0. Spontaneity näher an Nicht-Vorlesen, aber clip-basiert. |
| Bailly et al., SSW 2025 *Hot topics* | Ein-Satz-ACR oft ununterscheidbar von Human; lokale Paarvergleiche finden Restfehler; one-size-fits-all Evaluation unhaltbar | Use-case-spezifisch messen. |
| AudioMOS 2025 (arXiv:2509.01336); VoiceMOS 2026 (arXiv:2609.13792) | Automatische **Vorhersage** menschlicher MOS; Primary metric UTT-SRCC; 2026 Tracks: Enhancement ACR/CCR, Emotional-TTS Naturalness+Emotion-Similarity, Accent/Speaker-Similarity | Predicted MOS ≠ Meinung. Domain Shift (EN→AT-DE) unbelegt. |

**BLOCK MOS-Gate.** Wenn jemand trotzdem eine Zahl „MOS“ berichtet: Cooper-Checklist + P.800.2, Vergleichssysteme **im selben Test**, ordinaler Test, CI. Sonst BLOCK.

### 2.3 Full-Duplex-Bench

**v1** Lin et al., arXiv:2503.04721 (ASRU 2025). Automatisch, englisch, synthetische User-Streams.

Dimensionen und Metriken:

| Dimension | Metrik | Richtung |
|---|---|---|
| Pause Handling | Takeover Rate (TOR) | ↓ (Pause ≠ Turn-Ende) |
| Backchannel | TOR ↓; Freq (Events/s); JSD gegen Human-Timing | Freq nicht „höher = besser“ |
| Smooth Turn-Taking | Response latency nach User-Ende, nur wenn TO=1 | ↓ |
| User Interruption | TOR ↑ (soll übernehmen); GPT-4o Score 0–5 auf ASR-Text; Latency after interruption ↓ | GPT-4o-Score = Text-Judge |

Takeover: binär. Stille oder Backchannel (Dauer <1 s **und** <2 Wörter) = kein TO. Sonst TO.

**v1.5** Lin et al., arXiv:2507.23159 (ICASSP 2026). Vier Overlap-Szenarien: Interruption, Backchannel, Talking to others, Background speech. Metriken: GPT-4o klassifiziert post-overlap ASR in Respond / Resume / Uncertain / Unknown; Stop-Latenz = t_model_stop − t_user_start; Response-Latenz = t_model_start − t_user_end; Silero-VAD. Erwartung: Interruption → Respond + niedrige Stop/Resp; Backchannel/Others/Background → Resume + hohe Stop-Latenz.

Getestete Systeme u. a. Freeze-Omni, Moshi, Gemini `gemini-2.0-flash-live-001`, Nova Sonic, GPT-4o Realtime `gpt-4o-realtime-preview-2024-12-17`. **Das sind nicht unsere Endpunkte.** Zahlen nicht übertragen.

**Grenze (VERIFIZIERT aus Paper):** synthetische Overlaps, oft gleiche Stimme, englisch; v1.5 Interruption ohne Kanalunterschied; Backchannel-Definition grob; GPT-4o auf Parakeet-ASR = Modalitätsbruch (genau das, was Hume/S2S-Arena als Bias benennen). Metriken sind **deskriptiv, nicht präskriptiv**.

**Für uns übertragbar:** Stop- vs Response-Latenz; mhm ≠ Barge-in; Pause ≠ Ende. **Nicht übertragbar:** deren TOR-Tabelle, deren GPT-4o-Score, deren Englisch-Korpus als Gate.

### 2.4 SpokenWOZ

Si et al., NeurIPS 2023 Datasets. 5 700 H2H-Telefonate, 203k Turns, 249 h, 8 Domains (MultiWOZ + profile), ~55 kUSD, Turn-Annotation >97 %.

**DST:** Joint Goal Accuracy (Anteil Turns, in denen **jeder** Slot korrekt ist). Zusätzlich MAMS Acc nach Slot-Klassen: reasoning, cross-turn, ASR-sensitive, normal.

**Response generation:** INFORM (richtige Entity), SUCCESS (alle Requests), BLEU, Combined = 0.5×(INFORM+SUCCESS)+BLEU.

2025/26 Folgeliteratur (Sedláček et al.; arXiv:2506.08633): JGA + Slot Error Rate; Fuzzy-Match hebt Named-Entity-JGA (z. B. 38.76 → 42.17 auf SWOZ-Test). Das misst **Slot-Robustheit**, nicht Charakter.

**Für C0:** SpokenWOZ ist **das Telefonbuch-Genre** (Agent sucht in DB, User hat Task-Goal). Hoher SUCCESS wäre bei uns oft ein **Fail** (über-hilfreich). Übertragbar nur als Warnung: gesprochene Phänomene (cross-turn, ASR, Backchannel-Acts in der Ontologie) verschwinden in Textmetriken.

**BLOCK:** SpokenWOZ-Leaderboard, JGA, Combined Score als Gate-A- oder Realismus-Beweis.

### 2.5 Human-likeness Evals

Drei verschiedene Fragen, oft unter einem Label:

1. **HComp / Mechanical** (Blizzard 2025, 8 Dimensionen): „klingt wie Mensch vs Computer“ auf Clips. ACR. Nicht C0.
2. **Human-likeness gap** (Hume SU): real vs synth, Detektion. Hume: Frontier-TTS liegt oft über der Wahrnehmungsgrenze; Gap schrumpft. Nicht C0.
3. **Spontaneity / Expressiveness** (Blizzard 8D; SpeechArena 6 Achsen: intelligibility, expressiveness, voice quality, liveliness, noise, hallucinations): näher an Nicht-Vorlesen, aber immer noch TTS-Clip.

S2S-Arena (Jiang et al., ACL 2026 / arXiv:2503.05085): sprach-natives Pairwise, **kein Text-Judge als Gold**; Elo; Seed: 19 Annotatoren; Gemini-2.5-Pro vs Human 82.87 %, κ=0.6553. Strict win/loss, keine Ties. Misst **Instruction following inkl. Prosodie**, nicht Anti-Skript einer Zinshaus-Figur.

**BLOCK:** „Human-likeness 4.6“ oder Turing-Claim ohne Definition, n, CI.

### 2.6 A/B Voice Arena

Mehrere Arenen, nicht eine Methode:

| Arena | Protokoll | Grenze |
|---|---|---|
| Hugging Face TTS Arena (2024 Blog) | Blind A/B gleicher Text, Vote Naturalness, Elo-ähnlich | Community-Rater, Selbstselektion, Clip |
| Voice Arena TTS Leaderboard (voicearena.com/tts-methodology) | Native Listener, 6 Sprachen **ohne Deutsch**, 100 native Sätze/Sprache, 4 Deployment-Kontexte (support, media, content, conversational AI). A/B **plus** Both/Neither. Danach geschlossenes Issue-Inventar. Bradley-Terry Elo, Ties = ½ Win, 200-Bootstrap 95 %-CI, Rank-Range | Explizit: MOS trennt Frontier-TTS nicht mehr (zitiert Blizzard 2023, Chiang 2023, TTSDS2 2025). **Kein AT-DE.** |
| SpeechArena / AI4Bharat (arXiv:2604.21481) | 120k Pairwise, 1900+ native Rater, 10 indische Sprachen, 6 Wahrnehmungsachsen, Bradley-Terry, SHAP: Expressiveness+Intelligibility treiben Präferenz | Andere Sprachen; große n |
| Arabic TTS Arena | BT-MLE, Bootstrap 200, Start Elo 1000 | Sprache ≠ unser Call |

**Für uns übertragbar:** Blind, gleicher Stimulus, A/B **mit** Both/Neither, Issue-Tags, BT erst bei ausreichenden Battles, CI/Rank-Overlap = statistische Ties. **Nicht:** öffentliches Elo gegen ElevenLabs/OpenAI; Community-Votes; englische Sätze.

Voice Arena selbst: Elo-Gap 100 ≈ 64 % Winrate. Bei n=16 Battles ist ein 64 %-Effekt im Rauschen.

---

## 3. 1 Woche: belastbar vs Folie

Annahme: 7 Kalendertage, 2 Annotatoren (österreichisches Deutsch), bestehender OpenAI-Realtime-Freeze als Kontrolle, **kein** zweiter Provider, Golden Set wird **nicht** zum Prompt-Tuning verbraucht.

### 3.1 Belastbar (Diagnose mit reproduzierbarer Zahl)

Diese Maße dürfen in einem internen Bericht stehen. Sie dürfen **kein** Marketing-Satz und **kein** Gate „Produktreif weil MOS/Elo/Parität“ werden.

**M1 Telefonbuch-Turn-Rate (Primärmetrik C0).**

- Unit: Charakter-Turn (nicht User, nicht Systemzeile).
- Dual annotation, unabhängige erste Runde, Konfliktkonferenz. **Gwet AC1 je Code als Binär** (Code an/aus), weil Mehrfachlabel kein einzelnes κ hergibt. AC1 misst **Reliabilität, nicht Wahrheit**: AC1 < 0.6 ⇒ Rate **nicht interpretierbar** (UNBEKANNT). AC1 ≥ 0.6 ist **kein** Produkterfolg.
- Bericht: Rate ± Wilson-95 %-CI **pro Bedingung**, getrennt Text / Stimme. „Beide“ nur als Schnittmenge, nie als dritte Erfolgszahl.
- Freeze vs Kandidat auf **demselben** Golden Set = **gepaarte** Items. Differenztest: McNemar auf Call- oder Turn-Paaren (gleiche Elicitor-ID), nicht zwei unabhängige Wilsons. Cluster: Turns in Calls — bei n_calls=24 Turn-p-Werte ohne Cluster sind geschönt.
- Woche-1-Kapazität: zuerst M1 am **bereits aufgezeichneten** Freeze (falls <24 Golden: n und Lücken ausweisen). 48 frische Live-Calls plus A/B in 7 Tagen ist **nicht** zugesichert.

**M2 Golden Set 24, Hold-out.**

- 5 Elicitoren × 4–5 Varianten = 24 Calls. Nicht in Prompts, nicht in Few-Shots, nicht in Evaluator-Beispielen.
- Pro Call: Greeting + ≥2 User-Turns + Ende (Auflegen oder User-Hangup), analog Gate-A S01.
- Stratifiziert: 3 kanonische Szenarien (STARTAUFTRAG), mind. 1 schlechter Pitch (S02), mind. 1 Barge-in, mind. 1 Denkpause, mind. 1 Rechtsfrage.

**M3 A/B nur gegen unseren Freeze.**

- Stimulus: 8–12 Paare (gleicher User-Pfad, zwei Character-Takes), blind, Reihenfolge randomisiert.
- Frage (eine, wörtlich, nicht „naturalness“): *„Welche Gegenseite klingt eher wie ein Mensch in diesem Anruf — nicht wie jemand, der ein Regelbuch oder FAQ vorliest?“*
- Zweite Frage, getrennt: *„Welche Gegenseite hilft dem Anrufer weniger wie ein Trainer oder Assistent?“*
- Antworten: A / B / beide / keine. Issue-Tags danach (geschlossen): TB-LAW, TB-FAQ, TB-COACH, TB-META, TB-LIST, TB-PROSODY, OTHER.
- **Analyseeinheit = Hörer** (oder Hörer×Paar mit Mixed Model). **Verboten:** 18 Hörer × 8 Paare = 144 Votes als n=144 (Pseudoreplikation).
- n Hörer 12–18: Winrate **pro Hörer** mitteln, dann CI über Hörer; **kein Elo, kein Gate.** Ein einzelner Hörer mit 12/16 Wins ≈ 75 % hat Wilson-CI grob 51–90 % und enthält oft 50 %.
- Power (PLAUSIBEL, Binomial 2-seitig α=0.05, 80 %, **n = unabhängige Hörer**): 75 % vs 50 % braucht ≈29 Hörer; 80 % vs 50 % ≈22. Deshalb v1: n≈12–18 Hörer = kein Gate. **Bestätigt.**

**M4 Timing deskriptiv (Full-Duplex-Methode, nicht deren Bench).**

- Barge-in: Stop-Latenz Hörtest + Log, n≥5 Events, Median + Range, kein Mittelwert ohne Schiefe.
- Pause: ob das Modell während einer 800–1500 ms Denkpause übernimmt (TOR analog, unsere Definition, AT-DE).
- mhm/ja kurz: Resume vs Respond (menschlich kodiert, **kein** GPT-4o-Judge in Woche 1).
- Kein Vergleich mit Full-Duplex-Bench-Tabellen.

**M5 Text-vs-Audio-Ablation (Hume-STS-Methode, 1 Szene).**

- Dieselbe User-Lexik als Text an den Role Player vs Live-Stimme mit abweichendem Affekt (z. B. zögerndes „ja“).
- Frage: ändert sich die Figur? Wenn nein: transkriptgetrieben (PLAUSIBEL Prompt/Dossier, nicht Transport).
- n klein: Fallserie, keine Signifikanz.

**M6 Gate-A-Binary bleibt.** S01, S02 Hangup, kein Fake-Score, kein Doppeltranscript. Das ist Abnahme, nicht C0-Qualität.

### 3.2 Nicht belastbar in 1 Woche (Vendor-Folie / falsches Konstrukt)

| Verbotener Satz | Grund |
|---|---|
| Parität / besser als ChatGPT Voice, Astra, Gemini Live, Hume EVI | Anderer Vertrag, anderes UI, Hume selbst mischt Apps; A06: ChatGPT Voice = GPT-Live-1, Astra denkt ohne API-Audio |
| MOS ≥ x, „natürlich wie Mensch“ | Sättigung, Relativität, n und Protokoll fehlen; Cooper 2025 |
| Predicted MOS / DNSMOS / VoiceMOS-Score | Predicted ≠ Opinion; Domain Shift AT-DE UNBEKANNT |
| Voice Arena / TTS Arena Elo | Kein Deutsch; Clip; Community; n für BT zu klein |
| SpokenWOZ JGA / Combined | Falsches Genre; SUCCESS = Hilfe |
| Human-likeness / Turing | Spoofing, nicht Anti-Skript |
| Full-Duplex-Bench TOR/GPT-Score als unser Score | EN, synthetisch, Text-Judge |
| Hume 7 Dimensionen, 1720 Tester, 300 ms | Launch-Blog ohne n/CI; 1720 nicht in Primärquelle; Latenz NY≠Wien |
| n=12–18 „signifikant natürlicher“ | Unterpowered |
| LLM-as-Judge auf Transkript für C0 | Verwirft Prosodie; Hume: unzuverlässig außer verifizierbaren Tasks |

### 3.3 Später (nicht Woche 1, nicht Gate A)

- P.808-Crowd MOS oder Blizzard-8D auf Clips (teuer, falsche Unit).
- Bradley-Terry Elo sobald ≥200 Battles **und** AT-DE native Rater.
- Kalibrierung Evaluator-Confidence vs Doppelannotation.
- Getrennte Strata Dialekt / Alter / Geschlecht / Geräusch — berichten, nicht kausal interpretieren (Rollenregel A09).
- Coach-Qualität / Lerntransfer: A08/A09 nach Gate A, eigenes Golden Set.

---

## 4. Annotation Manual v2 (C0)

### 4.1 Elicitoren E1–E5 (Golden-Set-Faktoren, nicht Codes)

| ID | User tut | Soll-Verhalten der Figur | Typisches Telefonbuch-Fail |
|---|---|---|---|
| E1 | Rechts-/Prozessfrage („Darf ich einfach kündigen?“) | Motiv, Unsicherheit, Alltagswort; kein § | TB-LAW |
| E2 | 1–2 s Denkpause nach eigenem Satz | Wartet oder kurzes mhm; kein Turn-Klau | Pause-Takeover (M4), oft TB-FAQ Füllsel |
| E3 | Schlechter Pitch / Druck | Bleibt Person; ggf. Auflegen; kein Coaching | TB-COACH |
| E4 | Barge-in mit neuem Inhalt | Stoppt hörbar; antwortet aufs Neue | Weitersprechen oder FAQ zum alten Thema |
| E5 | „Was muss ich wissen / wie läuft das?“ | Eine menschliche Antwort aus der Lage, keine Liste | TB-LIST / TB-FAQ |

### 4.2 Codes (mutually not required; Mehrfach möglich)

Einheit: Charakter-Turn. Erst Text, dann Stimme (getrennte Passes oder zwei Annotatoren-Rollen).

| Code | Text-Pass (Transkript, stumm) | Stimme-Pass (Audio) |
|---|---|---|
| TB-LAW | Gesetz, Paragraph, „als Makler darf ich“, Marktvortrag | Vorleseton, gleichmäßige Kantilene bei Regelinhalt |
| TB-FAQ | Aufzählung von Bedingungen, Daten, „erstens zweitens“ | Inventar-Prosodie, kein lokaler Affekt |
| TB-COACH | Trainerfrage, Feedback, „was ist Ihr Ziel“ | Didaktischer Ton |
| TB-META | KI, Hilfe-Angebot, Systemerklärung | Assistenten-Lächeln in der Stimme |
| TB-LIST | Dossier-Fakten unaufgefordert als Liste | Abspulen |
| OK-SCENE | Ich-Szene, Motiv, lokaler Bezug | Unsicherheit/Ärger/Eile passend zur Lage |
| UNCLEAR | ASR unbrauchbar | zu kurz / Überlagerung |

**Telefonbuch-Turn** = mindestens ein TB-* auf **dieser** Modalität. Text-TB-Rate und Stimme-TB-Rate getrennt. Pause-Takeover (E2/M4) ist **kein** TB-Code.

**Stimme-Pass-Kontamination (VERIFIZIERT als Risiko, nicht wegdefiniert):** deutschsprachige Hörer verstehen den Inhalt mit. Ein „reiner Prosodie-Pass“ ist daher nur PLAUSIBEL als grobe Trennung, nicht als orthogonale Dimension. Reihenfolge: erst Stimme, dann Text, oder zwei Personen; trotzdem Leakage berichten, nicht als gelöst behaupten.

**Codebook-Leck:** Diese Codes sind Annotator-Instrument. Sie dürfen **nicht** in den Role-Player-Prompt als Nie-Liste. Sonst misst die nächste Runde das Codebook, nicht die Figur.

Nicht ableiten: Dialekt oder Geschlecht „erklärt“ TB.

### 4.3 Doppelannotation

- 100 % der 24 Golden Calls, beide Annotatoren, ohne Abstimmung in Runde 1.
- AC1 + Konfliktklassen: LAW vs FAQ, COACH vs META, Text-OK/Stimme-TB.
- Golden Set nach Messung versiegelt. Treffer dürfen die **nächste** Prompt-Änderung nicht an diesen 24 Sätzen tunen. Neue Items für Iteration.

### 4.4 Reporting-Pflicht (Cooper/Chiang/P.800.2, auf C0 übertragen)

Jeder interne Bericht enthält: n Calls, n Turns, n Hörer, Frage wörtlich, Skala, Freeze-ID (Modell+Prompt+Datum), Ausschlüsse, CI, AC1, welche Strata leer sind. Kein Vergleich mit Zahlen aus fremden Papers.

---

## 5. Claim Register (A09 kann BLOCKEN)

| ID | Claim | Stufe | Urteil |
|---|---|---|---|
| CL-01 | Parität oder Überlegenheit vs ChatGPT Voice / Astra / Gemini Live | UNBEKANNT + Kategoriefehler | **BLOCK** |
| CL-02 | MOS als Gate A / „natürlich wie Mensch“ | Methodenfehler (Cooper 2025, Chiang 2023, P.800.2) | **BLOCK** |
| CL-03 | Hume EVI 3 „most realistic“, 7D-Sieg, n=1720, %-Deltas aus Blogs | Primärquelle ohne n/CI; 1720 nicht im Blog | **BLOCK** als Ziel oder Beweis |
| CL-04 | Voice/TTS-Arena-Elo als Produktqualität | Falsche Sprache/Unit; n | **BLOCK** |
| CL-05 | SpokenWOZ-SOTA = besseres Coaching | Falsches Konstrukt | **BLOCK** |
| CL-06 | Predicted MOS = Hörqualität | Cooper §3 | **BLOCK** |
| CL-07 | n≈12–18 Präferenz = Gate | Unterpowered | **BLOCK** |
| CL-08 | Full-Duplex-Bench-Zahlen = unser Barge-in | Anderer Stack/Sprache | **BLOCK** Transfer |
| CL-09 | Human-likeness-Score = nicht Telefonbuch | Spoofing ≠ Anti-Skript | **BLOCK** |
| CL-10 | LLM-Judge auf Transkript = C0 | Modalitätsbruch | **BLOCK** in Woche 1 |
| CL-11 | TB-Rate Freeze vs Kandidat auf Golden 24, dual, gepaarter Test, CI; AC1 nur Reliabilität | Nach Lauf: VERIFIZIERT oder nicht | **Erlaubt** als Diagnose |
| CL-12 | A/B vs Freeze, Win/Tie/Lose, Wilson-CI, kein Elo | Nach Lauf: Diagnose | **Erlaubt**, kein Gate |
| CL-13 | Stop-Latenz / Pause-TOR deskriptiv am eigenen System | Nach Lauf | **Erlaubt** deskriptiv |

Produktclaim braucht Definition, Stichprobe, Fehlertoleranz. Ohne die drei: BLOCK.

---

## 6. Quellen (Primär, abgerufen 2026-09-18)

1. Hume, „Introducing EVI 3…“, 2025-05-29, https://www.hume.ai/blog/introducing-evi-3
2. Hume, „Introducing Real World VoiceEQ…“, https://www.hume.ai/blog/introducing-real-world-voiceeq-measuring-the-human-quality-of-voice-ai
3. Hume, Voice Controllability Leaderboard, https://www.hume.ai/blog/introducing-the-hume-voice-controllability-leaderboard
4. Ayllon et al., *RW-Voice-EQ Bench*, arXiv:2607.14846
5. Hume EVI FAQ (Expression labels ≠ felt emotion; Cowen & Keltner 2017), https://dev.hume.ai/docs/speech-to-speech-evi/faq.mdx
6. ITU-T P.800 (1996); P.800.2 (2016 reporting); P.808 (2018/2021 crowdsourcing)
7. Cooper et al., *Good practices for evaluation of synthesized speech*, arXiv:2503.03250v2, Oct 2025
8. Le Maguer et al., *The limits of the Mean Opinion Score…*, Computer Speech & Language, 2023/2024
9. Chiang, Huang, Lee, Interspeech 2023, doi:10.21437/Interspeech.2023-416
10. Blizzard 2023 summary, CSL 2025, doi:10.1016/j.csl.2024.101747
11. Shirali-Shahreza & Penn, *Multi-dimensional Evaluation of the 2025 Blizzard Challenge*, SSW 2025, doi:10.21437/SSW.2025-32
12. Bailly et al., *Hot topics in speech synthesis evaluation*, SSW 2025
13. AudioMOS Challenge 2025, arXiv:2509.01336; VoiceMOS 2026, arXiv:2609.13792
14. Lin et al., Full-Duplex-Bench, arXiv:2503.04721; site https://full-duplex-bench.github.io/
15. Lin et al., Full-Duplex-Bench v1.5, arXiv:2507.23159
16. Si et al., SpokenWOZ, NeurIPS 2023, arXiv:2305.13040; https://spokenwoz.github.io/
17. Sedláček et al., Interspeech 2025 DST; related arXiv:2506.08633 (JGA/SER, fuzzy match)
18. Jiang et al., S2S-Arena, arXiv:2503.05085 / ACL 2026
19. Voice Arena methodology, https://voicearena.com/tts-methodology
20. HF TTS Arena, https://huggingface.co/blog/arena-tts
21. AI4Bharat SpeechArena, arXiv:2604.21481
22. Microsoft P.808 Toolkit, https://github.com/microsoft/P.808

Drittblogs zu Hume (aibase, productcool, callsphere) sind **keine** Primärquellen.

---

## 7. Kleinster nächster Hebel (HYPOTHESE, kein Bau in diesem Status)

Nach A02+BO, eine Primärrolle: Annotation der 24 Golden Calls am Freeze (A09 Messbetrieb, A07 liefert keine Prompt-Änderung aus dem Golden Set). Ohne diese Baseline bleibt C0 UNBEKANNT — unabhängig von GO-1-Text.

Nicht: MOS-Dienst kaufen, Arena beitreten, Gemini vergleichen, SpokenWOZ feintunen.

---

## K09 Gegenprüfung (getrennt, nach A-Entwurf)

```text
GEGENPRÜFUNG
Prüfumfang: Messprotokoll v2 vs A09-Regeln (Konstrukt, Leakage, kleine n, Cherry-Picking, Übereinstimmung≠Wahrheit, Blindheit). Kein Produktlauf. Quellen der BLOCK-Liste stichprobenartig gegen Primärtexte.
Durchgeführte Angriffe: McNemar vs zwei Wilsons; Votes-als-n; AC1-als-Gate; Stimme-Pass ohne Wortverstehen; Codebook→Role Player; Hume n=1720 in Primärquelle; P.805 ungelesen; 48-Call-Kapazität.
```

BEFUNDE

- K09-1
  - Fundstelle: M1 „CI enthält 0 und AC1 ≥ 0.6“
  - Schweregrad: MAJOR
  - Verletztes Kriterium: Übereinstimmung ≠ Wahrheit; gepaarte Items
  - Nachweis: Golden Set ist innerhalb-Item Freeze/Kandidat. Zwei unabhängige Wilsons ignorieren Paarung. AC1 kalibriert Annotatoren, nicht C0.
  - Korrektur: McNemar/Cluster; AC1 nur Reliabilitäts-Gate. **Übernommen.**

- K09-2
  - Fundstelle: M3 n≈12–18, Power „Paarurteile“
  - Schweregrad: MAJOR
  - Verletztes Kriterium: Pseudoreplikation
  - Nachweis: 18×8 Votes sind nicht 144 unabhängige Bernoulli. Unit = Hörer.
  - Korrektur: n = Hörer; Mixed Model oder Hörer-Mittel. **Übernommen.**

- K09-3
  - Fundstelle: Stimme-Pass „Transkript verdecken“
  - Schweregrad: MAJOR
  - Verletztes Kriterium: unbelegte Orthogonalität Text/Stimme
  - Nachweis: AT-DE Hörer verstehen Lexik im Audio. Hume trennt AO/TO experimentell am **Input des Modells**, nicht am Ohr des Raters.
  - Korrektur: Kontamination ausweisen; Hume-Ablation = M5 (Modell-Input), nicht M1-Stimme-Pass. **Übernommen.**

- K09-4
  - Fundstelle: Codebook im Teamordner
  - Schweregrad: MAJOR (Leakage)
  - Verletztes Kriterium: Golden Sets nicht zur Promptoptimierung; Role Player sieht keine Rubrik
  - Nachweis: TB-LAW-Liste ist eine Nie-Liste, sobald A07 sie promptet.
  - Korrektur: Annotator-only. **Übernommen.**

- K09-5
  - Fundstelle: P.805 als Conversational-MOS
  - Schweregrad: MINOR
  - Verletztes Kriterium: Evidenzstufe
  - Nachweis: P.805 in diesem Lauf nicht vollständig gelesen.
  - Korrektur: PLAUSIBEL. **Übernommen.**

- K09-6
  - Fundstelle: 24 Golden × Freeze+Kandidat in 7 Tagen
  - Schweregrad: MINOR
  - Verletztes Kriterium: kleine/leere Stichprobe als Plan
  - Nachweis: 48 Live-Calls + Dual-Annotation + 12–18 Hörer überbucht Woche 1.
  - Korrektur: zuerst Freeze-Aufnahmen annotieren. **Übernommen.**

- K09-7
  - Fundstelle: Hume 3 Rater vs unser Dual
  - Schweregrad: NOTE
  - Verletztes Kriterium: Protokollabweichung ausweisen
  - Nachweis: RW-Voice-EQ: 3 Rater/Clip. Wir: 2 + Konflikt. Abweichung OK wenn berichtet.
  - Korrektur: in Reporting-Pflicht. Kein Textzwang.

Cherry-Picking: EVI-3-Launch BLOCK, RW-Voice-EQ-Methode ADOPT — dieselbe Firma, verschiedene Evidenzgüte. Kein Befund.

Hume n=1720: in EVI-3-Primärblog nicht enthalten. BLOCK bleibt.

```text
URTEIL nach Nacharbeit: FREIGEGEBEN als DEEPSEARCH-Protokoll
Produktqualität: UNBEKANNT
Kein Gate, kein Paritätsclaim, kein MOS-Claim.
```
---

## Phase-7 Übergabe

```text
AUFTRAG_ID: CHG-20260918-006-A09
ERGEBNIS: Messprotokoll v2. C0 = nicht Telefonbuch, zwei Achsen Person | No-Help. 1-Woche belastbar: M1 TB-Rate (gepaart, dual, AC1=Reliabilität), M2 Golden 24 Hold-out, M3 A/B vs Freeze (Hörer-n, kein Elo), M4 Timing deskriptiv, M5 Audio-vs-Text am Modellinput. BLOCK: ChatGPT/Astra/Gemini-Parität, MOS-Gate, Predicted MOS, Voice-Arena-Elo, SpokenWOZ-JGA, Hume-Launch-Folie, Human-likeness-as-C0, LLM-Transcript-Judge, n=12–18 als Gate.
GEÄNDERTE_DATEIEN_UND_VERTRÄGE: .cursor/decisions/CHG-20260918-006-a09-messprotokoll-v2.md — keine Produktverträge, kein Code.
NACHWEISE_UND_TESTS: Primärquellen §6; kein eigener Hörtest in DEEPSEARCH.
QUALITÄTSWIRKUNG: UNBEKANNT am Produkt. Messpolitik verhindert unbelegte Sätze.
KOSTENWIRKUNG: Woche-1 ohne Crowd-MOS/Arena; 2 Annotatoren. Kein Providerwechsel.
RISIKEN_UND_OFFENE_HYPOTHESEN: Stimme-Pass kontaminiert; Woche-1 vielleicht nur Freeze-Baseline; P.805 ungelesen; Golden-Set-Leck in Prompts.
GEGENPRÜFER_URTEIL: FREIGEGEBEN (Protokoll); Produkt UNBEKANNT
NÄCHSTE_ROLLE: A00 bündelt; A02+BO nach Paket. Bau: A09 Messbetrieb, nicht A07 am Golden Set.
KONTEXT_FÜR_NÄCHSTEN_CHAT: Freeze-ID vor Messung versiegeln. Codes nicht in Role Player. McNemar/Hörer-Unit. ChatGPT/Astra/Gemini bleiben non-goals.
```

