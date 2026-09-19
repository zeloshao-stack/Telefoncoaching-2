# Wissen-Architektur

Reinhard aktualisiert Wissen, **ohne die App neu zu bauen**. Stand 18.09.2026.

Produktkarte: [Projektbaum](projektbaum.md). Module: [module.md](module.md). **KB (Ausgangsbestand):** [Gesamtwissen](wissen/README.md) · Index: [00_INDEX_Gesamtwissen.md](wissen/gesamtwissen/00_INDEX_Gesamtwissen.md). Szenenrubrik bleibt [Handbuch 1.1](wissen/scoring-und-szenenhandbuch.md) — nicht die KB selbst.

**KB ist das erweiterte Gesamtwissen**, nicht die drei JSON-Fälle. Laufzeit liest nur einen **freigegebenen Snapshot** klassifizierter `knowledge_unit`s. Quellenordner werden **nicht** in den Role Player gekippt. S01–S03 sind die **ersten Drills** aus diesem Snapshot.

**Sofort-Werkzeug bleibt:** Üben + Scoring + Profi-Tipps auf S01–S03. Würfel später, nicht auf dem Start. Sichtbares Scoring: **0–4 + N/A**. Bei Widerspruch siegt der [Projektbaum](projektbaum.md). Kein Sechs-Studio-CMS in v1.

Anti-Monster: kein CMS, kein Wissens-Studio, keine Plattform. **Zwei Türen, ein Wissen.** Verträge halten — Dateien und Adapter wechseln.

```
Gesamtwissen (Quellen, versioniert)
        → Snapshot (freigegebene knowledge_units)
                    ┌─ Fragen (Q&A)
                    └─ Üben (Rollenspiel; S01–S03 = erste Drills)
                            → Adapter (Modell jetzt · Stimme später)
                            → App-Loop (Üben → Scoring → ein Tipp → Repeat)
```

Hält der Vertrag, bleibt der Loop gleich. Role Player sieht **nie** die Rubrik. Die Fragen-Tür sieht **nie** `private_state` einer laufenden Sitzung.

---

## Vier Schichten

### 1. Wissensdateien

**Kanon-KB:** [Gesamtwissen](wissen/README.md) — erweiterter fachlicher Ausgangsbestand, nicht Pack-JSON. Import: Aussage → `knowledge_unit` (Quelle, Grenzen, Evidenz, Freigabe). Laufzeit: nur **veröffentlichter Snapshot**.

| Datei-Art | Inhalt | v1 |
|---|---|---|
| **Gesamtwissen** | Telefonhandwerk, Coach-KB, Methoden, Scoring-Quellen | [Index](wissen/gesamtwissen/00_INDEX_Gesamtwissen.md) |
| **Snapshot** | freigegebene `knowledge_unit`s | das, was Fragen und Üben lesen |
| **Erste Drills** | S01–S03 aus dem Snapshot | Honorarvergleich zuerst; JSON ist Drill, nicht die KB |
| **Scoring-Regeln** | Hebel, 0–4, Enthaltung/N/A | Schirm Anti-Monster; Projektbaum siegt |
| **Profi-Tipps** | eine Alternative je Anker | Pflicht im Sofort-Werkzeug |
| **Pausenregeln** | Stille, Zögern, Unterbrechen | **nicht v1** — braucht Audio-Zeitstempel |

Quellen nicht als ganzer Prompt in Role Player oder Coach. Kein Sechs-Studio-CMS in v1. Jede Unit trägt eine **Version**. Sitzungen speichern, welche Version sie gesehen haben.

### 2. Figuren als Daten

Die Gegenseite ist **kein** 3-D-Avatar. Sie ist eine Karte:

| Sichtbar (`public_brief`) | Verdeckt (`private_state`) |
|---|---|
| was der Trainee wissen darf | Motive, Verkaufswille, Verfassung, Vorgespräche |

Realistische Avatare = bessere Figurdaten, später Voice Identity — **kein** 3-D-Studio, kein Marketplace.

### 3. Adapter

Dieselbe Schnittstelle, austauschbare Implementierung.

| Adapter | v1 | Später |
|---|---|---|
| **Modell** | OpenAI Chat **oder** Mock, Key serverseitig | besseres / latenzärmeres LLM hinter derselben Tür |
| **Stimme / Mikrofon** | aus | Phase 3, gleicher Sitzungsvertrag |
| **Evaluator** | Rubrik 0–4 + Zitat + ein Tipp | Handbuch-Version; Pausenanalyse als Plugin (Audio) |

Role Player und Scoring rufen **getrennte** Modell-Kontexte. Rubrik nur beim Evaluator.

### 4. App-Loop

Unverändert, solange die Verträge halten:

```
Briefing (public_brief) → Üben → Scoring (versionierte Rubrik) → ein Profi-Tipp → Repeat
```

Neue Unit / neue Snapshot-Version / neues Modell: **kein** Rebuild der Schale. Neue Szene im Drill = neue Datei **im Snapshot**, gespeist aus Gesamtwissen — nicht eine dritte KB.

---

## Zwei Handhaben — ein Wissen

Reinhard hat schon einen **KI-Vertriebscoach**-Chat (Fragen stellen, bisher oft generische Sales-Karten). Der soll **am selben Wissen** hängen wie das Telefontraining — andere Handhabe, keine zweite Wissensbasis.

| | **Fragen** | **Üben** |
|---|---|---|
| Was es ist | Nutzer fragt, Coach antwortet | Live-ähnliches Telefonat; die Gegenseite weicht aus |
| Wissen | dieselbe KB (Gesamtwissen → Snapshot) | dieselbe KB (Gesamtwissen → Snapshot) |
| v1 | zweite Tür, **nicht** das Sofort-Werkzeug | Textloop S01–S03 — **das** Sofort-Werkzeug |
| Im Call | **kein** Flüstern (kein Balto) | Role Player ohne Rubrik |
| Nach Auflegen / explizite Pause | Coach fragen ist erlaubt | Scoring + ein Profi-Tipp, dann Repeat |

**Nicht:** zwei Wissensbasen · Whisper mitten im Gespräch · Paywall-Produkt „Chat“ in der Trainings-App · Plattform mit sechs Türen.

### Grenzen

| Darf | Darf nicht |
|---|---|
| Fragen-Coach liest den **Snapshot** (Zinshaus, Wien, Reinhard) | `private_state` einer **laufenden** Übungssitzung; Quellenordner als Prompt |
| Nach `ended` oder expliziter Pause: Coach zur **öffentlichen** Lage + Transkript (ohne Hidden State) | Rubrik an den Role Player |
| Generische „Closing-Techniken“-Karten aus dem alten Chat **ersetzen** | denselben Screenshot-Cocktail (SPIN/Voss/Harvard) als Wissensschicht |

Wissen bleibt **Zinshaus / Wien / Reinhard**. Der alte Chat wird angebunden, nicht als zweites Produkt in der Übungs-App verkauft.

Anti-Monster: **zwei Türen**, keine Plattform.

---

## Was leicht bleiben muss

| | Wie | Nicht |
|---|---|---|
| **Neue Szene** | neue Unit im Snapshot, gespeist aus Gesamtwissen | Mixer, Würfel, Start-Umbau, Sechs-Studio-CMS |
| **LLM tauschen** | anderes Modell hinter dem Modell-Adapter | Prompt-Haufen in der UI, Key im Browser |
| **Scoring verbessern** | neue Handbuch-**Version**; alte Sitzungen behalten die alte | %-Ampel, Formel im Prompt |
| **Pausen** | Evaluator-Plugin, **sobald** Audio-Zeitstempel da sind | Fake-Pausen im Textloop |
| **Avatare** | Figurdaten / später Stimme | 3-D-Studio, Ready Player Me |
| **Psychologie** | Wissensquellen, versioniert | Traits hart im Role-Player-Code |

---

## Weiterlernen

Eine beendete Sitzung **darf einen Wissens-Patch vorschlagen** (Szene, Tipp, Scoring-Anker). Reinhard **nimmt an oder lehnt ab**. Nichts landet automatisch in der KB.

| Regel | Warum |
|---|---|
| Mensch akzeptiert | ein Editor: Reinhard |
| Alte Sitzungen behalten ihre **Rubrik-Version** | sonst ändert sich die Note nachträglich |
| Role Player sieht die Rubrik nie | Gegenseite ≠ Coach |
| Echte Anrufe nur mit Einwilligung in die KB | sonst kein Consent |

Kein LMS, keine Team-Inbox, kein automatisches Nachtrainieren des Modells.

---

## Nicht übersehen

| Risiko | Haltung |
|---|---|
| **Rubrik-Versionierung** | Sitzung friert die Version ein; Auswertung und Repeat lesen dieselbe |
| **Goldene Testdialoge** | bei jedem Modell-Tausch gegen S01–S03 (und später Kernszenen) laufen lassen |
| **Pause = Audio** | Textloop hat keine echten Pausen; Plugin erst in Phase 3 |
| **Kosten / Latenz** | Budget am Adapter; Mock bleibt Fallback; kein Live-Whisper |
| **Consent** | reale Gespräche oder Stimmen nur mit Einwilligung in die KB |
| **Ein Editor** | vorerst nur Reinhard; kein Multi-Author, kein Marketplace |
| **Widersprüchliche Psychologie** | Quellen versionieren und benennen; Konflikt nicht still mischen |
| **Zwei Handhaben** | Fragen darf nicht `private_state` der laufenden Sitzung sehen; kein Live-Flüstern |

---

## Nicht diese Architektur

Kein CMS-Monster · kein Sechs-Studio in v1 · keine Plattform · kein zweites Wissens-Frontend · kein Nx · Würfel nicht auf dem Start · Psychologie nicht hardcoden · Rubrik nicht an den Role Player · Quellen nicht in den Role Player kippen · alte Notes nicht mit neuer Formel überschreiben · kein Balto im Call · keine generischen Closing-Karten als KB · S01–S03-JSON ist nicht die KB.
