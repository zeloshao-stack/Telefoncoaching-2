# CHG-20260918-006 — Deepsearch (Ideen-only, kein Cross-Talk)

```yaml
change_id: CHG-20260918-006
raw_request: "alle Agenten nochmals werken, Deepsearch, bestehende Produkte abschauen, BO nicht happy, viel tiefer, Zeit bis 02:00"
user_outcome: "Bis 2026-09-19 02:00 Europe/Vienna liegt ein tieferes, isoliert erzeugtes Forschungspaket bei A02 und dem Business Owner. Jede Fachrolle hat bestehende Produkte in ihrem Feld angesehen und tiefer geliefert als CHG-005. Kein Produktcode. GO-2 (A04) läuft parallel und bleibt unangetastet."
acceptance_criteria:
  - "status bleibt DEEPSEARCH, bis A00 das Paket an A02 plus User (Business Owner) übergeben hat und A02+BO schriftlich übernehmen / verschieben / verwerfen"
  - "A01–A14 liefern je ein isoliertes Deepsearch-Dossier im eigenen Themenfeld; Ideen-only; kein Produktcode; keine Contract-Änderung; kein Testdurchlauf als Umsetzung"
  - "Kein Cross-Talk: keine Einsicht in fremde Dossiers, keine gemeinsame Datei, keine Abstimmung, kein Angleichen vor dem Paket"
  - "Jedes Dossier enthält Deepsearch auf bestehende Produkte im eigenen Feld (Beobachtung, Quelle, was davon für Gate A / G2 relevant ist) — nicht ein erneutes Abschreiben von CHG-005"
  - "Tiefe vor Vollständigkeit: lieber wenige belegte Produktbeobachtungen als viele unbelegte Ideen; Evidenzstufe höchstens HYPOTHESE oder PLAUSIBEL aus Primärquelle, nie VERIFIZIERT ohne eigenen Nachweis"
  - "A00 bündelt die 14 Dossiers nach Eingang zu einem Paket und übergibt es A02 plus User; A02 entscheidet nicht in derselben Runde, in der A02 das eigene Dossier schreibt"
  - "primary_owner A02 gilt erst nach Paketeingang; davor ist A02 nur eine von 14 Forschungsrollen"
  - "Deadline: 2026-09-19 02:00 Europe/Vienna für Paketübergabe an A02+BO"
  - "GO-2 A04-Implementation (Barge-in-Sperre / Mic-Stop / Statusleitung) bleibt parallel unantastbar: diese Karte ändert keine GO-2-Dateien, keine GO-2-Verträge, keine GO-2-Tests"
  - "Umsetzung von Deepsearch-Ideen erst nach A02+BO-Entscheidung, und nur durch A00-Beauftragung genau EINER Primärrolle plus deren K-Gegenprüfer"
non_goals:
  - "Produktcode, Contract-Rewrites, parallele Patches, 'schon mal vorbauen', Testdurchläufe als Umsetzung"
  - "Cross-Talk, Sammelbesprechung, gegenseitiges Lesen, Angleichen der 14 Dossiers vor dem Paket"
  - "Eingriff in GO-2 A04-Implementation oder deren Review/Freigabe"
  - "Wiederholung oder Umschreibung der CHG-005-Dossiers ohne neue Produktbeobachtung"
  - "Repository-Vollscan; Deepsearch meint bestehende Produkte und öffentliche Quellen, nicht den gesamten eigenen Codebaum"
  - "Astra-/Gemini-/Anbieter-Paritäts-Claim, 2×-Claim, Blindtest-Versprechen ohne Stichprobe"
  - "Billing, Mandanten, Studio, Avatare, Kubernetes, Providerwechsel als Default"
  - "GO-1 wieder öffnen oder Sprechkanal-Patch anfassen"
  - "Rechtskonformität selbst garantieren"
primary_owner: A02
primary_owner_activates: nach_paketeingang
reviewer: K02
orchestrator: A00
secondary:
  - A01
  - A02
  - A03
  - A04
  - A05
  - A06
  - A07
  - A08
  - A09
  - A10
  - A11
  - A12
  - A13
  - A14
secondary_mode: research_deepsearch
affected_features: []
candidate_modules: []
candidate_symbols: []
contracts_at_risk: []
data_migrations: []
targeted_tests: []
quality_effect: "unbekannt in dieser Phase; Dossiers dürfen Qualitätshypothesen aus Produktbeobachtung nennen, nicht als VERIFIZIERT ausgeben"
cost_effect: "unbekannt; kein Modell- oder Providerwechsel ohne spätere A12-Prüfung nach BO-Entscheidung"
risk_level: high
context_budget_tokens: 8000
full_scan_reason: null
status: DEEPSEARCH
deadline: "2026-09-19 02:00 Europe/Vienna"
parallel_untouchable: "CHG-20260918-005 GO-2 A04 Implementation"
```

## A00 Routing

Diese Karte ist ein **Deepsearch-Ideenlauf**, kein Bauauftrag. Der Business Owner ist mit der Tiefe von CHG-005 nicht zufrieden. Deshalb arbeiten alle Fachrollen **nochmals**, **isoliert**, **tiefer**, mit Blick auf **bestehende Produkte**.

Kernel-Regel „genau eine Primärrolle“ gilt für **Implementierung**. Für DEEPSEARCH gilt die Nutzerauflage: alle Fachrollen isoliert, ohne Austausch, ohne Code.

- **Orchestrator A00** — beauftragt A01–A14 getrennt, sammelt Dossiers, bildet das Paket bis zur Deadline, beauftragt später genau eine Bau-Primärrolle.
- **Research A01–A14** — je eigenes Themenfeld (`ROLE_INDEX.md`), Deepsearch, bestehende Produkte, kein Code. A02 schreibt zuerst das eigene Dossier wie jede andere Rolle, **ohne** die übrigen Dossiers zu sehen.
- **Primär A02 (Produktüberwacher)** — erst **nach Paketeingang**, gemeinsam mit dem User als Business Owner: Übernehmen / Verschieben / Verwerfen, dann eine Bau-Primärrolle vorschlagen.
- **Gegenprüfer K02** — prüft die A02-Entscheidung nach Paketeingang (Scope, Transfer, unbelegte Claims), nicht die einzelnen Dossiers vorab.
- **Kein K-Freigabezyklus pro Idee** in DEEPSEARCH. K-Arbeit beginnt mit der ersten Bau-Beauftragung.

Ausnahme zum All-15-Verbot: ausdrücklich vom Nutzer für **Ideen-only / Research** angeordnet. Code durch alle 15 bleibt **non-goal**.

## Prozess (bindend)

### Phase I — DEEPSEARCH (aktueller Status)

1. A00 beauftragt A01, A02, A03, A04, A05, A06, A07, A08, A09, A10, A11, A12, A13, A14 jeweils isoliert.
2. Kein Cross-Talk. Keine Einsicht in fremde Ergebnisse. Keine Sammelbesprechung.
3. Jede Rolle bleibt hart im eigenen Zuständigkeitsfeld.
4. Lieferform: Deepsearch-Dossier, kein Produktcode, keine Vertragsänderung, kein Testdurchlauf als Umsetzung.
5. GO-2 A04-Implementation bleibt parallel **unantastbar**. A04-Research darf nur ein Ideendossier schreiben und keine GO-2-Dateien berühren.

### Phase II — PAKET an Produktüberwacher und Business Owner

6. A00 stellt die 14 Dossiers zu einem Paket zusammen, ohne die Ideen anzugleichen oder vorzubewerten als Bauauftrag.
7. Paket geht an **A02** und den **User (Business Owner)** bis **2026-09-19 02:00 Europe/Vienna**.
8. A02 entscheidet mit dem Business Owner: übernehmen, verschieben oder verwerfen. Ergebnis ist eine empfohlene **eine** Primärrolle für den nächsten Patch, plus explizite non-goals.

### Phase III — BAU (nicht dieser Status)

9. Erst nach Phase-II-Entscheidung beauftragt A00 **genau eine** Primärrolle.
10. Dann normal: A-Ergebnis, K-Gegenprüfung, Nachweis, Freigabe. Weitere Rollen nur bei echter Vertragsberührung.

## Deepsearch-Auftrag für jedes Dossier

„Viel tiefer“ heißt: nicht Feinschliff und nicht CHG-005 wiederholen. Jede Rolle liefert im eigenen Feld:

1. **Bestehende Produkte ansehen** — konkrete Produkte, Flows oder Hör-/UX-Belege aus öffentlicher Quelle. Was tun andere in diesem Feld, das bei uns fehlt oder falsch sitzt?
2. **Beobachtung trennen** — was gesehen wurde (Quelle, Datum, Grenze der Quelle) versus was daraus als Idee folgt.
3. **Gate-A / G2-Filter** — nur Hebel, die ein glaubwürdiges Gespräch im Browser, Barge-in, Auflegen oder Charakterkonsistenz betreffen. Kein Studio, kein Billing, kein Mandant.
4. **Kleinster Hebel** — der kleinste nächste Schritt, der das Gespräch glaubwürdiger macht, als `HYPOTHESE`.

Kein Qualitäts-, 2×- oder Anbieter-Paritäts-Claim. Kein „wir nehmen Produkt X“.

## Abgrenzung zu vorigen Karten

- CHG-005 IDEENLAUF und das Entscheidungspaket bleiben historisch. Diese Karte überschreibt sie nicht und startet keinen zweiten parallelen Patch auf GO-1.
- CHG-005 GO-1 Sprechkanal bleibt `FREIGEGEBEN`. Nicht wieder öffnen.
- CHG-005 GO-2 A04-Implementation läuft **parallel** und ist **unantastbar**. Diese Karte darf sie weder stoppen noch „mitbauen“ noch in denselben Dateien arbeiten.
- CHG-005 GO-3 und DEFER bleiben unverändert, bis A02+BO sie in Phase II dieser Karte ausdrücklich übernehmen.
- CHG-004 bleibt letzter Bau-Stand zu Role-Player-Prompt und Live-Modell, vorbehaltlich des bereits freigegebenen GO-1-Sprechkanals.
- Astra-Parität und Gemini-Parität bleiben non-goals.

## Nachweis für Verlassen von DEEPSEARCH

Nicht: „Ideen klingen tiefer“. Sondern: Paket an A02+BO übergeben (Ziel 2026-09-19 02:00 Europe/Vienna), A02+BO-Entscheidung dokumentiert, A00-Bauauftrag an genau eine Primärrolle ausgestellt. Erst dann darf aus dieser Karte Produktcode entstehen. GO-2-Code entsteht nur aus der bestehenden GO-2-Beauftragung, nicht aus dieser Karte.
