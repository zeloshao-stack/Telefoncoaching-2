# A01 Systemarchitektur CTO mit K01 Architektur und Ausfallprüfung

## Auftrag A01

Entwirf ein modulares, verständliches und fehlertolerantes System. Bestimme Grenzen, Verträge und Datenflüsse; vermeide sowohl unkontrollierte Kopplung als auch vorzeitige Microservices.

## Pflichtwissen

- C4 Context, Container und Component Modelle.
- WebRTC Media Tracks, RTP SRTP, RTCP, ICE, STUN TURN und DataChannel.
- synchrone gegen ereignisgesteuerte Kommunikation.
- Idempotenz, Sequenzierung, Optimistic Concurrency und Outbox.
- Latenzbudget, Backpressure, Timeout, Retry und Circuit Breaker.
- OpenTelemetry Traces, Logs und Metrics.
- modulare Monolithen, Ports and Adapters und Provider Abstraktion.

## Systemspezifische Regeln

- Audio über Media Track; Kontrollereignisse über DataChannel oder abgesicherten Signalkanal.
- `sequence_number` ist je Session monoton; UUID allein ordnet nichts.
- State Engine ist autoritativ. LLMs schlagen Änderungen vor, sie schreiben Zustand nicht ungeprüft.
- Provider werden über Adapter austauschbar gehalten.
- Role Player, Evaluator und private Persona besitzen getrennte Berechtigungsgrenzen.
- Realtime Pfad enthält keine langsame Post Call Logik.

## Lernprogramm

1. Zeichne einen vollständigen Audio Turn inklusive Unterbrechung und Playback Ack.
2. Modelliere TTS Timeout, STT Disconnect und doppelte Events.
3. Definiere APIs und Events mit Versionen, Fehlern und Idempotenz.
4. Baue einen lokalen Vertical Slice als modularen Monolith.
5. Instrumentiere jeden Latenzabschnitt.
6. Führe Failure Injection durch und korrigiere die Architektur.

## Pflichtartefakte

- C4 Diagramme und Sequence Diagrams.
- Architecture Decision Records.
- Service und Modulgrenzen.
- Interface und Event Registry.
- Latenz-, Kosten- und Fehlerbudget.
- Dependency Graph und Ownership Map.

## Abschlussprüfung

Ein vollständiger Gesprächszug muss bei STT Timeout, doppeltem Event, Nutzerabbruch und TTS Ausfall definiert reagieren. Kein Zustand darf still verloren gehen. Gemessene Werte werden berichtet; keine erfundene P95 Garantie.

## Gegenprüfer K01

Prüfe auf unnötige Verteilung, Single Points of Failure, widersprüchliche Zustandsbesitzer, fehlende Reihenfolge, unendliche Retries, blockierende Realtime Aufrufe und nicht beobachtbare Fehler.

Freigabe nur, wenn jeder kritische Pfad einen Besitzer, Vertrag, Timeout, Fehlerzustand und Test besitzt.

