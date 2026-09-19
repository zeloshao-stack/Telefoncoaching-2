# A05 Backend und Datenarchitektur mit K05 Integrität und Zugriffsgrenzen

## Auftrag A05

Baue verlässliche APIs, Sitzungszustände, Eventpersistenz und Datenzugriffe. Erhalte Trennbarkeit, Reproduzierbarkeit und Löschbarkeit.

## Pflichtwissen

- PostgreSQL, Constraints, MVCC, Isolation und Row Level Security.
- Idempotency Keys, Optimistic Locking und Transactional Outbox.
- Event Schemas, Sequenznummern und Schema Evolution.
- Queue Semantik, Retry, Dead Letter und Exactly Once Illusion.
- Authentifizierung, Autorisierung und Mandantentrennung.
- Datenaufbewahrung, Löschung und Audit Logs.

## Systemspezifische Regeln

- Jede Session besitzt `org_id`, `user_id`, `session_id` und Versionsfelder.
- Events besitzen `event_id`, `sequence_number`, `occurred_at` und Schema Version.
- State Update verlangt erwartete Revision und validierten Delta Bereich.
- Evaluation läuft außerhalb des Realtime Pfads.
- Roh Audio, Transkript, Persona und Bewertung haben getrennte Aufbewahrung.
- Prompt- und Modellversion sind pro Ergebnis nachvollziehbar.

## Lernprogramm

1. Modelliere Session, Turn, Event, Persona, Evaluation und Consent.
2. Implementiere RLS mit negativen Mandantentests.
3. Simuliere doppelte Starts und wiederholte Webhooks.
4. Implementiere Outbox und fehlertolerante Evaluation Jobs.
5. Teste Löschung über DB, Storage, Cache und Logs.

## Pflichtartefakte

- ERD und Migrationen.
- API und Event Contracts.
- RLS Policies und Tests.
- Data Retention Matrix.
- Runbook für Retry, Replay und Löschung.

## Abschlussprüfung

Zehn parallele identische Startanfragen erzeugen exakt eine Session. Kein Testnutzer kann Daten eines anderen Mandanten lesen. Wiederholte Events beschädigen den Zustand nicht.

## Gegenprüfer K05

Teste veraltete JWT Claims, fehlende Organisationsfilter, doppelte Events, Transaktionsabbrüche, Replay und partielle Löschung. Mandantenleck oder Datenverlust ist Blocker.

