# CHG-20260919-010 — A02 Careertrainer.ai Steal-Dossier (K02)

```yaml
change_id: CHG-20260919-010-careertrainer
raw_request: "ok führe aus für gong ein agent und ein zweiter agent für hyperbous ein dritter agent für carrerai"
user_alias: "carrerai → Careertrainer.ai (careertrainer.ai, EN /en/)"
user_outcome: "Tiefes Steal-Dossier gegen unseren Ist-Stand: Produktaufbau, Szenario, Website-IA, Übungs-UI, Feedback/Coach, 12 Coach-Karten. Kein Produktcode."
primary_owner: A02
reviewer: K02
stichproben: [A03-UI, A08-Coach-70-30]
gate: Gate A / G2
non_goals:
  - Produktcode
  - Rubrik in den Role Player
  - 1:1 Markenklau
  - Avatar als Produktkern
  - Billing, Mandant, Studio
  - Rechtsgarantie wegen „Server DE“
  - TALKMEISTER als Auftrag (nur DACH-Kontext)
risk_level: medium
full_scan_reason: null
evidence_date: 2026-09-19
abbruch_kriterium: "Nur Homepage-Hero ohne Lösungsseiten und ohne Feedback-Modell → Abbruch."
abbruch_status: nicht ausgelöst
```

Firma öffentlich: **Careertrainer.ai**. Nutzer schrieb „carrerai“. Nächster deutschsprachiger Markt-Nachbar mit Live-Audio-Übung und Feedback nach dem Gespräch. Unser Markt: Wien / Zinshaus / de-AT.

---

## Phase 1 — A Auftragsverständnis

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung: Reinhard sieht, was Careertrainer öffentlich verkauft und wie wir davon stehlen dürfen, ohne Gate-A-Invarianten oder de-AT-Transfer zu verraten.
- betroffene Komponente: Entscheidungsakte, nicht App-Code. Vergleichsflächen: `/`, `/sitzung/[id]`, `/coach`, `/auswertung`, `lib/coach-canon.ts`.
- Nicht Ziele: Produktcode; Rubrik im Role Player; Avatar-Kern; 1:1 Klon; Arbeitgeber-Leaderboard; 70/30 als unsere Note; Rechtszusage.
- Annahmen: Login-App bleibt UNBEKANNT; öffentliche Website + Screenshots + ein Demo-Video reichen für Steal; TALKMEISTER nur Kontext.
- Unbekannt: echte In-App-FSM, Barge-in-Verhalten, ob Manager Transkripte doch sehen, ob 70/30 in der App eine oder zwei Logiken ist.
- Akzeptanz: ≥20 echte Quellen; Teile A–F; Evidenzstufen; A dann K; FREIGEGEBEN nur für dieses Dossier.
```

---

## Phase 2 — A Impact-Plan

```text
IMPACT_PLAN
- betroffene Dateien: nur diese Entscheidungsdatei.
- Verträge: keine. Role Player bleibt rubrikfrei. Examiner bleibt nach Auflegen.
- abhängige Rollen: A03 (Call-UI-Copy), A08 (Feedback-Form), später A11 (Hosting-Story), A13 (kein MBTI-Klon).
- Wiederverwendung: EvaluationView hat bereits Stärke + Zitat + Schlüsselmoment + nächster Satz. Coach-Situationen in lib/coach-canon.ts.
- kleinster Umfang: Dossier, kein Patch.
- Zieltests: Quellenstichprobe, Widerspruchsliste, Abbruchkriterium.
- Qualitätswirkung: klarer Steal/Avoid für `/` und Coach-Karten.
- Kostenwirkung: keine Laufzeitkosten; verhindert Scope-Kriech in 4 Verticals / Radar-Scores.
```

Gelesen, nicht Vollscan: Change Card `CHG-20260919-010.md`, `lib/coach-canon.ts`, `app/page.tsx`, `components/training/ConversationView.tsx`, `lib/live-status.ts`, `components/training/EvaluationView.tsx`, `lib/verticals.ts` (immobilien / de-AT).

---

## Phase 3 — A Fachentwurf

### Abbruchprüfung

Nicht abgebrochen. Öffentlich vorhanden sind eigene Lösungsseiten (Telefonvertrieb, Vertrieb, Führung, Verhandlung, Kundenservice) **und** ein dokumentiertes Feedback-Modell (Dual-AI, 70/30, Zitatbelege, Skala 0–10). `VERIFIZIERT`

### Firma, Sitz, Hosting — ohne Rechtsgarantie

| Behauptung | Quelle | Evidenz |
|---|---|---|
| Inhaber Jannik Lindner, Dr.-Julius-Hahn-Straße 30C, 2500 Baden, Österreich, UID ATU82825025 | [Impressum](https://careertrainer.ai/impressum/) | `VERIFIZIERT` |
| Datenschutz-Verantwortliche dieselbe AT-Adresse | [Datenschutz](https://careertrainer.ai/datenschutz/) | `VERIFIZIERT` |
| Homepage-FAQ: „Als deutsches Unternehmen erfüllen wir alle DSGVO-Anforderungen.“ | [Home FAQ](https://careertrainer.ai/) | `VERIFIZIERT` als **Werbetext**, widerspricht Impressum |
| LinkedIn-Profil: Mitgründer, Apr 2025, Augsburg / 1–10 Personen | [linkedin.com/in/janniklindner](https://www.linkedin.com/in/janniklindner) | `PLAUSIBEL` (Profil öffentlich, Firma klein) |
| App-Login getrennt: `app.careertrainer.ai` | [robots.txt](https://careertrainer.ai/robots.txt), Browser 2026-09-19 | `VERIFIZIERT` Loginwand; App-Inneres `UNBEKANNT` |
| Hosting-Claim Marketing: „Server in Deutschland“ | Home, Pricing, Fast jede Seite | `VERIFIZIERT` als Claim |
| Hosting-Detail EN-GDPR: Hetzner Frankfurt, Backups AWS S3 Frankfurt | [EN GDPR](https://careertrainer.ai/en/gdpr/) | `VERIFIZIERT` als **Selbstauskunft** |
| Widerspruch: EN Company-Seite nennt Hetzner Nürnberg | [EN for companies](https://careertrainer.ai/en/for/company/) | `VERIFIZIERT` Widerspruch Frankfurt vs. Nürnberg |
| Auftragsverarbeiter inkl. OpenAI USA, OpenRouter USA, Maileroo Australia, LiveKit, Stripe; SCC für Drittland | [EN GDPR](https://careertrainer.ai/en/gdpr/) | `VERIFIZIERT` als Liste; **keine** Rechtsgarantie |
| Audio: Echtzeitstream, keine dauerhafte Aufnahme (Egress disabled) | EN GDPR FAQ | `PLAUSIBEL` (Selbstauskunft, nicht auditiert) |
| „Kein Training auf Kundendaten / Gesprächsinhalten“ | Home, Pricing, DSGVO-Funktion | `PLAUSIBEL` als Produktversprechen |
| Produktversion 2.12.0 (7.9.2026), Grounding 13.8.2026 | [EN facts](https://careertrainer.ai/en/facts/), [Changelog](https://careertrainer.ai/en/changelog) | `VERIFIZIERT` als Selbstauskunft |

**A02-Regel:** „Server DE“ ist ein Vertrauenssignal, kein Nachweis. Drittland-Modelle (OpenAI/OpenRouter) und Maileroo AU stehen auf derselben GDPR-Seite. Wir kopieren den Satz nicht. A11 entscheidet unsere eigene Story.

---

## A — Produktaufbau

### Trainingsbereiche

Vier öffentlich gleichberechtigte Bereiche, auf jeder Marketingseite als Radios `LEADERSHIP / SALES / NEGOTIATION / CUSTOMER_SERVICE`:

1. **Führung** — Kritik, Feedback, Konflikt, Trennung, Delegation, Rückkehr, Jahresgespräch. [Führung](https://careertrainer.ai/fuehrung/) `VERIFIZIERT`
2. **Vertrieb** — Kaltakquise, Gatekeeper, Discovery, Nutzen, Einwand, Closing, Buying Center, B2C/POS. [Vertrieb](https://careertrainer.ai/vertrieb/) `VERIFIZIERT`
3. **Verhandlung** — sell-side und buy-side: Preis, Konditionen, Liefertermin, Rahmenvertrag, Gehalt. [Verhandlung](https://careertrainer.ai/verhandlung/) `VERIFIZIERT`
4. **Kundenservice** — Beschwerde, Eskalation, Reklamation, Kündigung abwenden, Absage erklären. Seit Aug/Q3 2026 eigener Track; Inbound startet beim Übenden. [Kundenservice](https://careertrainer.ai/kundenservice/), [EN facts](https://careertrainer.ai/en/facts/) `VERIFIZIERT` als Claim

Zusatz: Produktschulung (PDF → Briefing → 6 Phasenszenarien), White-Label, Lernpfade, Pflichtprogramme. [Produktschulung](https://careertrainer.ai/loesungen/produktschulung-mit-ki/) `VERIFIZIERT` als Marketing

**Nicht im ersten Vertical Slice bei uns:** Führungskräfte-Bibliothek, Einkaufsverhandlung, White-Label, Pflicht-Lernpfade, vier gleichgewichtige Homepage-Radios.

### Live-Audio vs. Text

- Primär: gesprochenes Live-Rollenspiel, **kein Video**, keine Emotionserkennung, keine Biometrie. [EN facts](https://careertrainer.ai/en/facts/) `VERIFIZIERT` als Claim
- Tabellen auf /vertrieb/ und /fuehrung/: „Audio, kein Video, kein Text-Chat“ für die Übung selbst. `VERIFIZIERT`
- Daneben **KI-Coach als Text-Chat** vor/nach dem Gespräch, eigenes Kontingent. [KI-Coach](https://careertrainer.ai/funktionen/ki-coach/) `VERIFIZIERT`
- Grounding-Seite nennt Interaction modes „Live voice (primary), text“. `VERIFIZIERT` — leichte Spannung zur Tabellenzeile „kein Text-Chat“
- Screenshot-Alt: Call-UI mit „Transkript-Button“ — Transkript während des Calls **optional**, nicht Kern. [EN Role-Play](https://careertrainer.ai/en/features/ai-role-play/) `PLAUSIBEL`

**Steal:** Audio ist die Übung; Text ist Vorbereitung/Nachbereitung (`/coach`), nicht der Call.  
**Avoid:** Video-Avatar. „Customer avatars“ im Changelog sind **wiederverwendbare Charakterprofile**, keine Gesichts-Avatare. [Changelog](https://careertrainer.ai/en/changelog) `VERIFIZIERT` Wortlaut; Kern bleibt Audio.

### Team-Übersicht vs. Transkript nur für Übenden

Marketing-Kernsatz: Trainings- nicht Kontrollinstrument; Transkripte standardmäßig nur für den Übenden; Manager/HR sehen Aggregate (Scores, Frequenz, Skill-Gaps). Home, Pricing, Evaluierung. `VERIFIZIERT` als Claim

Widerspruch: Changelog 2.9-Linie verspricht „team transcript insights“ für Manager. [Changelog](https://careertrainer.ai/en/changelog) `VERIFIZIERT` Wortlaut. Ob Opt-in, Aggregat oder Bruch der Privacy-Story ist `UNBEKANNT`.

Teilen von Auswertungen „geht vom Lernenden aus“. [Evaluierung](https://careertrainer.ai/funktionen/ki-gespraechsevaluierung/) `VERIFIZIERT` als Claim

**Steal:** Team sieht Fortschritt, nicht den Wortlaut.  
**Avoid:** Arbeitgeber-Leaderboard, personenscharfe Noten für HR. Gate A hat kein Team — diese Story nicht vorbauen.

### Was eine Übung ist

| Maß | Öffentliche Angabe | Spannung |
|---|---|---|
| Typische Dauer | 5–15 Min. (Evaluierung-FAQ, Academy, Telefonvertrieb-FAQ) | `VERIFIZIERT` |
| Tabellen Führung/Vertrieb | 5–20 Min. | `VERIFIZIERT` |
| Homepage-How-it-works | 10–25 Min.; Pricing FAQ: ein Gespräch = Rollenspiel + Auswertung, „üblicherweise zehn bis fünfundzwanzig Minuten“ | `VERIFIZIERT` |
| CTA | „Zehn Minuten, ein Gespräch“ / „fünf Minuten Zeit“ | `VERIFIZIERT` Marketing |
| Repeat | Unbegrenzt im Paid; Free 3/Monat; abgebrochene zählen nicht | `VERIFIZIERT` |
| Hard-cap Infrastruktur | 3600 s | [EN GDPR](https://careertrainer.ai/en/gdpr/) `VERIFIZIERT` Selbstauskunft |
| Start | Browser/mobil, Mic, Audio-Preflight + Bestätigung (Changelog) | `PLAUSIBEL` |
| Richtung | Outbound-ähnlich; Service inbound startet beim User | `PLAUSIBEL` |

**Steal für uns:** Eine Übung = ein Anruf + Examiner danach + dieselbe Stelle nochmal. Länge an Gate A halten (glaubwürdige ~5 Min.), nicht 10–25 als Versprechen.  
**Avoid:** Kontingent-Theater und „unbegrenzt“ als Qualitätssignal.

### Preise (Kontext, kein Bau)

Free 3 Gespräche/Monat; Einzel ab 14,99 €; Team-Konfigurator 29,99 €/Platz (Beispiel 6 × 29,99 = 179,94 €); ab 13 Personen Angebot; White-Label ohne Listenpreis. [Preise](https://careertrainer.ai/pricing/) `VERIFIZIERT` am 2026-09-19

---

## B — Szenario- und Rollenaufbau

### Wie die Gegenseite beschrieben wird

Öffentliche Karten (Home, Impressum-Footer, Lösungsseiten) folgen einem festen Muster:

- Name + Rolle + emotionale Lage („zurückhaltender Mitarbeiter“, „skeptischer Ansprechpartner“, „aufgebrachte Kundin seit 9 Jahren“)
- Eine gesprochene Linie der Figur
- „Deine Aufgabe“ als beobachtbares Ziel, nicht als Skript
- Mini-Score und ein Satz Sofort-Feedback

Beispiele nur als Kurzzitat:

> „Ich würde das nicht überbewerten. Meine Aufgaben liegen im Plan.“ — [Home/Impressum-Footer](https://careertrainer.ai/impressum/)

Charakter-Engine öffentlich: Persönlichkeitsprofile inkl. **MBTI**, verdeckte Motive, CORE_TRUTH, proportionale Reaktionen, Kaufmotiv + Skepsisgrad, Buying Center mit mehreren Entscheidern. [Generator](https://careertrainer.ai/funktionen/rollenspiele-erstellen/), [Vertrieb](https://careertrainer.ai/vertrieb/), [EN facts](https://careertrainer.ai/en/facts/) `VERIFIZIERT` als Marketing

**Avoid MBTI** als unser Modell. A13 besitzt Motive/Affect/Hangup; MBTI ist Scheinpsychologie und US-HR-Ton.

### Skript oder frei

Wiederholter Claim: „kein Skript“, Gegenseite reagiert auf Ton, Druck, Einwand; gibt Informationen nur bei richtigen Fragen/Vertrauen; in Verhandlung nur bei Hebel/Gegenvorschlag/Vertrag. Home How-it-works, EN facts. `PLAUSIBEL`

Generator-Input: Situation, Ziel, Gegenüber, Produkt-/Firmenkontext, typische Widerstände → Persona + Lernziele + Evaluation Goals / Milestones / Anti-Patterns. [Generator](https://careertrainer.ai/funktionen/rollenspiele-erstellen/) `VERIFIZIERT` als Claim. Ob die Rubrik den Role Player erreicht, ist `UNBEKANNT` — bei uns **verboten**.

### Produktkontext

Upload PDF/One-Pager/Pitch → Briefing (USPs, Wettbewerber, Einwände) → sechs Phasenszenarien. [Produktschulung](https://careertrainer.ai/loesungen/produktschulung-mit-ki/) `VERIFIZIERT`

**Gate A:** kein PDF-Studio. `/autor` bleibt menschlich geschrieben. Späterer Steal: ein Objekt-Briefing, nicht sechs Auto-Szenarien.

### Mapping Zinshaus-Eigentümer vs. deren „KI-Kunde“

| Careertrainer „KI-Kunde“ | Unser de-AT-Gegenüber | Transfer |
|---|---|---|
| Skeptische CFO / Software-Buyer | Elisabeth Leitner, Zinshaus Wien | Nicht CFO-ROI. Öffentliche Objektlage, Verkauf unklar, Anlass prüfen. |
| Buying Center (Einkauf, Fachbereich, Entscheider) | Miteigentum, Familie, Vollmacht, Beirat | „Wer zustimmt“ ist erbrechtlich/eigentumsrechtlich, kein MEDDIC. |
| Gatekeeper Innendienst | Partner nicht am Apparat, Hausverwaltung | Gleiche Mechanik, anderer Ton (Sie, nicht SDR-Hook). |
| Einwand „zu teuer“ / „schon versorgt“ | „Ich verkaufe nicht“, Betriebskosten, Pflicht der Verwaltung | Einwand halten, nicht reframen bis zum Close. |
| Preisverteidigung / Marge | Honorar, Prämie, Rate — Leistung vor Zahl | Abschlussreife ≠ Terminquote. |
| Aufgebrachte Bestandskundin | Service, Schaden, Beschwerde | Deeskalation ohne Kulanzkauf. |
| Lieferant ohne Entscheidungsbefugnis | Professionist / Beirat unter Frist | Hebel = Vertrag/Beschluss, nicht SLA-Drohung im US-Ton. |

**Produktannahme (falsifizierbar):** Ein Wiener Makler bewertet Careertrainer-Karten als „deutsch, aber nicht unseres Alltags“, sobald CFO, MRR, Churn oder Discovery-Call im Text stehen. Test: 5 Zielnutzer, gleiche Karte AT vs. DE-SaaS. `HYPOTHESE`

---

## C — Website-IA deutsch

### Typo, Dichte, Vertrauen

- **Anrede du** durchgängig; EN parallel unter `/en/`. Unser Kern ist **Sie / de-AT**. `VERIFIZIERT`
- Hero: eine Behauptung („Übe das schwierige Gespräch, bevor es stattfindet.“) plus vier Bereichs-Radios und vier Charakterkarten mit Mini-Scores. Dicht, aber die Radios zerlegen die eine Handlung. Browser 2026-09-19, [Home](https://careertrainer.ai/) `VERIFIZIERT`
- Nav: Produkt / Zielgruppen / Unternehmen / Preise / Demo buchen / Jetzt starten. Sekundär: Akademie (Ratgeber), Funktionen, Lösungen, Demo-Formular. `VERIFIZIERT`
- Proof: erfundene Gesprächsmomente mit Score (4.1–8.4), nicht Kundenlogos oder Case-Zahlen. `VERIFIZIERT` — das ist **illustrativ**, die Evaluierungsseite sagt das selbst.
- Trust-Leiste wiederholt: Browser + mobil, DSGVO, Server DE, kein Modelltraining auf Inhalten, Transkript nur für Übenden. `VERIFIZIERT` als Muster
- CTA-Paar: „Kostenlos testen“ (Self-Serve) vs. „Demo buchen“ (Team/Enterprise). Pricing trennt ≤12 Selbstbedienung / ≥13 Gespräch. `VERIFIZIERT`
- Blog = Akademie, informationell positioniert. [Akademie](https://careertrainer.ai/akademie/) `VERIFIZIERT`
- EN-Home spiegelt DE, plus „EU AI Act · EU data residency“. [EN Home](https://careertrainer.ai/en/) `VERIFIZIERT`

### 8 Steal-Flächen für unsere `/`

Nicht vier Vertical-Buttons als Chaos. Gate A ist Zinshaus, nicht „Führung/Vertrieb/Verhandlung/Service“.

1. **Eine Handlung.** Hero sagt, was jetzt passiert: sprechen, Gegenseite antwortet, auflegen, dieselbe Stelle. Ein Button auf den Featured-Drill. Keine Radio-Leiste LEADERSHIP/SALES.
2. **Sprache.** Sie, de-AT, Zinshaus-Wörter (Eigentümer, Miteigentum, Betriebskosten, Honorar). Careertrainer-du und SaaS-Denglisch nicht übernehmen.
3. **Gegenseite als Person.** Eine Karte: Name · Lage · eine gesprochene Linie · Ihre Aufgabe. Haben wir in `FROZEN_META` schon — verdichten, nicht vier Branchen-Kacheln dazustellen.
4. **Vertrauen in einem Satz, der wahr ist.** Nicht „Server DE / DSGVO-konform“. Eher: Audio wird nicht als Mitschnitt aufbewahrt; die Note kommt nach dem Auflegen von einem anderen System; Transkript bleibt in dieser Stufe bei Ihnen. Formulierung A11.
5. **Zeit, die wir halten.** „Ein Anruf. Eine Sache.“ statt 10–25-Minuten-Versprechen. Gate A ist ~5 Min. glaubwürdig.
6. **Proof als ein Moment.** Ein Zitat + ein Fix-Satz, wie deren Footer-Karten. Kein Radar, keine 0–10-Galerie auf `/`.
7. **Start ohne Demo-Termin.** Self-Serve-Übung ist ihr stärkstes B2C-Signal. Bei uns: Katalog → Sitzung, kein Calendly vor dem ersten Anruf.
8. **Team später, privat jetzt.** Satz „niemand hört zu“ trägt für Solo-Übung. Team-Dashboard nicht andeuten, solange es nicht existiert.

**Avoid auf `/`:** vier Verticals (immobilien/versicherung/hausverwaltung/finanzierung) als gleichwertige Buttons; US-SDR-Hooks; Kundenlogos, die wir nicht haben; „deutsches Unternehmen“.

---

## D — Übungs-UI (A03-Stichprobe)

Login-App `UNBEKANNT`. Öffentlich: Marketing-Mocks, Screenshot-Alts, Changelog, Telefonvertrieb-Mock „04:46 · Mikrofon aktiv“.

### Was sie während des Calls zeigen (`PLAUSIBEL` aus Mocks/Alts)

- Bereich + Kanal + Laufzeit: `Live Vertrieb · Telefon · 04:12` bzw. Face-to-face in der Academy
- Name/Rolle der Gegenseite
- Eine aktuelle Linie
- Statuszeile **„Du sprichst · KI hört zu“**
- Mikrofon aktiv
- Transkript als **Button**, nicht als Chatwand
- Nach dem Call: Score + Kompetenzen + Zitat + Repeat

Academy: Start → 5–15 Min. Audio, phone **oder** face-to-face. [EN Academy](https://careertrainer.ai/en/academy/careertrainer-ai-roleplay-training/) `VERIFIZIERT`  
Changelog: Audio-Preflight, finale Bestätigung, Recovery nach Unterbrechung, Service inbound. `PLAUSIBEL`  
Barge-in-FSM, Auflege-UX, ob die Figur von sich aus auflegt: `UNBEKANNT`

### Drei öffentliche Zustände vs. `ConversationView`

| Careertrainer öffentlich | Unsere Live-Phasen (`ConversationView` / `callStatusLine`) | Steal / Avoid |
|---|---|---|
| Vor dem Call: Szenario, Mic-Preflight | `idle` + MicPrompt | Steal: eine Bestätigung „Leitung öffnen“, nicht Wizard |
| Während: „Du sprichst · KI hört zu“ | `listening` „Leitung offen.“ / `speaking` „X spricht.“ / `thinking` „Die Leitung ist noch da.“ | Steal: **eine** Hörer-Zeile. Avoid: drei Fachwörter idle/listening/thinking im UI |
| Danach: Score + Repeat | Auflegen → Hangup-Beat → `/auswertung` | Steal: Examiner **nach** Auflegen. Avoid: Live-Score während des Gesprächs |

Wir haben **mehr** Zustände (connecting, failed, interruptFlash, hangupBeat, typedOnly). Das ist richtig für Gate A (Barge-in, Auflegen). Careertrainer verkauft dem Nutzer drei erlebte Momente. A03: interne FSM behalten, sichtbare Copy auf drei Momente drücken.

**Während des Calls zeigen sie weniger Text als wir.** Unser Transkript-Stream im Call erhöht kognitive Last. Hypothese: Transkript erst nach Auflegen oder hinter einem Schalter. `HYPOTHESE` — A03 testet, kein Patch hier.

**Avoid:** Face-to-face-Modus und sichtbarer Avatar. Audio first.

---

## E — Feedback / Coach (A08-Stichprobe)

### Was sie behaupten

Dual-AI: eine KI spielt, eine zweite bewertet nach dem Gespräch. Skala 0–10, nur Trainee-Formulierungen, KI-Einstieg zählt nicht gegen den Übenden. [Evaluierung](https://careertrainer.ai/funktionen/ki-gespraechsevaluierung/) `VERIFIZIERT`

**70/30 ist auf derselben Site zwei Dinge:**

1. **Scoring-Mix:** 70 % Szenarioziele, 30 % Kernkompetenzen. Evaluierung, Vertrieb-Tabelle, EN facts, Telefonvertrieb. `VERIFIZIERT`
2. **Feedback-Stil:** „70 Prozent zeigen, was bereits wirkt, 30 Prozent markieren den wichtigsten nächsten Entwicklungsschritt.“ [Vertriebstraining](https://careertrainer.ai/loesungen/vertriebstraining/) `VERIFIZIERT` als zweiter Wortlaut

Kompetenzen je Bereich (Beispiele): Führung Zuhören/Empathie/Klarheit; Vertrieb Bedarf/Einwand/Abschluss; Verhandlung Wert/Gegendruck/Struktur. `VERIFIZIERT` Marketing  
Zitatpflicht je Teilbewertung; Profi-Tipp als Beispielsatz; Repeat derselben Situation. `VERIFIZIERT` als Claim  
Deterministisches Zusammenbauen aus Goals/Milestones/Anti-Patterns. [EN facts](https://careertrainer.ai/en/facts/) `PLAUSIBEL`

KI-Coach: Text, modus-spezifisch, mündet in Voice-Szenario; eigene Quota. [KI-Coach](https://careertrainer.ai/funktionen/ki-coach/) `VERIFIZIERT`

### STEAL

Eine **Stärke** + **eine Fix** + **Anker im Transkript**. Genau das hat `EvaluationView` schon: „Was gelungen ist“ mit Zitat, Schlüsselmoment mit Zitat, „Nächstes Mal so“ plus Beispielsatz hinter details. A08 soll den **70/30-Stil** als kognitive Last-Regel nehmen (viel Anerkennung, ein Hebel), nicht als Formel in der Note.

Footer-Karten sind die beste öffentliche Form: ein Satz Lage, ein Zitat, ein Score, ein Coach-Satz. Steal für `/auswertung`- verdichten, nicht für Live-Overlay.

### AVOID

- **70/30 Style/Knowledge als unsere Note.** Szenarioziel vs. Kompetenz zu 70/30 zu mischen erzeugt Scheinpräzision und vermischt Gesprächsergebnis mit Trainingsleistung — A02-Pflichtwissen. Ein Termin/Close ist kein Beweis.
- Kompetenz-Radar und Verlauf 4.2 → 7.9 auf der Startseite.
- Arbeitgeber-Leaderboard / personenscharfe Team-Noten.
- Rubrik, Goals, Anti-Patterns im Role Player.
- US-SDR-Chips (Discovery, MEDDIC, Hook, Quota) auf `/coach`.
- „70 % positiv“ als Wohlfühlquote ohne Anker.

### Trennung Gespräch / Training / Gefühl / Geschäft

| Schicht | Careertrainer mischt oft | Unsere Gate-A-Regel |
|---|---|---|
| Gesprächsergebnis | Szenarioziele 70 % | Lage geklärt / aufgelegt / nächster Schritt — nicht Close |
| Trainingsleistung | Kompetenzen 30 % | Ein Fokus, `not_assessable` erlaubt |
| Nutzergefühl | „Hemmschwelle weg, keiner schaut zu“ | Wahr für Solo; nicht als Qualität der Figur |
| Geschäftswert | Pipeline, Ramp-up, Terminrate | Nicht Gate A; später, getrennt gemessen |

---

## F — 12 Coach-Karten-Typen (Deutsch, DACH, unsere Situationen)

Für `/coach` + `lib/coach-canon.ts`. Ton: Sie, Wien, Eigentümer — nicht US-SDR. Jede Karte ist ein **Typ**, keine Careertrainer-Kopie.

| # | Typ | Situation | Nutzerproblem | Karte (Chip-Titel) | Coach führt zu | Nicht Ziel |
|---|---|---|---|---|---|---|
| 1 | Zulässigkeit | vorbereitung | Anruf ohne Anlass | 90 Sekunden vor dem Wählen | Ein Anlass, ein Ziel, ein Abbruch | Skript auswendig |
| 2 | Erlaubnis-Einstieg | erstkontakt | Sofort Pitch | Wer, weshalb, Sie dürfen Nein sagen | Erlaubnis, dann Lage | Hook/Opener-Bibliothek |
| 3 | Lage statt Leistung | erstkontakt | Produkt vor Bedarf | Erst die Lage, nicht das Haus | Drei prüfbare Fragen | Feature-Pitch |
| 4 | Einwand halten | einwand | Gegenpredigt | „Ich verkaufe nicht“ stehen lassen | Verstehen, nicht umdrehen | Reframe bis Close |
| 5 | Wer mitredet | entscheidung | Auftrag von einer Person | Miteigentum ist kein Mandat | Wer zustimmen muss | Stakeholder-Verhör im ersten Satz |
| 6 | Nachfassen am Punkt | nachfassen | „Nur mal hören“ | Am vereinbarten Punkt, ohne Druck | Ein Anlass, ein Ausstieg | Fake-Dringlichkeit |
| 7 | Öffnen oder lassen | reaktivierung | Mandat verloren | Reaktivieren nur mit Erlaubnis | Ruhen lassen ist erlaubt | Rückgewinnungs-Script |
| 8 | Leistung vor Zahl | konditionen | Honorar zuerst nachgeben | Preis erst nach dem Umfang | Eine Zahl, eine Grenze | Rabattreflex |
| 9 | Reife prüfen | abschluss | Abschlussdruck | Ist die Stelle reif — oder nur still | Nächster angemessener Schritt | Termin um jeden Preis |
| 10 | Berechtigtes Nein | absage | Hartnäckigkeit als Erfolg | Klare Absage beenden | Respektvoll auflegen | Hidden Close |
| 11 | Frist und Ruhe | service | Kulanz kaufen | Schaden, Frist, nichts zusagen | Deeskalation ohne Geschenk | NPS-Floskel |
| 12 | Dieselbe Stelle | alle, nach Call | Neues Szenario statt Transfer | Den einen Satz nochmal | Repeat ab Schlüsselmoment | Neue Figur als Ablenkung |

Karten 1–11 mappen 1:1 auf `COACH_SITUATIONS`. Karte 12 ist der Transfer-Typ, den Careertrainer als „Durchlauf 4 starten“ verkauft und den unser Hero schon nennt.

Abbruchkriterium je Karte: kein Rechtsrat, keine Rubrik an den Role Player, kein zweiter Lernfokus.

---

## de-AT Transfer (explizit)

Careertrainer ist **DACH-plattform, du, DE-Hosting-Story, AT-Impressum, Augsburg-LinkedIn**. Wir sind **AT-first, Sie, ein Vertical**.

| Fläche | Careertrainer DE | Unser AT-Zinshaus | Entscheidung |
|---|---|---|---|
| Markt | 4 Gesprächsfelder, B2B+B2C+White-Label | Ein Anruf beim Eigentümer | Nicht deren Breite |
| Anrede | du | Sie | Behalten |
| Gegenseite | KI-Kunde / Mitarbeiter / Lieferant | Eigentümerin, Miteigentum, Verwaltung | Mapping oben |
| Erfolg | Score 0–10, Skill-Kurve | Glaubwürdigkeit, Auflegen, ein Fix | Keine Score-Galerie auf `/` |
| Dialekt | „Standarddeutsch ja, starke Dialekte nein“ | de-AT, Wiener Register, Fachwörter | A14/A06; nicht deren Limitation kopieren |
| Privacy-Satz | Server DE | Keine ungeprüfte Kopie | A11 |
| Coach | Führung/Vertrieb/Verhandlung-Modi | 10 Lagen + Repeat | F-Karten |

**Funktion im Vertical Slice:** Steal von Website-Ruhe, Charakterkarte, 1+1-Feedback, Transkript-Privatheit, Audio-first.  
**Ausgeschlossen:** vier Radios, MBTI, Radar, Team-Kontrollsicht, PDF-Generator, Face-to-face-Video, 70/30-Note, White-Label.

---

## Videos, PDFs, App, DACH-Kontext

### Video

Öffentlich auf [Produkt-Demo](https://careertrainer.ai/produkt-demo/): Button „2-Minuten-Einblick: So läuft ein KI-Rollenspiel ab“ → YouTube-Embed `https://www.youtube.com/watch?v=qyogqBR4dNo` `VERIFIZIERT` 2026-09-19

Inhalt laut Transkript: **kein Übungs-UI**, sondern Erwartungsmanagement für die gebuchte Demo (kein Pitch, Plattform zeigen, optional live spielen, Termin buchen). Kapitelmarken: `UNBEKANNT`. Reihenfolge aus Transkript, Zeiten grob:

- Beginn: „Wie läuft eine Demo bei Career Trainer AI ab?“
- Mitte: Use Cases Vertrieb vs. PE/Führung; Fit/nicht-Fit ehrlich sagen
- Ende: Plattform zeigen, Fragen vorab, Termin

Separater YouTube-Kanal / LinkedIn-Product-Posts: Company-Page loginwandig; Suche nach Product-Walkthrough ohne Treffer. `UNBEKANNT` weitere Videos.

### PDF / One-Pager

Kein öffentliches Firmen-PDF gefunden. PDFs sind **Upload in die App** (Produktschulung), nicht Download. `UNBEKANNT` als Collateral; `VERIFIZIERT` als In-App-Input-Claim

### App

`https://app.careertrainer.ai/` = Anmelden (E-Mail, Passwort, Link Registrieren, Sprache Deutsch). Inneres `UNBEKANNT`. robots.txt sperrt `/dashboard/`, `/account/`, `/signin`.

Öffentliche App-Bilder: Screenshot-Alts auf Evaluierung und Role-Play (Dashboard Radar, Generator-Form, Call mit Transkript-Button, private Szenario-Karten). `PLAUSIBEL`

### DACH-Vergleich (nur Kontext)

- [TALKMEISTER-Vergleich 2026](https://talkmeister.de/wissen/ki-tools-vertriebstraining-vergleich.html): listet TALKMEISTER, Hyperbound, Second Nature, Yoodli, ChatGPT — **Careertrainer fehlt**. Kontext, nicht Auftrag.
- [Sleak Vergleich](https://sleak.ai/de/compare/gespraechssimulation-software): nennt Careertrainer für kleinere DACH-Teams, Hyperbound für Outbound, Gong nicht als Roleplay. Competitor-page, Bias `PLAUSIBEL`

---

## Quellen (≥20, Tiefe statt Fake)

1. [careertrainer.ai](https://careertrainer.ai/) — Home, Hero, Radios, How-it-works, FAQ inkl. „deutsches Unternehmen“
2. [careertrainer.ai/en/](https://careertrainer.ai/en/) — EN-Home, Trust, Team-Satz
3. [loesungen/telefonvertrieb-training](https://careertrainer.ai/loesungen/telefonvertrieb-training/) — Hörer, Mic-Mock, Kaltakquise
4. [loesungen/vertriebstraining](https://careertrainer.ai/loesungen/vertriebstraining/) — 70/30-Stil **und** 70/30-Scoring auf einer Seite
5. [vertrieb](https://careertrainer.ai/vertrieb/) — Tabelle 5–20 Min., Buying Center, 70/30 Scoring
6. [fuehrung](https://careertrainer.ai/fuehrung/) — Führungstabelle, Nicht-Ziele (kein Avatar, keine Prosodie-Note)
7. [verhandlung](https://careertrainer.ai/verhandlung/) — buy/sell, Hebel statt Bitte
8. [kundenservice](https://careertrainer.ai/kundenservice/) — Q3-2026-Modul, Inbound, 5–15 Min.
9. [funktionen/ki-gespraechsevaluierung](https://careertrainer.ai/funktionen/ki-gespraechsevaluierung/) — Dual-AI, 70/30-Ziele, Zitate, Screenshots
10. [funktionen/ki-rollenspiele](https://careertrainer.ai/funktionen/ki-rollenspiele/) — Call-Screenshot-Alts, 5–15 Min.
11. [funktionen/rollenspiele-erstellen](https://careertrainer.ai/funktionen/rollenspiele-erstellen/) — Generator, MBTI, CORE_TRUTH, Anti-Patterns
12. [funktionen/ki-coach](https://careertrainer.ai/funktionen/ki-coach/) — Textcoach, eigene Quota
13. [funktionen/datenschutz-dsgvo](https://careertrainer.ai/funktionen/datenschutz-dsgvo/) — kein Audio-Archiv, kein Modelltraining
14. [en/gdpr](https://careertrainer.ai/en/gdpr/) — Hetzner, LiveKit, OpenAI, OpenRouter, Maileroo, Hard-cap
15. [impressum](https://careertrainer.ai/impressum/) — Baden AT, UID
16. [datenschutz](https://careertrainer.ai/datenschutz/) — Verantwortliche Stelle AT
17. [pricing](https://careertrainer.ai/pricing/) — Free/Basic/Team, was ein Gespräch zählt
18. [en/facts](https://careertrainer.ai/en/facts/) — Grounding, Dual-AI, 70/30, v2.12.0
19. [en/changelog](https://careertrainer.ai/en/changelog) — Avatare-als-Profile, Preflight, team transcript insights
20. [en/academy/…roleplay-training](https://careertrainer.ai/en/academy/careertrainer-ai-roleplay-training/) — Walkthrough-Text 5–15, phone/f2f
21. [akademie](https://careertrainer.ai/akademie/) — Ratgeber-Index
22. [produkt-demo](https://careertrainer.ai/produkt-demo/) + [YouTube qyogqBR4dNo](https://www.youtube.com/watch?v=qyogqBR4dNo)
23. [app.careertrainer.ai](https://app.careertrainer.ai/) — Loginwand
24. [robots.txt](https://careertrainer.ai/robots.txt)
25. [ueber](https://careertrainer.ai/ueber/)
26. [zielgruppe/teamleiter](https://careertrainer.ai/zielgruppe/teamleiter/) — Browser+Mic, „Live-Beispiel App“
27. [loesungen/produktschulung-mit-ki](https://careertrainer.ai/loesungen/produktschulung-mit-ki/)
28. [en/features/ai-role-play](https://careertrainer.ai/en/features/ai-role-play/) — Screenshot-Alts, Dialektgrenze
29. [linkedin.com/in/janniklindner](https://www.linkedin.com/in/janniklindner)
30. [talkmeister.de/…vergleich](https://talkmeister.de/wissen/ki-tools-vertriebstraining-vergleich.html) — Kontext
31. [sleak.ai/…gespraechssimulation](https://sleak.ai/de/compare/gespraechssimulation-software) — Kontext
32. [en/for/company](https://careertrainer.ai/en/for/company/) — Hetzner-Nürnberg-Widerspruch

Sitemap DE/EN: HTTP 500 am 2026-09-19. `VERIFIZIERT` Ausfall; kein vollständiger URL-Index.

---

## Offene Hypothesen (A)

H1: Transkript im Call als Schalter senkt Last ohne Lernverlust. Falsifikation: 5 Anrufe mit/ohne Live-Transkript, gleiche Repeat-Quote.  
H2: 70/30 in der App ist nur Scoring, der Stil-Satz ist Marketing. Falsifikation: ein bezahlter Testdurchlauf (nicht dieser Auftrag).  
H3: „team transcript insights“ bricht die Privacy-Story. Falsifikation: App-Admin oder A11-Nachfrage.  
H4: Careertrainer-Karten ohne AT-Umbau senken Wiederholungswunsch Wiener Makler. Falsifikation: siehe Mapping-Test.

Kein Produktcode in diesem Chat.

---

## Phase 4 — K02 Gegenprüfung

```text
GEGENPRÜFUNG
Prüfumfang: Dossier CHG-20260919-010-careertrainer.md gegen Pflichtteile A–F, ≥20 Quellen, Evidenzstufen, Abbruchkriterium, Gate-A-Invarianten, de-AT-Transfer, Urheberrecht (Kurzzitat), Stichproben A03/A08. Kein App-Login, kein Code.
Durchgeführte Angriffe:
- Abbruchkriterium gegen Seitenbestand (Lösungsseiten + Feedback-Modell vorhanden).
- 70/30-Wortlaute auf /funktionen/ki-gespraechsevaluierung/ und /loesungen/vertriebstraining/ gegeneinander.
- Impressum AT gegen Home-FAQ „deutsches Unternehmen“.
- EN GDPR-Prozessorliste gegen Trust-Leiste „Server DE“.
- Changelog „team transcript insights“ gegen „Transkript nur Übender“.
- YouTube qyogqBR4dNo: Transkript ist Demo-Erwartung, nicht Call-UI.
- ConversationView-Phasen gegen behauptete „3 Zustände“.
- EvaluationView gegen Steal „1 Stärke + 1 Fix + Anker“ (bereits gebaut).
- coach-canon Situationen gegen 12 Kartentypen.
- TALKMEISTER-Seite: Careertrainer nicht gelistet — Dossier behauptet das korrekt.
```

### BEFUNDE

- ID: K02-01
  - Fundstelle: Teil E; Quellen 4 und 9
  - Schweregrad: NOTE
  - verletztes Kriterium: keine Scheinmetrik als eine Logik verkaufen
  - Nachweis: Dieselbe Firma nutzt 70/30 für Scoring-Mix und für Feedback-Stil. A hat beide Wortlaute getrennt. Kein Nachtrag nötig.
  - Korrektur: keine

- ID: K02-02
  - Fundstelle: Firma/Hosting; Quellen 1, 15, 14, 32
  - Schweregrad: MAJOR für etwaiges Copy auf `/`; NOTE im Dossier
  - verletztes Kriterium: keine Rechtsgarantie / keine unbelegte Trust-Kopie
  - Nachweis: Impressum AT; FAQ „deutsches Unternehmen“; GDPR Hetzner Frankfurt + US-Modelle + Maileroo AU; Company-EN Nürnberg. A verbietet die Kopie. Bleibt als Guardrail.
  - Korrektur: keine Dateiänderung; A11 vor jedem Trust-Satz

- ID: K02-03
  - Fundstelle: Teil A Team vs. Changelog Quelle 19
  - Schweregrad: MAJOR als offene Produktfrage Careertrainer; NOTE hier
  - verletztes Kriterium: Privacy-Story ohne Widerspruch
  - Nachweis: Marketing „nur Übender“ vs. Changelog „team transcript insights“. A kennzeichnet UNBEKANNT. Nicht als unser Steal „Manager sieht nie Text“ härter machen als die Quellen.
  - Korrektur: A-Satz in Teil A bleibt; Steal nur „in Gate A kein Team-Feed“

- ID: K02-04
  - Fundstelle: Teil D; Video Quelle 22
  - Schweregrad: MINOR
  - verletztes Kriterium: UI-Evidenz nicht aus Sales-Video erfinden
  - Nachweis: Transkript qyogqBR4dNo enthält kein Mic-UI, kein Status, kein Feedback-Screen. A stützt UI auf Mocks/Alts — korrekt. Zeiten bleiben UNBEKANNT.
  - Korrektur: keine

- ID: K02-05
  - Fundstelle: Teil F Karte 12 vs. 10 `COACH_SITUATIONS`
  - Schweregrad: NOTE
  - verletztes Kriterium: Scope der Coach-Chips
  - Nachweis: 12 Typen, 10 Situationen. Karte 12 ist Repeat, kein elftes Szenario — das ist Absicht und gate-konform.
  - Korrektur: keine

- ID: K02-06
  - Fundstelle: Teil D Transkript-Hypothese
  - Schweregrad: NOTE
  - verletztes Kriterium: keine Codeänderung aus Hypothese
  - Nachweis: A fordert keinen Patch. ConversationView zeigt Turns live — das ist Ist-Stand, nicht Careertrainer-Klon.
  - Korrektur: keine

- ID: K02-07
  - Fundstelle: Quellenliste, Sitemap 500
  - Schweregrad: NOTE
  - verletztes Kriterium: Vollständigkeit öffentlicher URLs
  - Nachweis: sitemap.xml 500. >20 Primärseiten trotzdem gelesen. Kein Fake-30.
  - Korrektur: keine

Kein erfundener Blocker. Kein Wohlfühl-Steal ohne Anker. Kein 70/30 als unsere Note empfohlen. Role Player bleibt rubrikfrei. Examiner nach Auflegen. Audio first.

```text
URTEIL
FREIGEGEBEN
```

Dossier freigegeben. Kein Produktcode. Keine Nacharbeit an der Akte.

---

## Phase 7 — Übergabe

```text
AUFTRAG_ID: CHG-20260919-010-careertrainer
ERGEBNIS: Öffentliches Steal-Dossier Careertrainer.ai gegen Gate A / Zinshaus. Teile A–F, 32 Quellen, A dann K. Abbruch nicht ausgelöst.
GEÄNDERTE_DATEIEN_UND_VERTRÄGE: .cursor/decisions/CHG-20260919-010-careertrainer.md — keine Produktverträge, kein Code.
NACHWEISE_UND_TESTS: Websuche site:careertrainer.ai; Fetch Lösungs-/Legal-/Pricing-/GDPR-/Facts-/Changelog-Seiten; Browser Home, Evaluierung, Rollenspiele, Produkt-Demo (YouTube-Embed), App-Login, Führung; Abgleich ConversationView + EvaluationView + coach-canon.
QUALITÄTSWIRKUNG: Steal-Liste für `/` und Coach-Karten; Avoid gegen Score-Radar, 70/30-Note, 4-Vertical-Chaos, MBTI, Leaderboard.
KOSTENWIRKUNG: keine Runtime; verhindert teuren Scope (White-Label, PDF-Studio, 4 gleichgewichtige Bereiche).
RISIKEN_UND_OFFENE_HYPOTHESEN: Login-App UNBEKANNT; 70/30 doppelt belegt; Privacy vs. team transcript insights; Hosting-Widersprüche; keine Rechtsgarantie.
GEGENPRÜFER_URTEIL: FREIGEGEBEN
NÄCHSTE_ROLLE: A00 sammelt Gong/Hyperbound/Careertrainer. Bei Copy auf `/` oder `/coach`: A03 (UI-Copy) bzw. A08 (Karten), A11 vor Trust-Satz.
KONTEXT_FÜR_NÄCHSTEN_CHAT: Careertrainer = DACH-Audio-Nachbar, AT-Sitz, DE-Hosting-Claim, Dual-AI, 70/30 nicht klonen als Note. Steal: eine Handlung, Personen-Karte, 1 Stärke + 1 Fix + Anker, Transkript privat, Examiner nach Auflegen. Avoid: vier Radios, Avatar-Kern, MBTI, Leaderboard, „Server DE“-Garantie. 12 Karten in Teil F. App hinter app.careertrainer.ai.
```
