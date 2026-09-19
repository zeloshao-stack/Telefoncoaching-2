# Rebuild: Integrationsentscheidung

Primärverantwortung A00; getrennte Gegenprüfung durch review_engine. Nutzer hat umfassenden Rebuild und parallele Recherche ausdrücklich beauftragt.

Change Card: `docs/REBUILD-CHANGE-CARD.yaml`. Übergabe und Invarianten: `REBUILD-START.md`. Quellen: `docs/REBUILD-RESEARCH-2026-09-19.md`.

Neue Modulzuordnung:
- `src/role-engine/character-performance.ts`: acht Figurenprofile, Teil des Players.
- `lib/semantic-memory.ts`: serverseitige semantische Auswahl vorhandener Fakten; keine Bewertung und keine Faktengenerierung.
- `app/api/sessions/[id]/memory/route.ts`: begrenzter Live-Gedächtnisabruf.
- `lib/replay-checkpoints.ts`: additive SQLite-Persistenz von Momentzustand und autorisierten Fakten.
- `lib/live-metrics.ts`: browserlokale technische Zeitmessung ohne Gesprächsdaten.
- `app/werkstatt/page.tsx`: Verbindungsstatus, bestehende Werkzeuge, Zeitmessungen.

Dialogqualität und Latenz bleiben UNBEKANNT bis zum Hörtest. Keine Freigabe als audioverifiziert. Kein Remote, Deployment oder produktiver Datenumzug Teil dieser Übergabe.
