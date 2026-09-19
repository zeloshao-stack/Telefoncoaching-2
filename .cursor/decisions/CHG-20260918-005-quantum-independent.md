# CHG-20260918-005 — Unabhängiger Ideenlauf (Quantensprung, kein Cross-Talk)

```yaml
change_id: CHG-20260918-005
raw_request: "(1) Agenten nochmals los, hart im Themenfeld, Quantensprung, KEIN Austausch untereinander, Ergebnis dem Produktüberwacher, der mit Business Owner Umsetzung entscheidet, dann bauen. (2) KI zitiert keine Rechtsregeln/Telefonbuch, redet wie Mensch. (3) Gemini-Live-Speech-Vergleich: wie lösen UNSERE Agenten das."
user_outcome: "Unabhängig erzeugte Fachideen liegen als Paket bei A02 und dem Business Owner. Erst deren Umsetzungsentscheidung löst Bau aus. Zielwirkung danach: die Gegenseite spricht wie ein Mensch am Telefon, nicht wie ein Zitat aus Rechtsregel oder Telefonbuch; Stärken von Gemini Live Speech werden von unseren Rollen gelöst, nicht als Parität behauptet."
acceptance_criteria:
  - "Status bleibt IDEENLAUF, bis A02 und der User (Business Owner) schriftlich übernehmen / verschieben / verwerfen"
  - "A01–A14 liefern je ein isoliertes Ideendossier im eigenen Themenfeld; hart, Quantensprung-Ziel, kein Code, keine Contract-Änderung"
  - "Kein Austausch zwischen Fachrollen: keine Einsicht in fremde Dossiers, keine gemeinsame Datei, keine Abstimmung vor dem Paket"
  - "A00 bündelt die 14 Dossiers zu einem Paket und übergibt es A02 plus User; A02 entscheidet nicht in derselben Runde, in der A02 das eigene Dossier schreibt"
  - "Umsetzung erst nach dieser Entscheidung, und nur durch A00-Beauftragung genau EINER Primärrolle plus deren K-Gegenprüfer"
  - "Themenanker in jedem Dossier, soweit die Rolle berührt: (a) keine Rechtsregeln-/Telefonbuch-Zitate, Rede wie ein Mensch; (b) Gemini-Live-Speech-Vergleich als Frage: wie lösen UNSERE Agenten dasselbe, ohne Gemini einzubauen"
  - "Kein Qualitäts-, 2×- oder Anbieter-Paritäts-Claim in dieser Phase; Evidenzstufe höchstens HYPOTHESE"
non_goals:
  - "Austausch, Abstimmung oder gegenseitiges Lesen zwischen Fachrollen vor dem A02-Paket"
  - "Sofortiger All-15-Code, parallele Patches, Contract-Rewrites oder Tests als 'schon mal vorbauen'"
  - "Astra-Paritäts-Claim, Gemini-Paritäts-Claim, 2×-Claim, Blindtest-Versprechen ohne Stichprobe"
  - "Billing, Mandanten, Studio, Avatare, Kubernetes, Providerwechsel als Default"
  - "Gemini Live Speech als Produktionspfad in dieser Karte"
  - "Vollscan des Repositories"
primary_owner: A02
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
secondary_mode: ideen_only
affected_features: [role-player, live-call, character, voice, conversation-ux]
candidate_modules: []
candidate_symbols: []
contracts_at_risk: []
data_migrations: []
targeted_tests: []
quality_effect: "unbekannt in dieser Phase; Ideen dürfen Qualitätshypothesen nennen, nicht als VERIFIZIERT ausgeben"
cost_effect: "unbekannt; kein Modell- oder Providerwechsel ohne spätere A12-Prüfung nach BO-Entscheidung"
risk_level: medium
context_budget_tokens: 8000
full_scan_reason: null
status: IDEENLAUF
```

## A00 Routing

Diese Karte ist ein **Ideenlauf**, kein Bauauftrag. Kernel-Regel „genau eine Primärrolle“ gilt für **Implementierung**. Für Phase I gilt die Nutzerauflage: alle Fachrollen **isoliert**, **ohne Austausch**.

- **Orchestrator A00** — beauftragt A01–A14 getrennt, sammelt Dossiers, bildet das Paket, beauftragt später genau eine Bau-Primärrolle.
- **Ideen A01–A14** — je eigenes Themenfeld, Quantensprung, kein Code. A02 schreibt zuerst das eigene Dossier wie jede andere Rolle, **ohne** die übrigen Dossiers zu sehen.
- **Primär A02 (Produktüberwacher)** — erst **nach** Eingang des vollständigen Pakets, gemeinsam mit dem User als Business Owner: Übernehmen / Verschieben / Verwerfen, dann eine Bau-Primärrolle vorschlagen.
- **Gegenprüfer K02** — prüft die A02-Entscheidung (Scope, Transfer, unbelegte Claims), nicht die einzelnen Ideendossiers vorab.
- **Kein K-Freigabezyklus pro Idee** in Phase I. K-Arbeit beginnt mit der ersten Bau-Beauftragung.

Ausnahme zum All-15-Verbot: ausdrücklich vom Nutzer für **Ideen-only** angeordnet. Code durch alle 15 bleibt **non-goal**.

## Prozess (bindend)

### Phase I — IDEENLAUF (aktueller Status)

1. A00 beauftragt A01, A02, A03, A04, A05, A06, A07, A08, A09, A10, A11, A12, A13, A14 jeweils isoliert.
2. Kein Austausch untereinander. Keine Einsicht in fremde Ergebnisse. Keine Sammelbesprechung.
3. Jede Rolle bleibt hart im eigenen Zuständigkeitsfeld (`ROLE_INDEX.md`).
4. Lieferform: Ideendossier, kein Produktcode, keine Vertragsänderung, kein Testdurchlauf als Umsetzung.

### Phase II — PAKET an Produktüberwacher und Business Owner

5. A00 stellt die 14 Dossiers zu einem Paket zusammen, ohne die Ideen anzugleichen oder vorzubewerten als Bauauftrag.
6. Paket geht an **A02** und den **User (Business Owner)**.
7. A02 entscheidet mit dem Business Owner: übernehmen, verschieben oder verwerfen. Ergebnis ist eine empfohlene **eine** Primärrolle für den ersten Patch, plus explizite non-goals.

### Phase III — BAU (nicht dieser Status)

8. Erst nach Phase-II-Entscheidung beauftragt A00 **genau eine** Primärrolle.
9. Dann normal: A-Ergebnis, K-Gegenprüfung, Nachweis, Freigabe. Weitere Rollen nur bei echter Vertragsberührung.

## Themenanker für jedes Dossier

Jeder Chat beantwortet, soweit seine Zuständigkeit reicht, beide Produktfragen — als Idee, nicht als Patch:

1. **Mensch statt Regelbuch:** Die KI zitiert keine Rechtsregeln und kein Telefonbuch. Sie redet wie ein Mensch in diesem Anruf.
2. **Gemini-Live-Speech-Vergleich:** Was daran wirkt lebendig? Wie lösen **unsere** Agenten dasselbe in **unserer** Architektur (Role Player, State Engine, Voice Runtime getrennt)? Kein „wir nehmen Gemini“. Kein Paritätsclaim.

Quantensprung heißt: nicht Feinschliff am bestehenden Prompt-Stapel, sondern der kleinste Hebel, der das Gespräch glaubwürdig macht. Vorschläge bleiben `HYPOTHESE`, bis Phase III Nachweise hat.

## Abgrenzung zu vorigen Karten

- CHG-004 bleibt der letzte Bau-Stand zu Role-Player-Prompt und Live-Modell. Diese Karte überschreibt CHG-004 nicht und startet keinen zweiten parallelen Patch.
- CHG-003-Defer (Playback-Ack, VAD, episodischer Speicher) bleibt defer, bis A02+BO es in Phase II übernehmen.
- Astra-Parität bleibt non-goal (CHG-004). Gemini-Parität ist ebenfalls non-goal.

## Nachweis für Verlassen von IDEENLAUF

Nicht: „Ideen klingen gut“. Sondern: Paket übergeben, A02+BO-Entscheidung dokumentiert, A00-Bauauftrag an genau eine Primärrolle ausgestellt. Erst dann darf Produktcode entstehen.
