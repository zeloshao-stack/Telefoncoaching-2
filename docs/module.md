# Module

Fünf Produktnamen bleiben. Eine Next-App. Stand 18.09.2026.

Ausführliche Produktkarte: [Projektbaum](projektbaum.md). Szeneninhalt: [Handbuch 1.1](wissen/scoring-und-szenenhandbuch.md). Austauschbares Wissen: [Wissen-Architektur](wissen-architektur.md).

**Die fünf (Kanon):** Szenario schreiben · Üben · Scoring · Profi-Tipps · Hausverwaltung.

```
SOFORT     Üben + Scoring + Profi-Tipps  auf S01–S03  (Textloop PR #1)
           Erster Klick: Honorarvergleich. Kein Mixer. Kein Würfel.
ALS NÄCHSTES  Szenario schreiben (Wallnerstraße: öffentlich vs. verdeckt)
SPÄTER     Würfel (PR #3 geparkt) · Hausverwaltung · Mikrofon
```

Scoring und Profi-Tipps gehören zum Sofort-Werkzeug — kein optionales Chrom.

Anti-Monster bleibt: ein Loop, keine Feature-Matrix. Trainee sieht nur `public_brief`. `private_state` bleibt verdeckt. Würfel **nicht** auf dem Startschirm.

Wissen liegt in **versionierten Dateien**, Modelle hinter einem **Adapter**. Neue Szene = neue Datei. LLM-Tausch ohne App-Rebuild. Role Player sieht die Rubrik nie. **Ein Wissen, zwei Handhaben:** Fragen (Q&A) und Üben (Rollenspiel) — Details: [wissen-architektur.md](wissen-architektur.md). Fragen ist kein sechstes Produktmodul und nicht das Sofort-Werkzeug.

---

## Sofort — das Werkzeug, das jetzt geht

S01–S03 sind schon geschrieben. Reinhard braucht keinen Generator, um zu üben.

### Üben

Der Anruf gegen die Figur.

**v1 / PR #1:** Textloop — schreiben, auflegen, Chat. Startheld: **S01 Honorarvergleich**. Daneben S02 Ablehnung, S03 Miteigentümer. Drei Karten, kein Mixer, kein Würfel.

Trainee sieht Briefing (`public_brief`) → spricht als Makler → Gegenseite antwortet aus `private_state`, **ohne Rubrik**. Auflegen ist echt.

Kein Gesichtszwang, kein Live-Whisper. **Mikrofon später** (Phase 3), nicht jetzt.

### Scoring

Pflicht im Sofort-Werkzeug, nicht in der Auswertung vergraben.

Belegte Note: Zitat aus dem Transkript, ein Hebel, Skala **0–4** plus **Enthaltung / N/A**. Kein Prozent-Kompetenz, keine Ampel auf der v1-UI.

| Auf dem Schirm (v1, Anti-Monster) | Später intern (Handbuch) |
|---|---|
| Ein Hebel, Zitat, 0–4, Enthaltung ≠ 0 | Score Engine 0–10, 80/20, BARS — **im Code**, eingeklappt |
| N/A, wenn das Kriterium nicht vorkam | N/A aus dem Nenner |
| Role Player liefert **keine** Note | Evaluator getrennt, ohne `private_state` als Vorwurf |

Berechtigtes Nein kann 4 sein. Ungesagtes wird nicht bestraft. Ohne Scoring ist der Loop kein Werkzeug.

### Profi-Tipps

Pflicht im Sofort-Werkzeug: **ein** konkreter Tipp **an der zitierten Stelle**, dann Repeat.

Kein Tipp-Schwall, keine zehn Methoden, kein Gutachten. Alternative in einem Satz, dann dieselbe Stelle erneut (neue Sitzung, Zustand davor).

```
zitierter Moment  →  ein Tipp  →  Repeat
```

Ohne diesen Tipp bleibt nur ein Chat — das ist nicht das Produkt.

---

## Als Nächstes — Szenario schreiben

Die Autorenfläche. Hier entsteht die Figur: **öffentliche Fakten** vs. **verdeckter `private_state`**.

Kommt **nach** dem Sofort-Werkzeug. v1 braucht sie nicht, um S01–S03 zu üben — die drei Fälle sind schon da. Selbst erstellen und Upload füllen dieses Modul später. **Würfel füllt es auch — aber ausdrücklich später, PR #3 bleibt geparkt.** Würfel ist kein Produktname und nicht auf dem Start.

### Was öffentlich, was verdeckt

Beispiel (Reinhard): Zinshausverkäuferin, 65, Haus **Wallnerstraße**, schöne Fassade.

| Öffentlich (`public_brief`) | Verdeckt (`private_state`) |
|---|---|
| Zinshausverkäuferin, 65 | Wie geht es der Frau? |
| Haus Wallnerstraße | Will sie verkaufen — oder nicht? |
| schöne Fassade | Hat sie schon mit jemandem gesprochen? |
| | Körperliche Verfassung |

Der Trainee darf **nur die öffentliche Scheibe** kennen. Der Rest wird hörbar, wenn die Figur spricht — nicht als Steckbrief.

Autor setzt `public_brief` und `private_state` getrennt. Harte Regeln (keine Vollmacht, keine erfundenen Käufer, Auflegen gilt) gehören zur Spec, nicht auf den Trainee-Schirm.

---

## Später — Hausverwaltung

Eigene Welt, nicht Eigentümer-Akquise. **Nicht** Teil des Sofort-Werkzeugs. **Nicht** auf dem S01-Startheld.

Themen: **Kundenbeschwerden**, **Umgang mit Professionisten**, **Eskalation**. Korrekte Eskalation ist kein Closing-Malus.

**Nicht** ins Scoring-Profil der Eigentümer-Akquise mischen. Parallele Spur — Handbuch-Szenen 11–14, eine Karte nach der anderen.

---

## Anhang — Umsetzung dahinter

Kein Produktkatalog. Technik hinter den fünf:

| Dahinter | Wann | Wofür |
|---|---|---|
| **Role Player** | Sofort (PR #1) | Gegenseite; kennt die Rubrik nicht |
| **Schale** | Sofort | Screens, Lovable-Haut |
| **Repeat** | Sofort (an Profi-Tipps) | dieselbe Stelle, neue `session_id` |
| **Speicher** | Sofort | SQLite, ein Nutzer |
| **Modell** | Sofort | Adapter: OpenAI oder Mock, Key serverseitig; tauschbar |
| **Figuren** | Als Nächstes → Szenario schreiben | Selbst / Upload; drei Quellen |
| **Würfel** | **Später, PR #3 geparkt** | verdeckter Wurf; **nicht** auf dem Startschirm |
| **Mikrofon** | **Später**, Phase 3 an Üben | Browser-Mic; v1 aus |

**Nicht bauen:** CRM · Twilio · Microsoft · zweite App · Nx · Live-Whisper · LMS.
