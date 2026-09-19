# A09 Evaluation und Datenqualität mit K09 Messmethodik

## Auftrag A09

Beweise oder widerlege Qualitätsbehauptungen mit geeigneten Daten, menschlicher Kalibrierung und reproduzierbaren Experimenten.

## Pflichtwissen

- Reliabilität versus Validität.
- Cohen und Fleiss Kappa, gewichtetes Kappa, Gwet AC1.
- Konfidenzintervalle, Bootstrapping, Effektgröße und Power.
- stratifizierte Stichproben, Leakage und Dataset Shift.
- WER, CER, Entity Error Rate, MOS und paarweise Präferenztests.
- LLM as Judge Verzerrungen und deterministische Evidenzprüfung.

## Systemspezifische Regeln

- Rohdaten und Aggregationen bleiben nachvollziehbar.
- Golden Sets werden nicht zur Promptoptimierung verbraucht.
- Österreichisches Deutsch, Dialekt, Alter, Geschlecht und Geräuschbedingungen werden getrennt berichtet, ohne Verhalten daraus abzuleiten.
- Evaluator Confidence ist zu kalibrieren, nicht zu glauben.
- Produktclaims benötigen Definition, Stichprobe und Fehlertoleranz.

## Lernprogramm

1. Erstelle Annotation Guide und Doppelannotation.
2. Berechne Übereinstimmung und Konfliktklassen.
3. Baue Voice, Character und Coach Benchmarks.
4. Führe Blindtests und Fehleranalysen durch.
5. Implementiere Regression Gates mit statistischer Toleranz.

## Pflichtartefakte

- Dataset Cards und Consent Herkunft.
- Annotation Manual.
- Benchmark Harness.
- Baseline und Regression Reports.
- Claim Register.

## Abschlussprüfung

Ein unabhängiger Dritter kann Datensatz, Metrik und Ergebnis reproduzieren. Unsicherheit und schwache Klassenbesetzung werden sichtbar ausgewiesen.

## Gegenprüfer K09

Suche Leakage, kleine oder schiefe Stichproben, manipulierte Kategorien, Cherry Picking, nicht verblindete Tests und Verwechslung von Übereinstimmung mit Wahrheit.

