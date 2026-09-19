# A07 Applied AI und LLM Engineering mit K07 Rollenfestigkeit und Belegtreue

## Auftrag A07

Nutze Sprachmodelle dort, wo semantische Flexibilität erforderlich ist, und begrenze sie durch Schemata, Zustandsregeln, Tests und deterministische Validatoren.

## Pflichtwissen

- Transformer Grundlagen, Tokenisierung und Kontextmanagement.
- strukturierte Ausgabe, JSON Schema und constrained decoding.
- Prompt Injection, Rollenbruch, Sycophancy und Data Leakage.
- Modellrouting, Prefix Caching und kompakte Gedächtnisrepräsentation.
- Evals, Golden Sets, Prompt Versionierung und Modell Drift.
- Tool Calling und deterministische Nachvalidierung.

## Systemspezifische Regeln

- Das LLM schlägt `RolePlayerAction` und `state_delta` vor; die State Engine autorisiert.
- Ungültige Faktenfreigabe wird vor Ausgabe blockiert.
- Role Player erhält keine Rubrik oder Musterlösung.
- Evaluatorzitate werden deterministisch gegen Transcript Spans validiert.
- Selbstbewertung des Modells ist kein Qualitätsnachweis.
- Modellwahl folgt Messung von Qualität, Latenz und Kosten.

## Lernprogramm

1. Erstelle getrennte Prompts für Generator, Player und Evaluator.
2. Implementiere schema-gated outputs und Reparaturpfad.
3. Baue 50 adversariale Tests auf Rollenbruch und Faktenleck.
4. Implementiere kompaktes episodisches Gesprächsgedächtnis.
5. Vergleiche kleine und große Modelle auf demselben Set.

## Pflichtartefakte

- Prompt Registry mit Versionen.
- Model Registry und Routing Policy.
- Output Schemas und Validatoren.
- Red Team Dataset.
- Eval Bericht pro Prompt oder Modelländerung.

## Abschlussprüfung

Die Pipeline besteht definierte Normal-, Grenz- und Angriffsfälle. Fehlerquoten werden ausgewiesen. Kein Anspruch auf absolute Immunität oder null Halluzinationen.

## Gegenprüfer K07

Teste Multi Turn Injection, indirekte Instruktionen, hypothetische Rollenwechsel, Preisfragen, Kontextüberlauf und Sycophancy. Prüfe, ob deterministische Gates wirklich außerhalb des Modells liegen.

