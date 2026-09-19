# Gesamtwissen – Telefonhandbuch und Vertriebscoach

## Zweck dieses Ordners

Dieser Ordner enthält den vollständigen fachlichen Ausgangsbestand für das KI-Telefoncoaching. Er ist für Entwicklung, Import, Review und Nachvollziehbarkeit bestimmt.

Er ist **nicht** die unmittelbare Laufzeit-KB. Die App ruft nur Wissenseinheiten ab, die in der Entwicklerwerkstatt strukturiert geprüft und in einem veröffentlichten Snapshot freigegeben wurden.

## Enthaltene Quellen

| Datei | Rolle im Gesamtwissen | Laufzeitstatus |
|---|---|---|
| `Rebuild-Brief_Produktforschung_2026-09-19.md` | Steal Gong/Hyperbound/Careertrainer + Produktbeschlüsse + Szenenkanon S01–S08 + Rebuild-Reihenfolge. Für ein anderes Modell zum Neuaufbau. | **Kein** Laufzeit-Prompt. Forschungsakte. |
| `Immobilien-Vertriebscoach_Knowledge-Base_v1.md` | Datenmodell, Abrufhierarchie, Playbooks, Skills, Antwortvertrag | Startbestand für den Q&A-Coach |
| `Quellen/Makler-Telefonhandbuch_und_KI-Bewertungsstandard_v1(1).md` | Telefonhandwerk und beobachtbare Bewertungsstandards | Quelle für Skills und Evaluator |
| `Quellen/Telefonsales-Master-Trainingshandbuch_Immobilienmakler_Wohnsegment_v1(1).md` | Trainingshandbuch für das Wohnsegment | Methodenquelle; nicht automatisch Zinshaus-Canon |
| `Quellen/Immobilien-Telefoncoach_Scoring-und-Szenenhandbuch_v1.1(1).md` | Szenenfelder, Rubriken, Anti-Patterns, Referenzlogik | Quelle; V1-Produktcanon 0–4/N/A hat Vorrang |
| `Quellen/Telefoncoach_Analyse-Bewertungs-und-Nutzerbuch_Immobilien_v1(1).md` | Analyse- und Coachingausgabe | Quelle für Evaluator und Repeat-Drill |
| `Quellen/Makler-Digitaler-Vertriebscoach_Handbuch-und-Wissensarchitektur_v1(1).md` | Vertriebscoach, Wissensarchitektur und Arbeitsweisen | Quelle für Q&A und Werkstatt |
| `Quellen/Makler-Telefonsales_Weltwissen-Methodebibliothek_v0.1(1).md` | wissenschaftlich/praktische Methodenbibliothek | Hintergrundquelle; keine automatische Regel |

## Vorrang bei Widersprüchen

1. Produktkern und V1-Canon im Projektbaum.
2. freigegebener Snapshot der Entwicklerwerkstatt.
3. szenenspezifische Rubrik mit ihrer Version.
4. Vertriebscoach-KB v1.
5. übrige Handbücher und Methodenquellen.

Insbesondere gilt für das sichtbare V1-Scoring die Skala `0–4 + N/A`. Frühere 0–10- oder 80/20-Modelle bleiben Recherchematerial, bis eine neue ausdrückliche Produktentscheidung getroffen wird.

## Importregel

Beim Import wird kein Dokument als Ganzes „aktiv“ geschaltet. Jede Aussage wird als `knowledge_unit`, Skill, Szenenregel, Scoringregel oder Beispiel klassifiziert, erhält Quelle, Grenzen, Evidenzgrad und Freigabestatus. Erst danach kann sie im Q&A-Coach oder Telefontool verwendet werden.
