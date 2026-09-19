# Projektbaum: KI-Telefoncoaching

Für **Reinhard Manzl**, Wiener Investmentmakler. Stand 18.09.2026.

Eine Next-App. Du trainierst am Telefonat — nicht an einer Plattform.

```
Honorarvergleich → sprechen → ein belegter Hebel → ein Tipp → dieselbe Stelle
```

**Sofort:** Üben + Scoring + Profi-Tipps auf S01–S03. Erster Klick: **Honorarvergleich**. Text. Kein Mixer, kein Würfel, kein Fake-Mic, keine Paywall.

---

## Karte

```
Telefoncoaching
├── Sofort-Tool             Üben · Scoring · Profi-Tipps · S01–S03 · Text
├── Fünf Module             [module.md](module.md)
│   ├── Szenario schreiben  öffentlich vs. verdeckt (Wallnerstraße)
│   ├── Üben                Anruf, Gegenseite weicht aus
│   ├── Scoring             ein Hebel · 0–4 + Enthaltung
│   ├── Profi-Tipps         ein zitierter Tipp → Repeat
│   └── Hausverwaltung      eigene Welt · später
├── Zwei Handhaben          ein Wissen — [wissen-architektur.md](wissen-architektur.md)
│   ├── Fragen              bestehender KI-Vertriebscoach
│   └── Üben                Telefontraining
├── Wissen                  [Gesamtwissen](wissen/README.md) → Snapshot (`knowledge_unit`s) · Adapter
│                           S01–S03 = erste Drills, nicht die KB
└── Später                  Würfel · Mikrofon · Stimme · Hausverwaltung-Spur
```

Defaults: [Vorgehen](vorgehen.md).

---

## Sofort-Tool

Was jetzt geht, ohne Generator.

| | |
|---|---|
| **Loop** | Briefing → Textgespräch → Scoring → ein Profi-Tipp → Repeat |
| **Fälle** | **S01 Honorarvergleich** (erster Klick) · S02 Ablehnung · S03 Miteigentümer |
| **Schirm** | drei Karten, kein Mixer, kein Würfel, kein Mikrofon, keine Paywall |
| **Trainee sieht** | nur `public_brief` |
| **Verdeckt** | `private_state` — hörbar, wenn die Figur spricht |

Scoring und Profi-Tipps sind **Pflicht**. Ohne sie ist der Chat kein Werkzeug.

---

## Fünf Module

Kanon und Detail: [module.md](module.md).

| Modul | Wann | Was |
|---|---|---|
| **Szenario schreiben** | als Nächstes | Autor trennt öffentlich / verdeckt. Beispiel: Zinshausverkäuferin, 65, Haus Wallnerstraße, schöne Fassade = öffentlich. Verdeckt: Wie geht es ihr? Will sie verkaufen? Hat sie schon mit jemandem gesprochen? Körperliche Verfassung. Selbst / Upload füllen dieses Modul; Würfel später. |
| **Üben** | **sofort** | Anruf gegen die Figur. Text jetzt, Mic später. Gegenseite kennt die Rubrik nicht. |
| **Scoring** | **sofort** | Ein Hebel, Zitat, **0–4 + Enthaltung / N/A**. Kein % auf dem Schirm. |
| **Profi-Tipps** | **sofort** | **Ein** Tipp an der zitierten Stelle, dann Repeat. Kein Tipp-Schwall. |
| **Hausverwaltung** | später | Eigene Welt: Beschwerden, Professionisten, Eskalation. Nicht auf dem S01-Start. Nicht ins Akquise-Scoring mischen. |

Fragen (Q&A) ist **kein** sechstes Modul — siehe Handhaben.

---

## Zwei Handhaben, ein Wissen

Detail: [wissen-architektur.md](wissen-architektur.md).

Dasselbe Wissen, zwei Türen. Keine zweite Wissensbasis. Keine Plattform.

| | **Fragen** | **Üben** |
|---|---|---|
| Tür | bestehender KI-Vertriebscoach | dieses Telefontool |
| Nutzer | fragt | spricht; die Gegenseite weicht aus |
| v1 | anbinden, nicht Sofort-Tool | **das** Sofort-Tool |
| Im Call | kein Flüstern (kein Balto) | Role Player ohne Rubrik |
| Danach | nach Auflegen oder expliziter Pause: Coach fragen ist OK | Scoring + ein Tipp |

Fragen sieht nie `private_state` einer **laufenden** Sitzung. Wissen bleibt **Zinshaus / Wien / Reinhard** — keine generischen Closing-Karten. Chat ist kein Paywall-Produkt in der Übungs-App.

---

## Wissen

Reinhard ändert Inhalt, **ohne die App neu zu bauen**. Detail: [wissen-architektur.md](wissen-architektur.md).

**KB = [Gesamtwissen](wissen/README.md)** ([Index](wissen/gesamtwissen/00_INDEX_Gesamtwissen.md)) — nicht die drei JSON-Fälle.

```
Gesamtwissen (Quellen)  →  Snapshot (freigegebene knowledge_units)  →  Fragen | Üben
S01–S03 = erste Drills aus dem Snapshot
```

Laufzeit liest nur den Snapshot. Quellen nicht in den Role Player kippen. Sichtbares Scoring: **0–4 + N/A**. Bei Widerspruch siegt dieser Projektbaum. Kein Sechs-Studio-CMS in v1.

Szenenrubrik (Felder): [Handbuch 1.1](wissen/scoring-und-szenenhandbuch.md).

---

## Später

Nicht auf dem Startschirm. Nicht das Sofort-Tool.

| | |
|---|---|
| **Würfel** | PR #3 geparkt. Füllt Szenario schreiben. Trainee würfelt nicht. |
| **Mikrofon** | explizite Browser-Erlaubnis, Text bleibt Fallback. Kein Fake-Mic in v1. |
| **Stimme** | Phase 3, dieselben Sitzungen |
| **Hausverwaltung** | parallele Spur, eigene Welt |

---

## Nicht

Nx · zweite Trainings-App · CRM · Twilio · Balto / Live-Flüstern · generisches Closing-Karten-LMS · 3-D-Avatar-Studio · zwölf Engineering-Module als Produktliste · Mixer am Start · Würfel am Start · %-Kompetenz auf dem Schirm.

Anti-Monster: **zwei Türen**, ein Loop, keine Feature-Matrix.

---

## Stand

Nur Status, kein Bauplan.

| PR | |
|---|---|
| **#1 Textloop** | = Sofort-Tool |
| **#2 Verlauf** | letzte Sitzungen |
| **#3 Werkstatt** | geparkt (Würfel / Figuren) |
