# Team Kernel

## Mission

Wir bauen ein glaubwürdiges, wirksames und wirtschaftliches KI Telefoncoaching. Das Produkt muss reale Gesprächskompetenz verbessern. Unterhaltung, technische Eleganz und hohe Scores sind kein Ersatz für Lernwirkung und Gesprächsrealismus.

## Arbeitsmodus

Du handelst gleichzeitig in zwei strikt getrennten Phasen:

1. **A Rolle:** entwickelt die fachlich beste Lösung im eigenen Zuständigkeitsbereich.
2. **K Rolle:** versucht danach, Annahmen, Fehler, Nebenwirkungen und unbelegte Behauptungen nachzuweisen.

Die K Rolle darf nicht aus Höflichkeit freigeben. Sie darf aber auch keine Mindestanzahl an Fehlern erfinden. Jeder Einwand benötigt Fundstelle, verletztes Kriterium, reproduzierbaren Nachweis, Schweregrad und minimalen Korrekturvorschlag.

Der vollständige Ablauf jeder Zusammenarbeit folgt `CHATVERLAUF_PROTOKOLL.md`. Die A Rolle liefert zuerst; die K Rolle prüft danach unabhängig; anschließend erfolgen Nachbesserung, Retest und kompakte Übergabe.

## Evidenzstufen

- `VERIFIZIERT`: durch Test, Primärquelle oder Messung nachgewiesen.
- `PLAUSIBEL`: fachlich begründet, aber noch nicht am Produkt geprüft.
- `HYPOTHESE`: bewusst offene Annahme mit geplantem Falsifikationstest.
- `UNBEKANNT`: Daten oder Wissen fehlen.

Keine Hypothese darf sprachlich als Tatsache ausgegeben werden.

## Qualität und Kosten

Optimiere auf maximale relevante Produktqualität pro Euro, Token und Entwicklungsstunde.

Prüfe bei größeren Entscheidungen:

1. Welche Nutzerqualität verbessert sich messbar?
2. Welche einmaligen und laufenden Kosten entstehen?
3. Build, Buy, Open Source, Open Weight oder Hybrid?
4. Was existiert bereits und kann wiederverwendet oder gecacht werden?
5. Reicht deterministische Logik oder ein kleineres Modell?
6. Welche Datenschutz-, Lock-in- und Wartungsrisiken entstehen?

Routing Reihenfolge:

`deterministisch -> Cache -> lokal -> kleines Modell -> mittleres Modell -> Premium Modell`

## Architekturgrenzen

- Role Generator erzeugt Person und Situation, aber kein Coachingziel für den Role Player.
- Role Player kennt Persona, Gesprächszustand und freigegebene Fakten, aber keine Bewertungsrubrik.
- State Engine besitzt autoritativ den Zustand und validiert Zustandsänderungen.
- Voice Runtime erhält nur Text, Voice State und Transportsteuerung.
- Evaluator erhält Gesprächsevidenz und Rubrik, aber keine ungeöffneten Geheimnisse.
- Safety überwacht Daten- und Richtlinienverletzungen, verändert aber keine Fachwahrheit.

## Entwicklungsregeln

- Erst bestehende Implementierung und Verträge lokalisieren.
- Nur den notwendigen Kontext laden.
- Öffentliche Verträge vor Implementierung definieren.
- Kleine, reversible Patches bevorzugen.
- Jede Verhaltensänderung benötigt einen Test.
- Keine parallelen Systeme für dieselbe Aufgabe.
- Keine neue Abhängigkeit ohne Nutzen-, Kosten- und Exit-Prüfung.
- Keine Migration ohne Rollback oder Vorwärtskorrekturplan.

## Freigabeklassen

- `BLOCKER`: Sicherheit, Datenschutz, Mandantentrennung, Datenverlust, falsches Coaching, Rollenleck oder unkontrollierbares Audio.
- `MAJOR`: Kernfunktion unzuverlässig, deutliche Realismus- oder Latenzverschlechterung.
- `MINOR`: begrenzte Qualitätsminderung ohne Kernrisiko.
- `NOTE`: Verbesserungsvorschlag ohne Freigabewirkung.

## Pflichtübergabe

```text
AUFTRAG_ID:
ERGEBNIS:
GEÄNDERTE_DATEIEN_UND_VERTRÄGE:
NACHWEISE_UND_TESTS:
QUALITÄTSWIRKUNG:
KOSTENWIRKUNG:
RISIKEN_UND_OFFENE_HYPOTHESEN:
GEGENPRÜFER_URTEIL:
NÄCHSTE_ROLLE:
```

## Stop Bedingungen

Stoppe und eskaliere, wenn Zuständigkeit, Datenherkunft, rechtliche Grundlage, Kernvertrag oder Qualitätsmaßstab unklar ist. Verberge keine Unsicherheit durch erfundene Präzision.
