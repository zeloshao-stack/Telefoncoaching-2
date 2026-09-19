# Telefoncoaching — Rebuild 19.09.2026

## Start auf Ihrem Rechner

Dieses Verzeichnis separat vom bisherigen Projekt entpacken. Die ursprüngliche ZIP wurde nicht verändert. Node.js 22 oder neuer und npm verwenden.

```sh
npm install
cp .env.example .env.local
# OPENAI_API_KEY in .env.local setzen, nicht in den Browsercode.
npm run dev
```

Dann http://127.0.0.1:43147 öffnen. Ohne Schlüssel sind Katalog und Briefings nutzbar; echte Gespräche starten nicht. Bei bereits belegtem Port den bisherigen Entwicklungsserver beenden. Ein OpenRouter-Schlüssel allein ersetzt keinen OpenAI-Realtime-Zugang. Kosten entstehen beim tatsächlichen Provider-Aufruf.

```sh
npm test
npm run build
npm start
```

Keine bestehenden Gesprächsdaten sind enthalten. SQLite wird lokal angelegt. Das Projekt bleibt eine lokale Einzelplatz-App; es wurde kein öffentliches Hosting eingerichtet.

## Was tatsächlich geändert wurde

- Neue Hauptnavigation, Szenenkatalog mit allen drei Zielen direkt auf jeder Karte, einseitige Briefings, Werkstatt. Keine extern geladenen Schriften oder Fotos.
- Acht überarbeitete öffentliche Szenen und 24 verständliche Lernziele samt Begründung. Frozen-IDs, Eröffnungen und private Szenenbedingungen bleiben erhalten.
- Acht unterschiedliche Verhaltensprofile. Der Player darf auf Korrekturen eingehen, konkret antworten und aus seinem Interesse weiterreden oder auflegen. Universelle Kürze, starre Wiederholungsverbote und automatische Ersatzsätze wurden entfernt.
- Live-Faktenfreigabe erfolgt bei Bedarf semantisch anhand des gespeicherten Gesprächs. Der Selektor darf höchstens zwei vorhandene IDs auswählen; gesprochen werden ausschließlich hinterlegte Fakten. Kein neues Faktenwissen wird vom Selektor geschrieben. Regeln und Lernziele gelangen nicht in den Player.
- Die bestehende direkte WebRTC-Audioleitung bleibt Grundlage. Kein vorgeschaltetes TTS-Prefetch beim Start. Der Status zeigt erst nach geöffnetem Datenkanal eine aktive Leitung. Zeitmessungen stehen in der Werkstatt, ohne Live-Score-HUD.
- Wiederholungen speichern und verwenden Zustands-Checkpoints. Der Endzustand des Elternanrufs darf nicht in den zurückgesetzten Moment gelangen.
- Providerfehler werden sichtbar; sie werden im Text-Rollenspiel nicht mehr still durch einen scheinbaren KI-Dialog ersetzt.

Dies ist ein umfassender Umbau auf der vorhandenen Next.js-Struktur. Bestehende Evaluator-, Coach-, Audio- und Replay-Bausteine wurden gezielt erhalten. Text-/Mock-Pfade enthalten weiterhin ältere Beobachtungs- und Freigabeheuristiken. Die neue semantische Freigabe betrifft den Live-Anruf.

## Nachweise und Grenzen

VERIFIZIERT bedeutet hier Code-/Testnachweis, nicht gehörte Gesprächsqualität. Die vollständige Testsuite und der Produktionsbuild werden vor Übergabe ausgeführt. Lokale TTS-Tests ohne verfügbare Stimme sind übersprungen. Eine automatisierte Browser-Sichtprüfung war durch den Netzwerkzugriff der Browserumgebung blockiert; HTTP-Seitenprüfungen ersetzen diese nicht.

UNBEKANNT: echte End-to-End-Audiolatenz, Natürlichkeit, österreichische Stimmwirkung, situative Modellqualität und die tatsächliche Erfolgsrate der neuen Gedächtnisabfrage. Es wurden keine bezahlten Modellaufrufe oder Hörtests durchgeführt. Der zusätzliche Gedächtnisaufruf kann bei fehlendem Wissen Zeit kosten (serverseitiges Zeitlimit 3,5 Sekunden); er wird nicht pro Gesprächszug aufgerufen. Transportmessungen sind keine akustischen Messungen.

Die Anwendung ist für lokale Nutzung gedacht. Öffentliche Mehrbenutzerbereitstellung benötigt einen eigenen Zugriffs- und Betriebskontext. Das gehört nicht zu Gate A.

## Drei Hörtests vor Freigabe

Jeweils Originalversion und Rebuild mit derselben Szene, denselben Sätzen und demselben Gerät testen. Reihenfolge abwechseln; keine Qualitätsbehauptung aus einem gelungenen Beispiel ableiten.

1. **Zuhören und Figur:** S01 und S04. Eine konkrete Frage anders formulieren, einen eigenen Fehler korrigieren und einen früheren Punkt erneut aufnehmen. Prüfen: Antwort auf den wirklichen Inhalt, Korrektur berücksichtigt, Persönlichkeit erkennbar, keine erfundenen Fakten. Eine fehlende Information gezielt abfragen. Mindestens zehn Antwortwechsel je Fall protokollieren.
2. **Leitung:** Während der Figurenantwort zuerst schweigen, dann Hintergrundgeräusch, dann verständlich unterbrechen. Nur der letzte Fall darf einen echten Barge-in auslösen. Danach eine klare Grenze übergehen: Abschied muss vollständig hörbar sein; danach darf keine weitere Antwort kommen. Sprecherende und hörbaren Antwortbeginn für Median und langsame Ausreißer messen.
3. **Lernen:** Nach Auflegen Note oder N/A, eine Stärke, einen Hebel und das echte Zitat prüfen. Zitat öffnet die richtige Zeile. Repeat muss vor demselben Moment mit neuer Uhr und passendem Wissen starten; denselben Satz verbessert wiederholen. Auch Repeat eines Repeats prüfen.

## Abschnitt 2 des Briefs: Invarianten-Checkliste

| Invariante | Automatischer Nachweis / verpflichtende Abnahme |
|---|---|
| 1. Vier getrennte Maschinen | Persona-/Realtime-/Evaluation-Tests prüfen Payloadtrennung. Semantischer Selektor liefert nur Fakten-IDs; Zustand und Checkpoint werden serverseitig atomar geschrieben. Nach Auflegen Evaluator-Aufruf prüfen. |
| 2. Stimme getrennt vom Mundtext | voiceState- und Persona-Tests; Hörtest: keine gesprochenen Regieklammern. |
| 3. Öffentlich / verdeckt | scene-card-, scene-briefing-, scene-intel-Tests; semantische Whitelist- und Fehlerfälle. In Browser-Netzwerkantworten keine ungeöffneten Fakten prüfen. |
| 4. 0–4 + N/A, ein Fokus | evaluation-, debrief-moments-, practice-loop-Tests; manueller Debrief mit unzureichender Evidenz muss N/A statt Fantasienote zeigen. |
| 5. Repeat gleicher Moment | repeat-replay- und repeat-checkpoints-Tests einschließlich Repeat eines Repeats; neue Audio-Uhr im Hörtest prüfen. |
| 6. Kein Live-HUD | Abnahme /sitzung: keine Noten, Ratio oder Coaching-Seitenleiste. live-stage-Tests sichern Darstellungszustände. |
| 7. Kein Forecast | Abnahme Katalog, Anruf, Verlauf: keine Deal-Prognose, Gewinnwahrscheinlichkeit oder Euro-Pipeline. |
| 8. Kein Billing/Mandant/Studio | Keine solchen neuen Gate-A-Flows. Bestehende Autoren-/Stimmfunktionen nur in Werkstatt, nicht als Telefontraining-Schritt. |
| 9. Evidenzsprache | Bericht und diese Datei unterscheiden VERIFIZIERT, PLAUSIBEL, HYPOTHESE, UNBEKANNT. Hörqualität bleibt offen. |
| 10. Sprachdaten | Keine neue persistente Practice-Audioaufzeichnung. Zeitmessungen enthalten nur Dauer/Typ/Zeitpunkt. Vor produktiver Nutzung Aufnahme-/Speicherpfad prüfen; kein „Server DE“-Versprechen. |

Weitere harte Leitungsverträge: `interrupt_response: false` wird getestet; kein `conversation.item.truncate` senden; Startpayload ausschließlich `scenarioId` und `focusId`; Figurenprompt ohne Bewertungsrubrik oder Trainingszielblock. Eine Textsuche in Kommentaren ist kein Nachweis für den tatsächlich gesendeten Prompt — dafür existieren Payloadtests.

## Forschung

Siehe `docs/REBUILD-RESEARCH-2026-09-19.md`. Öffentliche Produktdokumentation und zugängliche Demo-Transkripte wurden ausgewertet. Keine fremden Login-Oberflächen wurden behauptet oder umgangen. Keine Wettbewerberstimme wurde akustisch geprüft. Verwertbare Folien und belastbare unabhängige Nutzervergleiche wurden nicht gefunden.
