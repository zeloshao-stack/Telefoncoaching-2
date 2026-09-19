# Vorgehen: KI-Telefoncoaching

Stand 17.09.2026. Grundlage: `Telefoncoaching_Gesamtwissen_2026-09-17_FINAL.zip` (Ordner `Telefoncoaching/`, 65 Dateien, viele Duplikate). Defaults (Abschnitt 4) von Reinhard Manzl am 2026-09-17 freigegeben; Scaffolding Phasen 1–2 gestartet.

---

## 1. Was das Pack tatsächlich enthält

Kein lauffähiges Produkt. Es ist ein **Wissens- und Bauarchiv** für eine KI-gestützte Trainingsapp, plus Arbeitsanweisungen für ein Agenten-Entwicklerteam.

**Inhaltstypen**

| Typ | Beispiele im Pack |
|---|---|
| Produktkonzept & Recherche | `Telefoncoaching-Konzept-v1.md`, `…-Entwicklungsentscheidung.md`, `…-Research-und-Bauplan.md`, `…-Produktwissen-v1.md` |
| Architektur & Verträge | `…-Fundament-APIs-und-Ausbaustufen.md`, `…_Entwicklungsbaum_v1.md`, Role-Character-Engine v1/v2 |
| Maschinenlesbare Entwürfe | `Telefoncoaching-Testfaelle.json` (6 Wissenskarten, 8 Szenarien `de-AT`, 24 Antwortprüfungen, 6 Robustheits-, 6 Audiotests — Status: *development fixture, nicht validiert*) |
| Rollenhandbücher fürs Bauen | `00`–`14`, Teamhandbuch, nested ZIPs Chatstarter / Handbücher v3+v4 / Ausbildungsrunde 1 |
| Ursprungsmaterial | identische `Gesprächsbaum.docx` / `1.2` (Keyword-Baum für Gemini), 4× gleicher Verhandlungsberater-Prompt, Fall Hörnesgasse, Hyperbound-Transkript |
| Labs, kein Produkt | Python/SQLite-Mandantenlabor, HTML-Textdialog ohne Modell/Audio; 0 echte Browser- oder Sprachläufe |
| Nicht dazugehörig | Screenshot einer **anderen** Wiener-Adress-/Neubau-App |

**Struktur:** ein flacher Ordner, Versionen durcheinander (kurze `(2)`-Chatstarter neben vollen Handbüchern, v3 und v4 parallel). Die nested ZIPs wiederholen dieselben Rollen.

**Zielgruppe (im Pack festgelegt):** zuerst Reinhard Manzl als erfahrener Wiener Investmentmakler; später weitere erfahrene Makler und ein fachlich qualifizierter Trainer. Kein universelles Vertriebsprodukt, keine prominente Trainer-Plattform.

**Coaching-Methode (kanonisch in Konzept + Bau-/Ausbildungsplan):** *Deliberate Practice*, nicht Keyword-Quiz.

1. Sichtbares Briefing (nur was der Nutzer wissen darf).
2. Freies Gespräch gegen eine **konsistente Gegenseite** mit verdecktem Zustand (Interessen, Grenzen, Vollmacht, BATNA).
3. Harte Regeln: kein Abschluss ohne Vollmacht, keine erfundenen Käufer, Auflegen ist erlaubt.
4. Getrennte Bewertung mit Belegstelle; Stil ≠ Substanz; berechtigtes Nein ist kein Misserfolg.
5. Eine Korrektur → dieselbe Stelle wiederholen → später unbekannter Transferfall.

Methoden (Harvard, SPIN, Voss/Black Swan, Cialdini, Kreuter, MEDDPICC, Challenger) sind **bedingte Leitlinien**, keine Mischsuppe und keine Imitation echter Trainerstimmen.

Der Gesprächsbaum ist fachlich verworfen: Keyword-Routing, starre Typen, Nutzer antwortet als Verkäufer während die App Maklersätze vorgibt, 16 Phasenkennungen ohne Definition. Übernehmen nur: typische Einwände, Objektkontext, Gesprächsanlässe.

---

## 2. Empfohlenes erstes Produkt

**Eine Web-App**, Next.js / TypeScript / Tailwind / shadcn — wie im Pack (`Fundament`) und als Default. **Kein** Nx-Monorepo, **keine** zwei Apps, **kein** Trainingsstudio, **kein** Live-Telefon.

**Ein durchgängiger Slice, den Reinhard allein nutzen kann:**

1. Szenario wählen (Startheld: **S01 Honorarvergleich**, plus S02 Ablehnung und S03 Miteigentümer).
2. Öffentliches Briefing lesen, Gespräch starten.
3. Als Makler sprechen (Browser-Stimme, **Text-Fallback** ohne API-Key).
4. KI spielt den Zinshaus-Eigentümer (Role Player **ohne** Rubrik).
5. Danach: ein wichtiger Moment, Zitat, Korrektur, **diese Stelle erneut**.

Das ist die kleinste vollständige Lerneinheit aus Konzept und Teamhandbuch: *Situation → Gespräch → belegte Verbesserung → wiederholen.*

Zurückgestellt bis der Slice sitzt: Verhandlungs-Arbeitsplatz (E-Mail/Angebote), „KI trainieren“, CRM, Twilio, Live-Flüstern, Avatare, Microsoft-Org, öffentliche Bibliothek.

---

## 3. Phasen (jeweils ein lieferbares Stück)

| Phase | Liefergegenstand |
|---|---|
| **1. Inhaltskern** | Drei freigegebene Szenarien inkl. `public_brief` / `private_state` / harter Grenzen, 6 Wissenskarten, Rubrik 0–4 mit Enthaltung. Gesprächsbaum **nicht** als Runtime. |
| **2. Textloop** | Dieselbe App: Briefing → Chat → belegte Auswertung → Wiederholung. Zustandsserver, Transkript, kein Voice. Nutzbar zum Üben. |
| **3. Stimme** | OpenAI-Realtime-Adapter (WebRTC) auf denselben Verträgen; Unterbrechen, Auflegen, Fehleranzeige, Kosten/Latenz messen. Text bleibt Fallback. |
| **4. Persistenz für den Pilot** | Sitzungen, Bewertungen, Szenarioversion speichern. Ein Nutzer (Reinhard). |
| **5. Härten** | Zweiter unbekannter Transferfall; Anfechtung einer Bewertung; Red-Team gegen Rollenbruch und erfundene Käufer. Erst dann Studio oder zweite Arbeitsfläche. |

---

## 4. Offene Fragen, die Scaffolding blockieren

Nur Entscheidungen, die Architektur, IA, Datenmodell, Zielgruppe oder Auth ändern. Schweigen = Default.

**1. Wer nutzt die erste Version — und mit welchem Login?**  
Ändert Auth, Mandantenmodell, Datenisolation.  
Pack: geschlossene Pilotgruppe, Microsoft + Supabase.  
**Default:** ein lokaler/Pilot-User (Reinhard), einfache Anmeldung oder Dev-Session. Kein Microsoft, kein Org-Modell, bis jemand Zweiten braucht.

**2. Eine Fläche oder die ganze Plattform?**  
Ändert IA und Datenmodell.  
Pack widerspricht sich: zwei Apps (Vertrieb + Verhandlung), plus Studio „KI trainieren“, plus Nx-Modulbaum.  
**Default:** eine App, nur „Ich trainiere“. Studio und Verhandlung kommen nach Phase 5.

**3. Textkern zuerst oder Audio-first?**  
Ändert Architektur und ersten Vertrag.  
v4-Startauftrag: 5-Minuten-Call, noch kein Coaching. Konzept/Ausbildung: Textkern, dann Stimme.  
**Default:** Phase 2 Textloop, Phase 3 Stimme auf **identischen** Sitzungs-/Zustandsverträgen. Ohne Key läuft die App trotzdem.

**4. Welches Szenario-Modell ist Runtime?**  
Ändert Datenmodell und Coaching.  
Gesprächsbaum = Keyword-Pfad. Engine v2 = Generator / Role Player / State / Evaluator getrennt.  
**Default:** Engine-v2-Modell + `Telefoncoaching-Testfaelle.json`. Baum nur als Ideenquelle für Einwände.

**5. Dateien oder Datenbank ab Tag 1?**  
Ändert Persistenz und Auth-Annahme.  
Pack: Supabase Postgres + RLS. Ausbildungsrunde 1: SQLite-Labor ohne echte Auth.  
**Default:** eine Postgres-ähnliche Speicherung im App-Repo (lokal zuerst). Adapter zu Supabase erst, wenn Login/Mandant wirklich gebraucht wird.

---

## 5. Schon genug vs. noch fehlend

**Genug für den Slice (nicht für den Projektbaum der Plattform):**

- Produktversprechen, Zielgruppe, Methodenboden und explizite Nicht-Ziele
- 8 synthetische AT-Szenarien, 6 Karten, Rubrik, 24 Antwortprüfungen
- Role-Engine-Vertrag und Next.js/Voice-Adapter-Vorschlag
- Klare Verbote: Keyword-Baum, Avatare, Live-Call, erfundene Käufer, Trainerimitate

**Im Pack nicht vorhanden — vor oder während des Baus klären:**

- API-Zugang und Budget (OpenAI; ElevenLabs nur Vergleich)
- Menschliche Referenzurteile (im JSON ausdrücklich `not_run`)
- Ein von Reinhard **freigegebenes** reales (anonymisiertes) Telefonat als Transferfall
- Welche der widersprüchigen Bauordnungen gilt (v4 Audio-first vs. Konzept-Loop) — siehe Defaults oben
- Recht: echte Aufnahmen, Cold-Calling-Grenze (RTR ist zitiert, keine Rechtsprüfung)
- Lizenzen für volle Methodenwerke (nur öffentlich zitierte Grundgedanken)
- Gemessene Stimme, Latenz, Kosten — bisher 0 Audioläufe

**Nicht blockierend:** genaue Stimme, Vercel vs. anderer Host, Tailwind-Details, Team-Chat-Protokoll für 15 Agenten.

---

Nächster Schritt nach Freigabe der Defaults in Abschnitt 4: Projektbaum nur für Phasen 1–2 (eine Next-App, Szenarien als Daten, Textloop). Nicht vorher die Plattform aus dem Entwicklungsbaum anlegen.
