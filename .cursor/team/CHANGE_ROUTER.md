# Change Router für Sprachbefehle

## Ziel

Ein Sprachbefehl darf nicht automatisch einen vollständigen Repository Scan oder einen allgemeinen Neuaufbau auslösen. Er wird zuerst in eine maschinenlesbare Change Card übersetzt.

## Change Card

```yaml
change_id: CHG-YYYYMMDD-NNN
raw_request: "Originaler Sprachbefehl"
user_outcome: "Beobachtbare gewünschte Wirkung"
acceptance_criteria: []
non_goals: []
primary_owner: A00-A14
reviewer: K01-K14
affected_features: []
candidate_modules: []
candidate_symbols: []
contracts_at_risk: []
data_migrations: []
targeted_tests: []
quality_effect: unknown
cost_effect: unknown
risk_level: low|medium|high|critical
context_budget_tokens: 8000
full_scan_reason: null
```

## Routingprozess

1. Sprachbefehl wortgetreu sichern.
2. Gewünschte Nutzerwirkung von vorgeschlagener Lösung trennen.
3. Feature Map nach zuständiger Rolle durchsuchen.
4. Repository Map, Symbolindex und Dependency Graph abfragen.
5. Nur betroffene Dateien, Verträge und Tests laden.
6. Impact Plan vor Codeänderung erstellen.
7. Kleinsten sicheren Patch umsetzen.
8. Zieltests, Vertragstests und risikobasierte Nachbartests ausführen.
9. Gegenprüfer entscheidet anhand von Evidenz.
10. Repository Map und Entscheidungsregister aktualisieren.

## Vollscan erlaubt bei

- unklarem oder widersprüchlichem Auftrag,
- veralteter oder unvollständiger Repository Map,
- Änderung von Authentifizierung, Mandantengrenzen oder Sicherheitskern,
- Änderung geteilter Kernverträge oder Datenmodelle,
- Framework Major Upgrade,
- großer Migration oder Refactoring,
- unerwarteten Regressionen außerhalb des angenommenen Impact Radius.

## Minimaler Repository Index

```text
repo_map.json
feature_map.json
dependency_graph.json
ownership.yaml
contracts/
decisions/
tests/test_map.json
prompts/prompt_registry.json
models/model_registry.json
```

## Beispiel

Sprachbefehl: „Bei Unsicherheit soll Herr Gruber länger pausieren und leiser sprechen.“

Routing:

- Primär A14 Voice Performance und Prosodie.
- Sekundär A13 Character Psychology für Emotionszustand.
- Vertrag zwischen Behavior State und Voice State betroffen.
- A06 nur bei Änderung der Streaming- oder Pausenwiedergabe.
- Keine Änderung an Billing, Auth, Evaluation oder Datenbank.
- Tests: Voice-State Mapping, Pausendauer, Barge-in während Pause, menschlicher Hörtest.

