# Telefoncoaching

Textloop für Reinhard Manzl: drei Zinshaus-Szenarien (Honorarvergleich, Ablehnung, Miteigentümer), Gespräch gegen eine Role-Engine-Gegenseite, belegte Auswertung, Wiederholung derselben Stelle. UI auf Deutsch (de-AT). Kein Voice, kein Studio, kein Live-Telefon.

## Voraussetzungen

- Node.js 22+
- Optional: `OPENAI_API_KEY` in der Umgebung. Ohne Key läuft ein ehrlicher Regel-Fallback (Role Player + Evaluator). Mit Key nutzt die App OpenAI für beide, fällt bei Fehlern auf den Fallback zurück.

## Lokal starten

```bash
npm install
npm run dev
```

Dev-Server: [http://127.0.0.1:43147](http://127.0.0.1:43147)

Sitzungen und Auswertungen liegen in `data/telefoncoaching.sqlite` (wird angelegt). S01–S03 sind die **ersten Drills** (`data/Telefoncoaching-Testfaelle.json`). Die fachliche KB ist das [Gesamtwissen](docs/wissen/README.md); Laufzeit soll später nur einen freigegebenen Snapshot lesen, nicht die Quellen als Prompt.

Produktkarte: [docs/projektbaum.md](docs/projektbaum.md). Gate A Checkliste: [docs/gate-a-produktreif.md](docs/gate-a-produktreif.md). Module: [docs/module.md](docs/module.md). Architektur: [docs/wissen-architektur.md](docs/wissen-architektur.md).

## Tests

```bash
npm test
npm run lint
```

## Slice

1. Szenario wählen  
2. Öffentliches Briefing  
3. Textgespräch (Gegenseite kennt die Rubrik nicht)  
4. Auflegen → zitierte Bewertung 0–4 mit Enthaltung  
5. Denselben Moment wiederholen  
