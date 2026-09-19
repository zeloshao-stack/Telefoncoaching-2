# Rebuild-Brief: KI-Telefoncoaching Zinshaus

**Stand:** 2026-09-19  
**Adressat:** ein anderes Modell, das das Programm **neu aufbauen** soll  
**Auftraggeber:** Reinhard Manzl, Wiener Investmentmakler  
**Sprache Produkt:** Sie / de-AT  
**Gate:** A / G2 — glaubwürdiges Gespräch im Browser, Barge-in, Auflegen, Charakterkonsistenz. Noch kein Billing, Mandant, Studio.

Dieses Dokument ist die **komprimierte Produktforschung** aus den Steal-Runden Gong / Hyperbound / Careertrainer plus den Produktbeschlüssen danach. Es ist **kein** Laufzeit-Prompt. Es ist die Bau-Spezifikation.

Quellen (nicht 1:1 in den Prompt laden):

| Akte | Pfad |
|---|---|
| Steal Gong | `.cursor/decisions/CHG-20260919-010-gong.md` |
| Steal Hyperbound | `.cursor/decisions/CHG-20260919-010-hyperbound.md` |
| Steal Careertrainer | `.cursor/decisions/CHG-20260919-010-careertrainer.md` |
| Produkt-Reihenfolge | `.cursor/decisions/CHG-20260919-011-a02.md` |
| Architektur-Steals | `.cursor/decisions/CHG-20260919-011-a01.md` |
| Transport | `.cursor/decisions/CHG-20260919-011-a06.md`, `014-a06.md` |
| Trainingsdesign / Karten | `.cursor/decisions/CHG-20260919-011-a08.md`, `014-a08.md` |
| Team-Kernel | `.cursor/team/TEAM_KERNEL.md` |
| Startauftrag Gate A | `.cursor/team/STARTAUFTRAG.md` |
| Projektbaum | `docs/projektbaum.md` |
| Szenenpack | `lib/scene-intel.ts`, `data/Telefoncoaching-Testfaelle.json` |

Login-Apps der Fremdprodukte bleiben **UNBEKANNT**. Öffentliche Sites, Help, Screenshots des BO (Careertrainer-Dashboard, 2026-09-19) sind die Evidenz. Fremde ROI-/Win-Rate-Zahlen sind **deren Marketing**, für uns kein Gate.

---

## 1. Was das Produkt ist

Ein Makler übt **ein Telefonat** gegen eine Zinshaus-Figur.

```
Karte wählen → sprechen → Auflegen → eine Note + ein Moment → denselben Satz nochmal → optional Coach an dieser Stelle
```

Es ist **kein** CRM, kein Forecast, kein Revenue-OS, keine Video-Akademie, kein Live-Prompter (kein Balto). Audio zuerst. Keine Avatare im Kern.

**Zielnutzer:** erfahrene Makler (nicht Novizen). Expertise-Reversal: Hilfen *während* des Gesprächs schaden.

**Erfolg Gate A (beobachtbar):**

- kompletter Call ohne manuelle Reparatur
- Figur hilft nicht systematisch
- Barge-in und Call-Ende technisch korrekt
- kritische Charakterfakten konsistent
- Stimme/Reaktion überwiegend plausibel (Hörtest, nicht Claim)
- Kosten/Latenzen gemessen
- offene Risiken sichtbar

**Nicht Erfolg:** hohe Scores, Gong-Win-Rate, „2× besser“, Kurve 4.2→7.9.

---

## 2. Harte Invarianten (nicht verhandelbar beim Rebuild)

1. **Vier Maschinen getrennt**
   - Role Generator erzeugt Person und Situation, **kein** Coachingziel für den Player.
   - Role Player kennt Persona, Zustand, freigegebene Fakten — **keine Rubrik, keine Trainingsziele, kein Talk-Track**.
   - State Engine besitzt den Zustand, validiert Deltas.
   - Evaluator sieht Gespräch + Rubrik **nach** Auflegen, keine ungeöffneten Geheimnisse.
2. **Voice State ≠ Text.** Keine Regie `[pause]` / `[sighs]` im Mundtext. Prosodie separat.
3. **Öffentlich vs. verdeckt.** Trainee sieht `public_brief` + Karten-Ziele. Figur hat `private_state`. Coach nach Hangup darf Spielbuch. Player nie.
4. **Scoring 0–4 + N/A** (`not_assessable`). Ein Lernfokus pro Drill. Feedback: **eine Stärke + ein Hebel + Zitat**. Kein 70/30 als unsere Note. Kein Prozent auf dem Schirm.
5. **Repeat = derselbe Moment + State-Engine-Replay**, nicht ein neues Szenario.
6. **Kein Live-HUD** in `/sitzung` (keine Scorecard, kein Talk-Ratio, kein Side-Panel während der Leitung).
7. **Kein Forecast**, keine Win-Probability, keine €-Pipeline, solange keine echten Deals + Billing.
8. **Kein Billing / Mandant / Studio** in Gate A.
9. **Qualitätssprache:** VERIFIZIERT / PLAUSIBEL / HYPOTHESE / UNBEKANNT. Keine Hypothese als Tatsache.
10. **DSGVO:** Stimme = personenbezogene Daten. Practice-Audio nicht still persistieren. Drittland-Provider (OpenAI Realtime) nicht als „Server DE“ vermarkten. Careertrainer-Trust-Claim nicht kopieren.

---

## 3. Forschungsbefund: drei Produkte

### 3.1 Gong (gong.io) — Revenue AI OS

**Was es ist:** Call Recording + Coaching + Forecast + Deal Board. Erstklassen-Produkt ist **Forecast**, nicht Roleplay.

**Steal (Struktur, nicht Marke):**

| Steal | Bedeutung für uns |
|---|---|
| Enable: Role-play → Stop → Scorecard + „Let's talk“ + Go again | Coach **nach** Practice, Repeat derselben Stelle |
| Call Page = Recording **nach** der Aufnahme: Player, Highlights, Transcript | Debrief-Instrument, nicht Live-Chrome |
| Talk-Tracks / Scorecards als Enablement | Im **Coach** und Evaluator, nie in der Figur |
| Bite-size: already-knows / focus / opener | already-knows = Figur, focus = Trainee/Evaluator, opener = Figur |
| Share-Moment als Zeitfenster | später Ops; öffentlicher Share nicht Gate A |
| Deal-Board-**Metapher** | Übungszustände, nicht Opportunities |

**Avoid:**

- Forecast, Deal-Risk, Ramp, „call your number“, 95 % Accuracy
- Listen-in / ON AIR (echte Calls, Surveillance-Nachbar)
- Scorecard-Side-Panel **während** Practice
- Manager-Inbox, Certification, CRM-Autofill
- Persona-Fotos als Produktkern
- MEDDPICC als unsere Wahrheit
- Seat-Preis als unser TCO (Gong hat oft keinen Listenpreis)

### 3.2 Hyperbound (hyperbound.ai)

**Was es ist:** Roleplay → Score → Coach → Repeat. Practice vs Perform getrennt.

**Steal:**

- Featured Bot + ein Start
- Feedback **after every call**: Score, Kriterien, Zitate, Talk-Tracks
- Post-Call: klickbare Kriterien, Objections-Tab mit Timestamp (bei uns nur wenn Fokus Einwand)
- Restart ab einer Bot-Zeile (bei uns: Repeat-ab-Turn existiert; Gym-Restart nicht bauen)
- Turn Timeout / Geduld vor Follow-up (3–5 / 6 / 8 s öffentlich; unsere Zahl = Experiment)
- Hard Stop, dann Score — nicht Score während des Sprechens
- Lärm als Störfall, nicht als Interrupt

**Avoid:**

- Live-Coaching-HUD (eigener Blog: Split-Attention, Expertise Reversal; HUD sitzt in **Perform**)
- Video-Titel „Realtime Coaching“ ernst nehmen — FAQ sagt after the role play
- MEDDPICC-Mock, Filler/Talk-Ratio als Drill-Note
- Novizen-Prompter für erfahrene Makler

### 3.3 Careertrainer.ai

**Was es ist:** DACH Live-Audio-Übung, Dual-AI (eine Figur spricht, zweite KI bewertet danach). BO hat Dashboard-PDFs/Screenshots 2026-09-19 geliefert.

**Katalogkarte (Steal-Anatomie):**

1. Szenentitel (Lage), nicht Personenname als H1
2. Badge Kanal (bei uns immer **Telefonat**, nicht „Persönlich/Küchentisch“)
3. **TRAININGSZIELE** — drei Punkte: Fetttitel + Satz warum
4. Person unten: Name + Rollen-Chip; Foto optional — **wir: Initialen, kein Stockfoto**
5. CTA vollbreit „Gespräch starten“
6. Zweiter Kartenzustand: nur Challenge-Zeile (Lage/Prüfung)

**Training-Seite hinter der Karte (Careertrainer-Tabs):**

- Übersicht: Ziel des Trainings + Szenenabsatz
- Verkaufs-Auftrag: „Gegenüber kennt das NICHT“, Ziel, Qualify-Liste, Vorbereitung
- Evaluationsziele: 3–4 beobachtbare Beats

**BO-Urteil 2026-09-19:** Diese **Informationen** sind wertvoll, weil die **zweite KI** (Coach/Evaluator) darauf zugreift. Die Careertrainer-**Oberfläche** (Tabs, 7er-Listen, Hover-Essays, Pro-Paywall) ist **unübersichtlich**. Also:

- Nutzer: scannbare Karte mit **sichtbaren drei Zielen** (nicht hinter „Was zählt“ verstecken — BO-Korrektur nach Over-Correction)
- Coach nach Hangup: volles Pack (goal, beats+why, qualify, prep, evalBeats)
- Role Player: **nichts** davon
- Keine drei Tabs, keine 7er-Novelle, kein Schloss/Upgrade

**Steal sonst:** Dual-AI; Zitatpflicht; nur Trainee-Wortlaut für die Note; eine Personenkarte + Start.

**Avoid:** 70/30 als unsere Formel; Score-Galerie 4.2→7.9; Branchen-Radios; „Server DE“-Trust; Du-Anrede (wir: Sie); Copy-Bugs („Du solltest der VM soll“).

---

## 4. Produktbeschlüsse (nach der Recherche)

| Frage | Beschluss | Warum |
|---|---|---|
| Live-Noten in der Leitung | **Nein** | Split-Attention, Telefon-Metapher, Expertise Reversal |
| Noten nach Auflegen | **Ja** | Ein Fokus /4, 1+1+Zitat, Moment klickbar |
| Deal-Board | **Übungs-Pipeline** ja, Revenue nein | Offen / Ausgewertet / Denselben Moment / Ruhend |
| Forecast | **Nein** | Keine echten Deals |
| Avatare / Fotos im Kern | **Nein** | Audio-first; Silhouette/Initialen |
| Rubrik in der Figur | **Nein** | Isolation |
| Szenenkarten | **Basis des Gesprächs** | Ohne ordentlichen Auftrag ist der Anruf leer. BO 09:26 |
| Careertrainer-Konsole | **Nicht klonen** | Wissen ja, Tabs/Paywall nein |

**Schleife (Hyperbound-Form, unser Inhalt):**

```
Karte (Auftrag) → Leitung (Telefon) → Debrief (Note+Moment) → Repeat derselben Stelle → Coach auf dem Anker
```

---

## 5. Architektur zum Neuaufbau

### 5.1 Module

| Modul | Aufgabe | Sieht nicht |
|---|---|---|
| Katalog `/` | Karten, Start | Rubrik, private_state |
| Briefing `/szenario/[id]` | Ziel, drei Ziele, public_brief, Hinweis Isolation, Start | private_state |
| Live `/sitzung/[id]` | WebRTC, VAD, Barge-in, Auflegen | Scores, Moments, Trainingsziele |
| Debrief `/sitzung/[id]/auswertung` | Note + Moment, Sprung zur Turn-Zeile, Repeat | — |
| Verlauf `/verlauf` | Übungszustände | Forecast |
| Coach `/coach` | Playbooks; Deep-Link `?session=&turn=` | Isolation nicht lehren; keine volle Scorecard im ersten Satz |
| Autor `/autor` | öffentlich vs verdeckt schreiben | — |

### 5.2 Live-Transport (Gate A)

- Default-Modell: `gpt-realtime-2.1` (Live). Nicht GPT-Live-1, nicht Astra-API (gibt es nicht).
- `interrupt_response: false` auf server_vad.
- **Kein** `conversation.item.truncate`.
- **Stufe A:** kurzes Hold (mhm), kein cancel/clear.
- **Stufe B:** echtes Wort → freeze clock → cut → cancel/clear → heard ack. Heard = frozen `playback_cursor_ms`, nicht `speech_stopped.audio_end_ms`.
- **800 ms ohne Wort ist nicht Stufe B.** Cap ohne Inhalt = Hold lösen, gleiche generation_id (False-Barge war ein Call-Killer).
- Auflegen: Schlusssatz **hören**, dann Close. `output_audio_buffer.stopped` darf Close in Stufe A nicht **vor** dem Goodbye feuern.
- Repeat: **neue Uhr**, keine geerbte Cut-Sperre / Mute vom vorigen `audioEl`.
- Mic-Stop an jedem Exit (Auflegen, Fehler, Navigation, pagehide, Tipp-Modus).
- Statuscopy Live: „Leitung offen.“ / „{Name} spricht.“ / Stall: „Die Leitung ist noch da.“ Nicht „überlegt…“ am Hörer. Figur-Auflegen vs Nutzer-Auflegen vs Drop getrennt.
- Tipp-Modus (`typedOnly`) behält Chatwand.

**Bekannte Rest-Risiken (UNBEKANNT am Ohr):** `idle_timeout` ~9 s; Café-Rauschen kann Stufe A wiederholt betreten; Provider-Pause bei Resume.

### 5.3 Character / Stimme

- GO-1: unbeschriftete Ich-Szene, erste Person, keine Bühnenanweisung.
- Anti-helpfulness: eine Frage macht die Figur nicht zur Auskunft; Hidden Facts unter Druck zu; Auflegen = Charakterwahl.
- Clerk-Ton kappen.
- Voice: Kontur held / stance / released / reonset; Face-Threat bleibt held, nicht Wortsuche; Dialekt-Boden nicht durch Assistenten-Wärme absenken; kein Hume-Mitfühlen.
- Text ohne `[pause]`/`[sighs]`.

### 5.4 Evaluator / Coach

- Evaluator nach vollständigem Akt, nicht live, nicht auf Abbruch, nicht `gpt-realtime-2.1`.
- Schema unverändert: Dimensionen 0–4 + N/A. `evalBeats` der Karte sind **Hinweise für den Coach**, keine zweite Checkliste im Evaluator (nicht ohne eigenes Quality-CHG).
- Coach-erster Satz nach Debrief: Stärke + Hebel + Zitat + nextStep + Formulierung. Nicht Rubrik paraphrasieren, nicht Isolation als Lernziel.
- Marker `TRAININGSZIELE` nur im Coach-`publicContext` nach Hangup.

### 5.5 Daten

Session: turns `{id, speaker, text}` — **kein** erfundenes Timestamp auf der Timeline. Sprung im Debrief über Turn-DOM-id (`turn-{id}`).

POST `/api/sessions`: `{ scenarioId, focusId }` — **keine** Goals im Body (sonst Leck zum Player).

Kosten-Floor (Planung, nicht gemessen): Klasse A Inferenz `gpt-realtime-2.1`, grob $0.25–0.50 / 5-Min-Drill. Seat÷Drill verboten. Mini nicht Floor der Figur.

---

## 6. Szenenkarten-Kanon (Basis jedes Anrufs)

Jede Frozen-Karte **muss** tragen:

| Feld | Wo sichtbar | Wo unsichtbar |
|---|---|---|
| `title` Lage-Titel | Katalog, Briefing | — |
| `challenge` eine Prüfung | Katalog (kann mit Zielen koexistieren) | — |
| `goal` ein Satz, ein Fokus | Briefing „Ziel des Trainings“ | nicht Player |
| 3× `beat.title` + `beat.why` | Katalog + Briefing | nicht Player |
| `public_brief` / `prep` | Briefing kurz | Player nur public_brief des Packs |
| `qualify` | Coach nach Hangup | nicht Katalog-Novelle |
| `evalBeats` | Coach | nicht Player, nicht zweite Rubrik |
| `opening` | gesprochen | Player ja |
| `private_state` | nur Figur | Trainee nie, Coach nicht dumpfen |

Ein Drill = ein Fokus, in drei Beobachtungsmomenten entpackt — **nicht drei Kompetenzen**.

### 6.1 Acht Frozen-Fälle (de-AT, Wien, erfundene Trainingswerte)

| ID | Titel | Figur | Eine Prüfung | Fokus |
|---|---|---|---|---|
| S01 | Alsergrund, zwei Honorare | Elisabeth Leitner | 12.000 € erklären, nicht die Firma | Leistungsumfang vor Preis |
| S02 | Ottakring, klares Nein | Franz Berger | Absage wörtlich, aufhören | Grenze halten |
| S03 | Währing, zwei Geschwister | Andreas Huber | Interesse ≠ Vollmacht | Wer entscheidet |
| S04 | Hernals, unangemeldet Verwaltung | Monika Felber | Floskel → Leitung tot | Anlass zuerst |
| S05 | Josefstadt, Mehrheit fehlt | Robert Stöger | WEG, kein Alleinauftrag | Mehrheit klären |
| S06 | Neubau, mietrechtliche Frage | Helene Prinz | Makler ist nicht Anwalt | Frage hören, keine Rechtszusage |
| S07 | Landstraße, letzte Sorge | Ingrid Wallner | Sorge vor der Vollmacht | Sorge benennen, nicht übergehen |
| S08 | Wieden, eine Empfehlung | Sabine Moser | Bestand empfiehlt, kein Neuverkauf | Erlaubnis holen |

Beats+Why kanonisch in `lib/scene-intel.ts`. Pack-Wahrheit in `data/Telefoncoaching-Testfaelle.json`.

**S04–S08-Figuren** (Stand später 2026-09-19, CHG-014-A13): keine Stubs mehr. Motive, Hidden Facts, Affekt, Auflegen als Wahl, Anti-helpfulness. Hangup-Gates: Felber nach Floskel ohne Anlass; Stöger bei Scheinauftrag ohne WEG-Mehrheit; Prinz bei Rechtszusage oder Hausverkauf; Wallner, wenn die Bindungs-Sorge übergangen wird; Moser bei Neuverkauf oder Jagd ohne Erlaubnis. Hidden Facts unter Druck zu. Player ohne Rubrik/`TRAININGSZIELE`. Qualität **HYPOTHESE** bis Hörtest. Rebuild muss diese Figuren **behalten oder gleichwertig ersetzen**, nicht zu Helfern machen.

### 6.2 Katalog-UI (Soll)

- Stapel startbarer Karten, nicht eine Featured + Rest-als-Briefing-Liste
- Titel, Badge Telefonat, drei Ziele (Fetttitel+Satz) **ohne Extra-Klick**, Initialen, Name, Rollen-Chip, CTA
- Kein Foto, kein Paywall, keine Fokus-Chip-Leiste „Heute eine Sache“ auf der Karte (Fokus intern `defaultFocusForScenario`)
- Briefing: **eine Seite** — Ziel, drei Ziele, Absatz Lage, „Die Gegenseite kennt Ihren Auftrag nicht.“, Start. Keine Tabs Übersicht/Auftrag/Evaluationsziele

---

## 7. After-Call (schon erforscht, nach funktionierendem Anruf)

**Debrief:** Fokus-Note + Schlüsselmoment + Zitat = ein Block. Klick springt zur Turn-Zeile. Repeat-ab-Turn primär. Coach sekundär. Rubrik 0–4 eingeklappt. N/A ehrlich. Keine Waveform, kein Practice-Audio ohne Consent.

**Verlauf:** Gruppierung Offen / Denselben Moment / Ausgewertet / Ruhend. Repeats einer Stelle = eine Karte. Keine B1–B4 als zweite Wahrheit. Kein €.

**Coach:** Deep-Link `/coach?session=&turn=`. Spielbuch + Anker. Ohne Query: Chip-Briefing vor dem Call.

---

## 8. Was beim bisherigen Bau schiefging (für den Rebuild)

1. **Steal-Dossiers ohne Entscheidung** wirkten wie Arbeit, waren Katalog.
2. **Chrome ohne Leitung:** Karten/Coach umgebaut, während Calls abbrachen.
3. **Drei alte Drills umlackiert** sind keine neuen Karten. BO: Katastrophe / Rückschritt.
4. **Over-Correction:** Careertrainer-Ziele hinter „Was zählt“ versteckt, nachdem die Konsole zu voll war. BO: Karten sind die Basis, Ziele müssen **geschrieben und sichtbar** sein.
5. **Agenten-Meldungen statt Fläche.** Nutzer sah die App nicht.
6. **Ohr ungemessen.** Transport-Patches ohne 5-Min-Hörbeweis sind HYPOTHESE.
7. **Nicht klonen:** Gong-Home, Careertrainer-Paywall, Hyperbound-Gym.

---

## 9. Empfohlene Rebuild-Reihenfolge

Hart, in dieser Folge. Nichts aus 3–5, solange 1 rot ist — **außer** die Karteninhalte (Punkt 0), die der Anruf braucht.

0. **Karten schreiben** — acht vollständige Trainingsstücke + Figuren (public/private). Ohne das kein Gespräch.
1. **Leitung hält** — 5 Minuten oder bewusstes Auflegen. False-Barge aus, Hangup hörbar tot, Repeat remountet. Drei Hörtests.
2. **Katalog + Briefing rendern** die Karten (Anatomie §6.2).
3. **Live-Chrome** = Telefon (Status, Auflegen). Kein Score.
4. **Debrief-Instrument** Note+Moment+Sprung+Repeat.
5. **Coach** auf Anker; Verlauf als Übungs-Pipeline.
6. Erst dann: Practice-Audio (Consent), Einwand-Karte nur bei Fokus Einwand, Homepage-Copy.

**Nicht im Rebuild Gate A:** Forecast, Billing, Avatare, Live-HUD, Mandanten, Datadog, Gong-Share, 70/30-Note, CRM.

---

## 10. Technik-Ist (nur Orientierung, kein Zwang für Greenfield)

Falls an diesem Repo angesetzt wird, nicht aus dem Nichts:

- Next.js App Router, React Client für Live
- SQLite Sessions
- OpenAI Realtime WebRTC (`lib/openai-realtime.ts`, `components/training/liveCall.ts`)
- Role Engine unter `src/role-engine/` (persona, hangup, affect, stateReducer, evaluator)
- Verticals: immobilien (live), versicherung / hausverwaltung / finanzierung (ready, nicht Gate-A-Kern)

Greenfield darf denselben **Vertrag** halten und den Stack tauschen — Isolation und Kartenkanon bleiben.

---

## 11. Coaching-Grammatik (12 Typen, nicht 12 Screens)

Aus Gong-Enable / Hyperbound Talk-Tracks, gehärtet auf Zinshaus (`lib/coach-canon.ts`):

Situationen als Chips: Erstkontakt (zwei alternative Drills), Bedarf, Einwand, Preis/Honorar, Vollmacht, Absage, Nachfassen, Empfehlung, … plus **Repeat-Loop** als 12. Typ.

Jede Karte: `{ situation, goal, do[], avoid[], questions[], phrase }`. `phrase` nur nach Hangup. Isolation nicht lehren. „Termin ≠ Beweis“ ist Policy, kein 13. Typ.

---

## 12. Evidenzregeln für den Rebuild-GPT

- Öffentliche Fremd-UI hinter Login nicht erfinden.
- Keine urheberrechtlich langen Gong-/Careertrainer-Texte übernehmen; Struktur und eigene de-AT-Worte.
- Kein Qualitätsclaim ohne Sample (Hörtest, Nutzer, Unsicherheit).
- `not_assessable` statt Fake-Note.
- Wenn etwas unklar ist: UNBEKANNT schreiben, nicht füllen.

---

## 13. Ein-Satz-Nordstern

> Ein Wiener Makler wählt eine **geschriebene** Szene, führt ein **telefonisches** Gespräch gegen eine **unhilfreiche** Figur, legt auf, sieht **einen** Hebel an **einer** Stelle, und übt **denselben Satz** — der Coach kennt das Spielbuch, die Figur nicht.
