# CHG-20260919-010 — A02 Steal-Dossier Hyperbound

```yaml
change_id: CHG-20260919-010-hyperbound
source: a02-produktleitung
reviewer: K02
status: FREIGEGEBEN (Dossier; kein Produktcode, kein BO-Beschluss)
gate: Gate A / G2
primary_owner: A02
reviewer_role: K02
stichproben: [A03 UI-erfunden, A08 Skript-in-Figur / Live-Scorecard]
non_goals:
  - Produktcode
  - Rubrik in den Role Player
  - Avatar-Kern
  - 1:1 Markenklau
  - Enablement-Suite
  - Billing, Mandant, Studio
  - Drill-Gym in Gate A
  - Live-HUD in der Leitung
  - MEDDPICC als Wahrheit
  - Revenue-/Win-Rate-Claims als unsere Qualität
firma: Hyperbound (hyperbound.ai) — IntelligentSystems Corp.
recherchedatum: 2026-09-19
login_in_app: UNBEKANNT
```

Kein Produktcode. Examiner erst nach Auflegen. Role Generator, Role Player, State Engine und Evaluator bleiben getrennt.

---

## Phase 1 — A Auftragsverständnis

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung: Steal-Corpus für Telefon-Produkt (nicht Avatar-Akademie). Produktaufbau, Szenario-/Skript-Struktur, Website-IA, Practice-UI, Scorecards und Coach-Debrief gegen unseren Ist-Stand messen. Lernen, nicht nachbauen.
- betroffene Komponente: nur Entscheidungsakte. / , /sitzung, /coach, /auswertung, coach-canon.ts, S01–S03 — als Vergleichsobjekt, nicht als Patch.
- Nicht Ziele: Produktcode; Rubrik im Role Player; Avatare im Kern; Enablement-Suite; Live-HUD; MEDDPICC-als-Wahrheit; Win-Rate als Qualität; Billing/Mandant/Studio; Drill-Gym in Gate A.
- Annahmen: Öffentliche Website, Help, Videos, G2-Snippets reichen für ein Dossier. Login-App bleibt UNBEKANNT.
- Unbekannt: echte In-App-Practice-HUD; Live-Transkript während Roleplay; Listenpreis; unabhängige Revenue-Kausalität.
- Akzeptanz dieser Datei: ≥25 Quellen; Teile A–F; Evidenzstufen; A dann K; FREIGEGEBEN nur Dossier; Abbruch nur wenn weder Walkthrough noch Live-vs-Debrief. Beides liegt vor (YouTube-Walkthrough + Support Post-Call + Practice-FAQ).
```

---

## Phase 2 — A Impact

```text
IMPACT_PLAN
- Dateien: nur diese Akte. Kein Produktcode. Keine Verträge.
- betroffene Verträge: keine Änderung. Isolation Role Player ≠ Rubrik bleibt.
- abhängige Rollen: A00 bündelt Steal-Corpus; A03/A08 nur Stichprobe in dieser Akte, kein Bauauftrag.
- Wiederverwendung: CHG-010 Change Card; Gate-A Invarianten aus 008-A02; coach-canon.ts Playbooks; S01–S03 Blurbs; ConversationView / EvaluationView als Ist-Stand.
- kleinster Umfang: Information only.
- Zieltests: keine (kein Code).
- Qualität/Kosten: Hyperbound-Revenue-Claims UNBEKANNT für uns. Kein VERIFIZIERT über Lerntransfer ins eigene Produkt.
```

---

## Phase 3 — A Fachentwurf

### Evidenzlegende

| Stufe | Bedeutung in dieser Akte |
|---|---|
| VERIFIZIERT | Primärquelle 2026-09-19 gelesen oder im Browser gesehen |
| PLAUSIBEL | fachlich begründet, nicht am Login-Produkt geprüft |
| HYPOTHESE | offene Annahme mit Falsifikation |
| UNBEKANNT | Daten fehlen oder Login-Wand |

Revenue-, Ramp- und Win-Rate-Zahlen von Hyperbound-Kunden sind **deren Marketing**. Für uns: **UNBEKANNT**. Kein Transferbeweis.

---

### Abbruchprüfung

| Kriterium | Nachweis | Urteil |
|---|---|---|
| Product-Walkthrough | YouTube Coach-to-Scale Live-Roleplay mit CEO [Q30]; Support „Navigate as a Rep“ + Post-Call [Q20][Q21]; Website-Demos [Q7]; Webinar-Seite AE-Walkthrough [Q41] | erfüllt |
| Live-vs-Debrief-Trennung | Practice-FAQ: Feedback **after every call** [Q2]; CEO im Video: „This is a debrief“ / „right after the role play“ [Q30]; Perform Live-HUD ist **anderes Produkt**, Add-on [Q16][Q3] | erfüllt |

Kein Abbruch.

---

### Unser Ist-Stand (Messlatte)

| Fläche | Stand 2026-09-19 | Quelle im Repo |
|---|---|---|
| `/` | Hero + Featured Drill („Zuerst diese“) + Katalog „Weitere Drills“ + StartSession | `app/page.tsx` |
| `/sitzung/[id]` | ConversationView: Mic, Orb, Timer/Status, Auflegen, Live-Turns | `components/training/ConversationView.tsx` |
| `/coach` | Chat + Chips + Playbooks | `app/coach/page.tsx`, `lib/coach-canon.ts` |
| `/sitzung/[id]/auswertung` | EvaluationView: Fokus-Dimension, Score /4, Zitat, Rationale, Repeat | `components/training/EvaluationView.tsx` |
| `/autor` | Szenario schreiben | `app/autor/page.tsx` |
| S01 | Honorarvergleich, Elisabeth Leitner, warm | `lib/content/pack.ts`, `src/role-engine/characters.ts` |
| S02 | Kaltakquise / klares Nein, Franz Berger, cold | ditto |
| S03 | Miteigentum, Andreas Huber, warm, Teilvollmacht | ditto |
| Gate A | 5-Min Browser, Audio first, kein Avatar, Figur hilft nicht, ein Fokus, Repeat geplant, Gym **nicht** in Gate A | `CHG-20260919-008-a02-produkt.md` |

---

## A — Produktaufbau

Hyperbound verkauft sich 2026 als **Revenue Activation**, nicht als LMS. FAQ wortgleich: „Is Hyperbound an LMS? No.“ [Q1][Q2]. Drei Schichten:

| Schicht | Was es ist | Lizenz | Gate A für uns |
|---|---|---|---|
| **Practice** | AI-Buyer-Roleplay, Scorecards, Coaching nach dem Call, Bot-Builder, Learning Modules, Leaderboards | Free + Practice Enterprise | Analog: unser Kern. STEAL Muster, nicht Suite |
| **Perform** | Real-Call-Scoring, Deal Coaching, Conversation Intelligence, Bite-sized (Pricing-Tabelle), Call Capture | Perform Enterprise | AVOID. Kein Gong-Loop, kein Billing-Stack |
| **Kota Activate** | Agent: Ask-anything, Automations, Deal-Q&A, Bot/Scorecard-Bau | teils Practice (Ask), voll in Perform | AVOID in Gate A |
| **Live Call Coaching** | Desktop-HUD **auf echten Calls** | Add-on, Pricing-Zeile extra [Q6] | AVOID. Nicht in die Leitung |

**Practice vs Perform — VERIFIZIERT.** Pricing-FAQ: Practice = rehearsing until behavior changes; Perform = score every real conversation and roll up across the deal [Q6]. Homepage-Tabs Practice / Perform / Activate [Browser Home 2026-09-19].

**Was ist eine Session.** PLAUSIBEL aus Support + Video, Login UNBEKANNT:

1. Rep öffnet einen **Bot** (Persona + Call Type + optional Scorecard).
2. Pre-Call-Screen: Name, Titel, Firma, Special Instructions [Q20]. Optional Scorecard-Preview [Q26].
3. Mic-Permission → **Start Call** → Audio oder Video [Q20][Q42].
4. Gespräch. Bot hängt auf oder Rep beendet.
5. **Post-Call-Screen**: Score, Kriterien, Transkript, Coaching, Objections-Tab [Q21].
6. Repeat: gleicher Bot erneut; oder Restart ab einer Bot-Zeile [Q27]; oder Bite-sized mit klarem Start/Stop [Q23].

Eine Session ist also **ein scored Call-Record** (Roleplay *oder* Real Call), nicht ein Lernmodul. Learning Modules gruppieren Bots zu Pfaden [Q19][Q10].

**Persona-Builder.** VERIFIZIERT als öffentliches Feldmodell, nicht als Login-UI:

Brain-Dump / Bot-Brain [Q24]:

- Company (echte Namen werden angereichert)
- Scenario (Lage jetzt)
- Pain Points
- Objections
- Opinions / Diction in der 2. Person („you“)
- Date-Template in Opinions
- Upload: Enablement-Dateien, Transkript → Persona „~85% ready“ [Q2]

Variationen [Q25]: Name, Avatar/Gender, Voice, Emotional State, Call Type, Scenario/Research, Job Title, Company, Scorecard Config, Language. Geerbt vom Parent: Opener, Objections, Goals, Opinions, Company details, Personal details, Description, Custom roleplay settings.

Chrome-Extension: Bot aus LinkedIn-Profil [Q2]. Login-Funktion UNBEKANNT.

**Scorecard.** Eigenes Objekt, nicht im Bot-Brain. Grades **jede** Roleplay- und Real-Call [Q22]. Drei Tabs: Overview / Content / Testing. Kriterien binär, transkriptfähig, AI-Grading (Konzept) oder Keyword-Matching (Disclaimer). Section-Weights müssen 100 % ergeben [Q34]. Practice-vs-Real-Gap im Overview: Roleplay viel höher = Scorecard gelernt, nicht Transfer [Q22]. Das ist das einzige ehrliche Transfer-Signal im Produkt — und es braucht Perform.

**70/30 Knowledge vs Style.** In Hyperbound-Quellen **nicht gefunden**. Weights-Artikel nennt typisch 60–70 % auf Pain Discovery / Solution Mapping bei Demo-Training, nicht Knowledge/Style [Q34]. **UNBEKANNT als Produktclaim.** AVOID, Style als Drill-Note zu übernehmen.

**Manager-Dashboard.** VERIFIZIERT in Help, nicht im Login: Call History (Recording, Transcript, Score), Filter Rep/Team/Call Type, Analytics-Export CSV, Kota-Reports, Rep Dashboard Widgets, Visibility org-weit [Q28][Q29][Q10]. Default: Manager/Admins sehen alle Calls; Member kann auf „Personal only“ [Q28][Q35].

**Wer sieht Scores.**

| Rolle | Sicht | Quelle |
|---|---|---|
| Rep | eigene Calls + geteilte Bots; optional Team/All | [Q28] |
| Manager / Observer | Team oder All, je Org-Setting | [Q28][Q35] |
| Admin / Member+ | Bau + Sicht je Setting | [Q28] |
| Leadership via Kota | Weekly digest, closed-won-Korrelation **behauptet** | [Q2] — Claim UNBEKANNT für uns |

**Integrationen.** VERIFIZIERT als Marketing-/Help-Liste, Tiefe UNBEKANNT ohne Login:

- CRM: Salesforce (AppExchange-Package, Deal Sync, Auto-Fill) [Q39], HubSpot, Dynamics, Pipedrive [Q6][Q13]
- Recorder/Dialer: Gong [Q38], Zoom, Google Meet, Teams, Salesloft, Outreach, Orum, Aircall, Chorus [Q3][Q11]
- LMS/CMS: Seismic, Highspot, Showpad, Workramp, SCORM — **Practice**-Plan [Q6]
- SSO/SCIM: Okta, Workday, Rippling [Q11]
- Slack / Teams [Q11]
- Mindtickle steht auf der Integrationsseite — Enablement-Nachbar, nicht Ersatz [Q11]

**Pricing.** Kein Listenpreis. Free: 45 Prebuilt Roleplays + Example Scorecards. Practice Enterprise vs Perform Enterprise, per User, getrennte Lizenzen [Q6]. Dritter-Review behauptet dauerhaft Free mit 9 Bots [Q40] — **Widerspruch** zur aktuellen Pricing-Seite (45). Version/Copy, nicht für uns entscheidbar.

---

## B — Szenarien / Skripte

### Grammatik (öffentlich)

Ein übares Objekt = **Bot + Call Type + optional Scorecard + optional Bite-sized-Fokus**.

| Baustein | Gehört wem | Hyperbound-Feld | Unsere Entsprechung |
|---|---|---|---|
| Identität | Figur | Name, Title, Company, Avatar, Voice, Gender | `identity` in `characters.ts` |
| Lage jetzt | Figur | Scenario / Research / „what the bot already knows“ | `persona.situationNow`, `innerLife` |
| Buyer-Ziele | Figur | Goals, Pain, Opinions | `openGoal` / `hiddenGoal` |
| Einwand-Bibliothek | Figur (Pushback), nicht Rubrik | Objections im Brain; Objections-Tab **nach** Call | S02 Tabus + Hangup; PB-OBJ in coach-canon |
| Trigger-Satz | Figur | Opener / „What should the bot open with?“ | `opening` im Pack |
| Talk tracks | **Rep / Coach nach Call** | Post-Call „questions or talk tracks they should try next time“ [Q2] | `/coach` Playbook `phrase` + `/auswertung` |
| Rubrik | Evaluator | Scorecard sections/criteria, getrennt | EvaluationView Dimensionen, nicht Role Player |
| Fokus | Drill-Zuschnitt | Unten: Bite-sized Advanced Settings | Gate A: ein Fokus / `practiceFocus` |

**Bitesize vs Full Call.** VERIFIZIERT.

- Full: Cold, Gatekeeper, Voicemail, Warm, Discovery, Demo, Deck-Walkthrough, Upsell, Renewal, Check-In, Manager-1:1, Knowledge Roleplays [Q5].
- Bite-sized: 3–5 Min Marketing [Q2]; Help-Beispiele 10-Min Objection-only [Q23]. Drei Felder: already-knows / focus / opener. Fokus-Presets: Objection, Qualification, Discovery, Budget, Closing, custom.
- **Widerspruch Pricing:** Bite-sized Roleplays stehen in der Compare-Tabelle unter **Perform**, nicht Practice [Q6]. Practice-Seite verkauft 3–5-Min-Deal-Prep trotzdem [Q2]. PLAUSIBEL: Feature wanderte; Login UNBEKANNT.

**Trigger-Satz.** Bite-sized-Beispiele sind explizite Buyer-Opener, Kurzzitat je ein Satz [Q23]:

- „Just a heads up, we don’t have budget for anything new right now.“
- „Just send me something and I’ll take a look.“
- „We’re not really looking to change anything right now.“

Das ist **Figur-Rede**, kein Coaching-Skript — STEAL als Opening, nicht als Talk-Track im Player.

**Talk tracks.** Erscheinen im **Post-Call-Coaching**, nicht als Bot-Linie [Q2][Q21]. Homepage-Debrief-Mock: vorgeschlagene nächste Frage + Begründung [Browser Practice 2026-09-19].

**Einwand-Bibliothek.** Zwei Schichten:

1. Im Bot: welche Pushbacks die Figur wirft (Brain + Rotation, Login-Details UNBEKANNT).
2. Nach dem Call: Objections-Tab mit Timestamp, Transkript, Handling-Bewertung [Q21].

### Mapping auf S01 / S02 / S03 und `coach-canon.ts`

| Unser Drill | Hyperbound-Analog | Steal | Avoid |
|---|---|---|---|
| **S01 Honorar** Elisabeth, 12k-Unterschied, warm | Discovery / Demo-Qualifying + Price objection bite-sized; Bot-Felder Pain + Hidden Goal | Ein Fokus: Beleg für den Aufpreis, nicht MEDDPICC-Checkliste | Metrics/Decision-Criteria-Scorecard während des Calls |
| **S02 Kaltakquise** Franz, Nein, legt auf | Cold Call + „rudest bot“ [Q30]; Bite-sized Status-quo / Send-me-info | Trigger-Opener + Abbruch als Charakterwahl | Meeting-Booked = Erfolg; 9/9 Permission-Opener-Rubrik im Player |
| **S03 Miteigentum** Andreas, Teilvollmacht | Multiparty (Champion + Economic Buyer) [Q2][Q15] — **nicht** Gate A | Ein Fokus: keine Vollmacht vortäuschen (`PB-DEC` analog) | Zwei-Stakeholder-Bot jetzt |
| `PB-PREP-001` | Pre-Call-Screen + optional Scorecard-Preview | 90-Sek-Check **ohne** Rubrik-Preview in Gate A | Scorecard vor dem Wählen (lehrt auf den Test) |
| `PB-OPEN-001` E-R-K-B-N | Permission-based opener als **Scorecard-Kriterium** im Video [Q30] | Als Coach-Chip nach dem Call | Als Bot-Instruction „lass den Rep die Erlaubnis holen“ |
| `PB-OBJ-001` V-S-K-B | LAER / Empathize-Isolate-Solve in Blogs [Q17][Q36]; Objection-Tab nach Call | Einwand-Karte **nach** Auflegen mit Zitat | Framework als Wahrheit; Live-Battlecard |
| Repeat derselben Stelle | Restart from bot line [Q27]; Bite-sized clear start/stop [Q23] | Repeat-same-scenario in `/auswertung` (schon da) | Gym, Playlist, Blitz, Certification in Gate A |

**A08-Risiko (Skript in Figur).** Bite-sized-Feld „What should the bot **focus on**“ kann ein Trainingsziel in die Figur schreiben („You will throw the objection…“, „Testing qualification“). Das verletzt unsere Isolation, wenn es in den Role Player wandert. STEAL nur die **Buyer-Lage** und den **Opener**. Fokus gehört ins Briefing des Trainees und in die Rubrik des Evaluators.

---

## C — Website-IA + 8 Steal-Flächen für `/`

### IA (Browser 2026-09-19, Home + Practice + Footer)

```text
Nav: Logo | Solutions ▾ | Pricing | Success stories | Resources ▾ | Enterprise | Login | Book a demo
Hero: eine Behauptung + zwei CTAs (Book a demo / Try a Roleplay)
Proof: G2 4.9, „100,000+ reps“, Logo-Slider
Produkt: Tabs Practice | Perform | Activate
How it works: Roleplay → Real Call Reinforcement → Agents
Social proof: Case-Carousel (Vanta, ALKU, Klaviyo, JumpCloud, Nivoda)
Enterprise: Sprachen, SSO, SOC2, Integrationslogos
FAQ + Footer-CTA: „Try Hyperbound in 30 seconds“
```

Solutions-Mega: Product (Practice / Perform / Kota) + Use Cases (Pre-Call Prep, Everboarding, Hiring, Onboarding, QA) + Industries.

Resources: Demos, Blog, Change Log, Competitions, Success Stories, Integrations, Partners, Wall of Love, YouTube.

**Wie sie „Start a Roleplay“ verkaufen.** Eine Handlung, nicht ein Feature-Wald. Zweiter CTA immer Demo-Call. Featured Bot auf Home: Name, Titel, Call-Type-Chips (Discovery / English / Sassy), Button **Start Roleplay** [Browser Home].

**Widerspruch Free-Demo.** FAQ: Free interactive demo, no credit card [Q1]. `https://app.hyperbound.ai/ai-roleplay` → Login-Wand (`auth.hyperbound.ai`) am 2026-09-19 [Browser]. In-App-Katalog UNBEKANNT. Steal die **Handlung**, nicht die Behauptung „30 Sekunden ohne Account“.

### 8 Steal-Flächen für `/` (Audio-first, eine Handlung, Katalog vs Featured)

| # | Steal | Warum lernwirksam | Gate A |
|---|---|---|---|
| 1 | Eine Primärhandlung: Gespräch starten | Senkt Cognitive Load; Hyperbound Hero macht genau das | schon: `StartSessionButton` auf Featured |
| 2 | Audio-first Hero, Telefon nicht Avatar | Hyperbound positioniert sich selbst gegen Second-Nature-Avatare [Q14][Q15] | halten; kein Gesicht im Kern |
| 3 | Featured Drill zuerst, Rest darunter | Home: ein Bot + Start; wir: „Zuerst diese“ + „Weitere Drills“ | schon nah; Featured = S01 nicht „alle gleich“ |
| 4 | Call-Type + Härte sichtbar **vor** Start | Chips Discovery / Sassy; unser `callLabel` + „Legt schnell auf“ | halten; S02-Härte nicht weichspülen |
| 5 | Proof als soziale Lizenz, nicht als Qualität | G2-Zahl + Cases **neben** CTA | höchstens „Übung, kein echter Anruf“ — keine Win-Rate |
| 6 | Zweite Handlung: Briefing zuerst | Hyperbound Pre-Call-Screen [Q20]; wir: Link „Briefing zuerst“ | halten |
| 7 | Repeat-Loop im Hero-Satz | Home-Slider-Labels Roleplay → Score → Coach → Repeat | nach Gate A auf `/auswertung`, nicht als Gym-CTA auf `/` |
| 8 | Kein Feature-Grid über dem Start | Practice-Seite erst nach Scroll: Roleplay / Scorecards / LMS / Analytics | `/` bleibt Katalog, Suite-Karten bleiben `/coach` und später |

Nicht stehlen auf `/`: Leaderboards, Certifications, „100k reps“, MEDDPICC-Badges, Practice/Perform/Activate-Tabs.

---

## D — Practice-UI (Briefing / Live / Debrief)

Login = UNBEKANNT. Rekonstruktion aus Help + Video + Marketing-Mocks. A03-Stichprobe unten.

### Drei Zustände gegen ConversationView

| Zustand | Hyperbound (öffentlich) | ConversationView heute | Steal | Avoid |
|---|---|---|---|---|
| **Briefing** | Call Screen: Persona, Titel, Firma, Special Instructions; Mic-Padlock; optional volle Scorecard-Preview [Q20][Q26] | `/szenario/[id]` + Start auf `/` | Persona + ein Satz Lage + ein Fokus. Mic **vor** Start (Transparenzsatz bleibt A11) | Scorecard-Preview; Special Instructions = Rubrik |
| **Live** | Start Call; Audio oder Video; Timer + End call in Mocks; Mic-Test bei stummem Bot [Q20][Q42]; Changelog: video-call-style UI, who’s speaking [Q10] | Orb, Statuszeile, Auflegen, Barge-in, Live-Turns | Timer + Auflegen + Name der Figur. Audio first | Video-Call-Chrome, Avatar, Live-Score, Battlecards, Kota-Chat in der Leitung |
| **Debrief** | Score, Sections, Kriterien klickbar, Transkript+Zitate, Talk-Tracks, Talk-Ratio/Filler, Objections-Tab [Q21][Q2][Q30] | `/auswertung`: Fokus-Score /4, Zitat, Rationale, Repeat | Ein Fokus + ein Zitat + eine nächste Phrase + Repeat same | Filler-HUD; 8-Kriterien-MEDDPICC; Win-Rate |

### Was der Rep **während** des Roleplay sieht

**VERIFIZIERT im Video [Q30]:** Start Call, dann nur das Gespräch. Kein erwähntes Live-Score, keine Kriterien-Ticks, kein Talk-Ratio. Danach Bildwechsel zum Debrief.

**PLAUSIBEL aus Marketing-Home:** Timer `11:34`, Button End call, Persona-Kopf (Name, Titel, Chips). Das Home-Slider legt **danach** Score 82 über dieselbe Fläche — Composite, kein Beleg für Live-HUD im Practice.

**UNBEKANNT:** Live-Transkript während Practice; Orb/Waveform; Barge-in-Anzeige; ob Video-Call ein Gesicht zeigt oder nur Screenshare/Vision [Q37].

### Mic, Hangup, Repeat

- Mic: Browser-Permission, Padlock, Cache-Clear, internes Mic statt Dock, Kopfhörer gegen Echo [Q42]. Ohne Mic antwortet der Bot nicht.
- Hangup: End call in Mocks; Bot kann selbst beenden (Video: „Goodbye“).
- Repeat: gleicher öffentlicher Bot beliebig oft [Q30]; Restart ab Bot-Zeile mit Tag „Restarted Call“ [Q27]; Resume-Call via Transkript-Upload (älter, umständlicher) [Q23].

### A03-Stichprobe — UI erfunden?

| Behauptung | Stufe | Fundstelle |
|---|---|---|
| Pre-Call zeigt Persona/Titel/Firma | VERIFIZIERT | [Q20] |
| Start Call + Mic-Permission | VERIFIZIERT | [Q20][Q42] |
| Video-Option existiert | VERIFIZIERT | [Q20][Q10] |
| Score + Kriterien **nach** dem Call | VERIFIZIERT | [Q2][Q21][Q30] |
| Timer + End call im Live-Chrome | PLAUSIBEL | Home-Mock, nicht Help-Text |
| Live-Transkript im Practice | UNBEKANNT | nicht in Help-Schritten |
| Live-Scorecard / Filler während Practice | nicht belegt | Video widerspricht; HUD ist Perform-Add-on [Q16] |
| Free-Demo ohne Login | widerlegt am 2026-09-19 | App → Login [Browser] |

**A03-Urteil:** Diese Akte erfindet kein Practice-Live-HUD. Wo die Home-Fläche Score über Timer legt, steht **Composite / PLAUSIBEL**, nicht Ist-UI.

---

## E — Scorecard / Coach nach Call

### Was Hyperbound nach Stop zeigt (öffentlich)

1. Gesamt-Score (Video: 9/9; Mock: 82) [Q30][Browser Practice]
2. Sections mit x/y (Value and Proof 2/2, MEDDPICC 1/2, Discovery 2/2)
3. Binäre Kriterien + Haken
4. Klick → Begründung + Transkriptzitat [Q2][Q30]
5. Block „What you could do differently next time?“ + vorgeschlagene Fragen
6. Call stats: Talk Ratio, Filler [Q21]
7. Tab AI Coaching pro Kriterium [Q21]
8. Tab Objections: Timestamp, Zitat, Handling [Q21]
9. Optional: Restart-Tag, Assignment, Manager-Note [Q27][Q29]

**Knowledge vs Style.** Scoring ist verhaltens-/konzeptbasiert („who typically makes purchases“ zählt als Decision-Maker) [Q2]. Talk-Ratio und Filler sind **Statistik**, nicht das Drill-Ziel [Q21]. 70/30 Knowledge/Style: **nicht gefunden**.

### 12 Karten-Typen für `/coach` und `/auswertung`

Nur Muster, keine Hyperbound-Kopie. Examiner bleibt nach Auflegen.

| # | Karte | Fläche | Gate A | Lernnutzen |
|---|---|---|---|---|
| 1 | Ein Fokus, eine Note | `/auswertung` | STEAL/halten — schon Fokus-Dimension | Cognitive Load |
| 2 | Transkriptzitat zur Note | `/auswertung` | halten (`score.quote`) | Beleg statt Wohlfühl |
| 3 | Eine Stärke | `/auswertung` | STEAL verdichten | Formativ, nicht 8 Haken |
| 4 | Ein Fix + nächste Phrase | `/auswertung` + `/coach` | STEAL aus Talk-Track-Block | Deliberate Practice |
| 5 | Repeat same moment | `/auswertung` | halten; kein Gym | gleiche Stelle |
| 6 | Einwand-Karte (Zitat + ob gehört) | `/auswertung` | DEFER nach S02-Härte | nicht Live |
| 7 | N/A / not_assessable | `/auswertung` | halten | ehrliche Lücke |
| 8 | Briefing-Chip vor dem Call | `/coach` / `/szenario` | halten `PB-PREP` | ohne Rubrik |
| 9 | Situations-Playbook (do/avoid/phrase) | `/coach` | halten `PLAYBOOKS` | nicht in Figur |
| 10 | Restart-ab-Zeile | später | DEFER | Gym-Nachbar |
| 11 | Practice-vs-Real-Gap | nie Gate A | AVOID | braucht echte Calls |
| 12 | Talk-Ratio / Filler / Style | nie als Drill-Note | AVOID | Scheinmetrik |

Karten 1–5, 7–9 sind der Vertical Slice. 6 nur wenn der Fokus Einwand ist. 10–12 nicht bauen.

---

## F — Was NICHT stehlen

| Item | Warum | Fundstelle |
|---|---|---|
| Avatare / 3D-Gesicht | Hyperbound selbst grenzt sich gegen Second Nature ab; wir Audio-first | [Q14][Q15]; Gate A |
| Video-Call als Kern | Existiert seit 2024-09 [Q10]; Vision/Screenshare für Demos [Q37] | nicht Telefon-MVP |
| Live-KP / Filler während Call | Stats sind Post-Call; Live-HUD ist Perform-Add-on für **echte** Calls | [Q21][Q16] |
| Manager-Ridealong / Live-Panel | „Managers can’t sit on every call“ → HUD statt Mithören [Q16] | Mandant/Studio später |
| Win-Rate / Pipeline / Ramp als Qualität | Vanta 60 % Ramp, Nivoda 2× Revenue, 150 % Demo — **deren** Claims | [Q8][Q18] — UNBEKANNT für uns |
| MEDDPICC als Wahrheit | Home-Mock und Scorecard-Beispiele; Support: ein Scorecard pro Call-Type, custom | [Q22] — Framework ist Kundeninhalt |
| Rubrik in der Persona | Scorecard = eigenes Objekt; Bite-sized-Focus darf nicht in den Player | [Q22][Q23]; TEAM_KERNEL |
| Enablement-Suite / LMS | FAQ: kein LMS; LMS-Integrationen sind **Anbindung** | [Q1][Q6] |
| Kota-Automationen, CRM-Autofill, Gong-Loop | Perform | [Q3][Q12] |
| Leaderboards, Competitions, Certification-Gauntlet | Adoption-Mechanik, nicht Gesprächsrealismus | [Q2][Q10] |
| LinkedIn-Bot-Factory | Chrome-Extension, Deal-Prep | nicht Gate A |
| Multiparty Committee | Enterprise-Discovery | S03 bleibt eine Stimme |
| Knowledge vs Style 70/30 | kein Beleg | [Q34] negativ |
| Closed-won-Korrelation als Coach-Text | Kota-Claim | [Q2] UNBEKANNT |

---

## Widersprüche Marketing vs FAQ / Help

| Spannung | Marketing | Primär/Help/Video | Folge für uns |
|---|---|---|---|
| Feedback during vs after | YouTube-Titel/Intro: „Realtime Coaching“, „adjustments on the fly“ [Q30] | CEO: Debrief **after**; Practice-FAQ: after every call [Q2]; Live HUD = Perform-Add-on [Q16] | Examiner nach Auflegen. „Instant“ ≠ Live-HUD |
| Free demo 30 s | FAQ + Footer [Q1] | App-URL verlangt Login [Browser] | Keine 30-s-Behauptung auf `/` |
| Audio-first vs Video | Mindtickle-Vergleich: „currently audio-based (no video avatars)“ [Q14] | Support: Audio **oder** Video; Changelog Video+Screenshare [Q20][Q10]; Variations: Avatar-Feld [Q25] | Avatar = Bild/Variante, nicht Akademie. Kern bleibt Stimme |
| Bite-sized in Practice | Practice-Seite 3–5 Min [Q2] | Pricing: Bite-sized unter Perform [Q6] | Kurze Drills dürfen bei uns in Practice liegen — das ist unser Slice |
| 2M+ hours real B2B | durchgängig [Q12][Q15] | zugleich „simulated calls informed by real patterns“ [Q15] | Claim nicht übernehmen |
| Free-Plan-Größe | 45 Prebuilt [Q6] | Drittquelle 9 Bots [Q40] | UNBEKANNT / veraltet |

---

## Videos (Sequenz, keine Langtranskripte)

### [Q30] Coach to Scale — Live Roleplay mit CEO Sriharsha Guduguntla

`https://www.youtube.com/watch?v=J1TwJX_Ykwg`

Zeitmarken **PLAUSIBEL** aus öffentlichem Transkript (keine Kapitel-API). Kurzzitate ≤1 Satz.

| Phase | Was passiert |
|---|---|
| Cold open | Host kündigt „Hyperbound Realtime Coaching“ an — **Marketingwort**, nicht HUD-Beweis |
| Setup | CEO: Demo wie beim Kunden; „rudest bot“; Data-Product gegen ZoomInfo; Ziel Meeting |
| Start | Host: „hit start call“; Screen geteilt |
| Live | Nur Dialog. Kein Score, kein Kriterium, kein Filler-Zähler im gesprochenen Walkthrough |
| Stop | Bot beendet („Goodbye“) |
| Debrief | Host sieht 9/9. CEO: „This is a debrief.“ Kriterien genannt: permission-based opener, research, discovery, takeaway, social proof, closing |
| Repeat | Gleicher Bot öffentlich, beliebig oft |

CEO-Kurzzitat: „right after the role play, you get that instant feedback.“ [Q30]

### [Q31] FreightCaviar — Interview Atul + Sriharsha

`https://www.youtube.com/watch?v=akc8R3AlcBA` — Produktphasen Roleplay → Real Call Scoring. Kein UI-Walkthrough. PLAUSIBEL als Roadmap-Beleg, nicht als Practice-UI.

### [Q32] Fuel to Fire Roleplay Demo

`https://www.youtube.com/watch?v=8Akk2CWhWY0` — Titel nur; Transkript/UI **UNBEKANNT** (Fetch ohne substanzielle Beschreibung).

### [Q41] Webinar „How AEs Actually Win with Hyperbound“

Seite existiert, On-Demand beworben. Agenda: Real Call Scoring, Kota, Bite-Sized, Deal Coaching — **Perform-lastig**. Kein unabhängiger Zeitstempel in dieser Recherche. PLAUSIBEL als zweite Walkthrough-Quelle, nicht als Practice-Chrome.

---

## PDFs / One-Pager / Decks

Öffentliche PDF-One-Pager oder Sales-Decks: **nicht gefunden** (Suche 2026-09-19). Ersatz: Website, Help, Change Log, Case-HTML, Webinar-Landing. Stufe UNBEKANNT für Print-Collateral.

---

## Quellen (≥25)

| ID | URL | Typ | Nutzung |
|---|---|---|---|
| Q1 | https://www.hyperbound.ai/ | Home, Browser | IA, Hero, CTA, Composite-UI |
| Q2 | https://www.hyperbound.ai/product/hyperbound-practice | Product | Practice, Post-Call-FAQ, Bot-Felder |
| Q3 | https://www.hyperbound.ai/product/hyperbound-perform | Product | Perform, Live HUD, Bite-sized |
| Q4 | https://www.hyperbound.ai/product/kota-activate | Product | Kota, Automations |
| Q5 | https://www.hyperbound.ai/product/sales-roleplays | Product | Call-Typen |
| Q6 | https://www.hyperbound.ai/pricing | Pricing | Pläne, Bite-sized-Zeile, CRM |
| Q7 | https://www.hyperbound.ai/demos | Demos | Free-Demo-Claim |
| Q8 | https://www.hyperbound.ai/success-stories | Cases | Vanta/Klaviyo/Nivoda — Claims UNBEKANNT für uns |
| Q9 | https://www.hyperbound.ai/integrations | Integrations | Stack-Liste |
| Q10 | https://www.hyperbound.ai/change-log | Changelog | Video-UI, Real Call, Analytics |
| Q11 | https://www.hyperbound.ai/uses/crm-integration | Use case | Salesforce/HubSpot/Gong |
| Q12 | https://www.hyperbound.ai/uses/ai-sales-roleplay-practice | Use case | Practice+Perform-Loop |
| Q13 | https://www.hyperbound.ai/uses/ai-call-scoring | Use case | Real-Call 100 % |
| Q14 | https://www.hyperbound.ai/blog/mindtickle-vs-hyperbound-sales-coaching | Vergleich | Audio vs Avatar, LMS |
| Q15 | https://www.hyperbound.ai/blog/ai-sales-roleplay-comparison | Vergleich | vs Second Nature / Mindtickle |
| Q16 | https://www.hyperbound.ai/blog/live-call-coaching-coach-the-call-youre-on | Blog | HUD = Perform-Add-on, Score **when it ends** |
| Q17 | https://www.hyperbound.ai/blog/ai-roleplays-objection-handling | Blog | Einwand-Frameworks |
| Q18 | https://www.hyperbound.ai/blog/nivoda | Case | 2× Revenue — UNBEKANNT für uns |
| Q19 | https://support.hyperbound.ai/articles/1091443709-getting-started | Help | Bot → Scorecard → Module → Analytics |
| Q20 | https://support.hyperbound.ai/articles/3518555536-how-to-navigate-hyperbound-as-a-rep | Help | Briefing, Start Call, Audio/Video |
| Q21 | https://support.hyperbound.ai/articles/1339748104-how-to-use-the-post-call-screen-in-hyperbound-ai-coaching | Help | Debrief-Tabs |
| Q22 | https://support.hyperbound.ai/articles/4766442898-how-to-create-scorecards | Help | Rubrik-Grammatik, Practice-vs-Real |
| Q23 | https://support.hyperbound.ai/articles/5386949781-how-to-use-bite-sized-roleplays | Help | Trigger, Fokus, Start/Stop |
| Q24 | https://support.hyperbound.ai/articles/2228003008-building-bots | Help | Brain-Felder |
| Q25 | https://support.hyperbound.ai/articles/4905711096-how-to-create-variations-of-a-bot | Help | Avatar/Voice vs inherited objections |
| Q26 | https://support.hyperbound.ai/articles/8370346370-review-scorecards-before-every-call | Help | Rubrik **vor** dem Wählen |
| Q27 | https://support.hyperbound.ai/articles/6184242048-restart-calls-from-any-point-in-time | Help | Repeat ab Zeile |
| Q28 | https://support.hyperbound.ai/articles/8615536474-how-to-configure-visibility-settings | Help | Wer sieht Scores |
| Q29 | https://support.hyperbound.ai/articles/4045655274-how-to-performance-manage-reps-with-hyperbound | Help | Manager-Dashboard |
| Q30 | https://www.youtube.com/watch?v=J1TwJX_Ykwg | Video | Walkthrough Live→Debrief |
| Q31 | https://www.youtube.com/watch?v=akc8R3AlcBA | Video | Phasen Roleplay→Scoring |
| Q32 | https://www.youtube.com/watch?v=8Akk2CWhWY0 | Video | Titel only, UNBEKANNT |
| Q33 | https://www.g2.com/sellers/hyperbound | G2 | Listing/Snippets; Vollseite Fetch leer → Screenshots UNBEKANNT |
| Q34 | https://support.hyperbound.ai/articles/2685296164-how-to-add-weights-scorecards | Help | Weights, kein 70/30 Style |
| Q35 | https://support.hyperbound.ai/articles/7854527147-how-to-share-call-feedback-with-your-manager-in-hyperbound | Help | Manager sieht Calls default |
| Q36 | https://www.hyperbound.ai/blog/how-to-practice-objection-handling-30-minutes-before-a-big-call | Blog | Pre-Call-Routine 15 Min Roleplay |
| Q37 | https://support.hyperbound.ai/articles/7051538224-how-to-add-vision-to-a-bot | Help | Screenshare/Vision; schließt Bite-sized aus |
| Q38 | https://support.hyperbound.ai/articles/8734673863-gong | Help | Gong-Import |
| Q39 | https://support.hyperbound.ai/articles/9918432278-salesforce | Help | Salesforce-Package |
| Q40 | https://pipeline.zoominfo.com/sales/hyperbound-review | Dritt | Free-Plan 9 Bots — widerspricht Q6 |
| Q41 | https://www.hyperbound.ai/webinars/how-aes-actually-win-with-hyperbound | Webinar | AE-Walkthrough-Agenda |
| Q42 | https://support.hyperbound.ai/articles/2886820389-how-to-fix-an-unresponsive-bot-and-microphone-issues | Help | Mic-Permission |
| Q43 | https://auth.hyperbound.ai/en/login | Auth | Login-Wand, Browser 2026-09-19 |
| Q44 | https://www.hyperbound.ai/blog/why-live-call-coaching-fails-experienced-reps | Blog | Live vs Post-Call Cognitive Load |
| Q45 | https://support.hyperbound.ai/articles/2663019511-best-practices-for-making-scorecards | Help | Binäre Checks, Partial Credit |
| Q46 | https://www.hyperbound.ai/blog/finally | Case | 16k Calls — UNBEKANNT für uns |
| Q47 | https://www.hyperbound.ai/uses/demo-call-practice-tool | Use case | Screen-share Roleplay |
| Q48 | https://support.hyperbound.ai/articles/5421263668-getting-started-with-hyperbound-the-admin-s-checklist | Help | Admin-Reihenfolge |

G2-Vollreviews und Pixel-Screenshots: Fetch ohne Body [Q33]. Snippets aus Suche: Realismus, Scorecards, tägliche Nutzung, Live-Chat-Support. Keine unabhängige UI-Galerie VERIFIZIERT.

---

## Steal-Entscheidung (Gate A)

| Muster | Urteil | Nächste Rolle wenn BO kreuzt |
|---|---|---|
| Featured Drill + eine Start-Handlung | schon nah; Feinschliff Copy | A03 |
| Briefing ohne Rubrik, Live ohne Score, Debrief mit Zitat | halten / schärfen | A03 + A08 |
| Bot-Felder = Figur, Scorecard = Evaluator | Architektur halten | A13 / A07 nur bei Leak |
| Bite-sized = ein Fokus + Trigger-Opener | entspricht S01–S03 | A08 nach Gate A, nicht Gym |
| Restart-ab-Zeile | DEFER | A08 |
| Perform / Kota / HUD / CRM / Gong | AVOID | — |
| Style/Filler als Note | AVOID | A09 blockt Scheinmetrik |

Kein Code in diesem Chat.

---

## Phase 4 — K02 Gegenprüfung

```text
GEGENPRÜFUNG
Prüfumfang:
- Akte CHG-20260919-010-hyperbound.md gegen Auftrag CHG-010, TEAM_KERNEL, Gate-A-Invarianten.
- Kein Login. Kein Produktcode. Quellen Q1–Q48 gegen Behauptungen in A–F.
- Stichprobe A03 (UI erfunden?) und A08 (Skript in Figur / Live-Scorecard).
- Abbruchkriterium Walkthrough + Live-vs-Debrief.

Durchgeführte Angriffe oder Tests:
- Jede VERIFIZIERT-Behauptung gegen Primär-URL.
- 70/30 Knowledge/Style: Volltext-Suche Weights + Scorecard-Help — kein Treffer.
- Live-HUD Practice: Video-Transkript + Practice-FAQ + Live-Coaching-Blog.
- Try-Roleplay: Browser am 2026-09-19 auf Login.
- Pricing Bite-sized vs Practice-Copy.
- Revenue-Sätze: als UNBEKANNT markiert oder nicht?
- UI-Sätze ohne Help/Video: Composite-Kennzeichnung?
```

### BEFUNDE

- **K02-1**
  - Fundstelle: Phase 3 D, „Timer + End call“
  - Schweregrad: NOTE
  - verletztes Kriterium: keine erfundene UI als VERIFIZIERT
  - Nachweis: Help „Navigate as a Rep“ nennt Timer nicht; nur Home-Mock und Changelog „video-call-style“
  - Korrektur: bleibt PLAUSIBEL — in A so gesetzt. Kein Nachzug.

- **K02-2**
  - Fundstelle: Q32 Fuel-to-Fire
  - Schweregrad: NOTE
  - verletztes Kriterium: ≥Walkthrough-Qualität
  - Nachweis: Fetch ohne UI-Inhalt; als UNBEKANNT geführt
  - Korrektur: keine. Walkthrough-Pflicht trägt Q30+Q20+Q21.

- **K02-3**
  - Fundstelle: G2 Q33
  - Schweregrad: NOTE
  - verletztes Kriterium: Auftrag G2-Screenshots
  - Nachweis: `g2.com/products` und `/sellers` Fetch leer; keine Pixelgalerie
  - Korrektur: Lücke benannt. Kein erfundener Screenshot.

- **K02-4**
  - Fundstelle: Video-Zeitstempel Q30
  - Schweregrad: MINOR
  - verletztes Kriterium: „Videos: Zeitstempel“
  - Nachweis: keine Kapitelmarken, keine gemessene Uhr; Sequenz aus Transkript
  - Korrektur: als PLAUSIBEL-Sequenz gekennzeichnet, nicht mm:ss erfunden.

- **K02-5**
  - Fundstelle: A08 Bite-sized „focus“
  - Schweregrad: NOTE (fürs Dossier; BLOCKER nur bei Code)
  - verletztes Kriterium: Role Player sieht keine Rubrik
  - Nachweis: Q23 schreibt Trainingsziel in Bot-Advanced-Settings
  - Korrektur: A markiert AVOID für Player. Kein Code — Dossier ausreichend.

Keine erfundenen Live-Scorecards. Keine 70/30 als Hyperbound-Fakt. Keine Revenue-Zahl als unsere Qualität. Kein Rubrik-Leak empfohlen. Abbruch nicht ausgelöst.

```text
URTEIL
FREIGEGEBEN
```

---

## Phase 5 — Nachbesserung

Kein BLOCKER, kein MAJOR. K02-4 bereits in A als PLAUSIBEL-Sequenz gesetzt. Keine zweite Schreibschleife.

---

## Phase 6 — Retest

Nicht nötig. Keine Korrektur am Inhalt nach K.

---

## Phase 7 — Übergabe

```text
AUFTRAG_ID: CHG-20260919-010-hyperbound
ERGEBNIS: Steal-Dossier Hyperbound. Practice = unser Analog (Roleplay + Debrief). Perform/Kota/Live-HUD = Nicht-Steal. Live-vs-Debrief öffentlich belegt. Login-App UNBEKANNT.
GEÄNDERTE_DATEIEN_UND_VERTRÄGE: .cursor/decisions/CHG-20260919-010-hyperbound.md — kein Produktcode, keine Verträge.
NACHWEISE_UND_TESTS: 48 Quellen; Browser Home/Practice/Login; YouTube Q30 Debrief; Support Pre-Call + Post-Call. Kein Code-Test.
QUALITÄTSWIRKUNG: Information. Gate-A-Invarianten gehalten (Audio first, Examiner nach Auflegen, keine Rubrik im Player).
KOSTENWIRKUNG: keine Laufkosten. Recherchezeit nur.
RISIKEN_UND_OFFENE_HYPOTHESEN: In-App-Practice-HUD UNBEKANNT; Live-Transkript UNBEKANNT; Bite-sized Plan-Lage unklar; 2M-hours und Customer-ROI UNBEKANNT; G2-Galerie nicht geladen; PDF-Collateral fehlt.
GEGENPRÜFER_URTEIL: FREIGEGEBEN
NÄCHSTE_ROLLE: A00 (bündelt Gong/Hyperbound/Careertrainer). Bau nur nach BO. Falls Copy auf `/`: A03. Falls Drill-Zuschnitt: A08 nach Gate A, nicht Gym.
KONTEXT_FÜR_NÄCHSTEN_CHAT: Hyperbound Practice nachahmen als Schleife Briefing→Telefon→Debrief→Repeat. Nicht Perform. Nicht Live-HUD. Bite-sized-Fokus nicht in die Figur. Scorecard-Preview vor dem Call lehrt auf den Test — weglassen. 70/30 Style ist nicht deren Claim.
```
