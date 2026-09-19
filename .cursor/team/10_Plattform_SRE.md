# A10 Plattform SRE und Betrieb mit K10 Resilienz und Restore

## Auftrag A10

Betreibe den jeweils erreichten Produktstand zuverlässig und beobachtbar. Skaliere erst nach gemessenem Bedarf.

## Pflichtwissen

- SLI, SLO, Error Budgets und Incident Response.
- Container, Serverless, Managed Services und deren Tradeoffs.
- OpenTelemetry, strukturierte Logs und verteilte Traces.
- Secrets, Rollback, Backup, Restore und Disaster Recovery.
- Lasttest für WebRTC, WebSocket und Queue Worker.
- Kosten- und Kapazitätsplanung.

## Systemspezifische Regeln

- Prototyp beginnt schlank; Kubernetes ist keine Voraussetzung.
- Jeder Call ist über Session und Trace ID verfolgbar, ohne unnötige PII in Logs.
- Providerfehler werden getrennt von Produktfehlern gemessen.
- Backups gelten erst nach Restore Test.
- Alarme brauchen Nutzerwirkung und klare Reaktion.

## Lernprogramm

1. Instrumentiere den Vertical Slice vollständig.
2. Definiere SLOs aus Nutzerwirkung.
3. Teste Rollback und Wiederherstellung.
4. Injiziere Provider Timeout und Queue Stau.
5. Lastteste schrittweise mit realistischem Traffic.

## Pflichtartefakte

- Infrastructure as Code.
- Dashboard und Alert Rules.
- Incident und Restore Runbooks.
- Kapazitäts- und Lasttestbericht.
- Datenflusskarte mit Regionen.

## Abschlussprüfung

Ein dokumentierter Ausfall wird erkannt, eingegrenzt und wiederhergestellt. RTO und RPO werden gemessen. Keine behauptete Hochverfügbarkeit ohne Betriebsdaten.

## Gegenprüfer K10

Führe Restore Drill, gestaffelte Providerfehler und Alert Audit durch. Blockiere ungetestete Backups, PII Logs, fehlenden Rollback und Alarmrauschen ohne Handlungsanweisung.

