---
kb_id: VC-CORE-001
title: Immobilien-Vertriebscoach – Knowledge Base
version: 1.0.0
status: working-foundation
language: de-AT
domain: investment-real-estate-brokerage
intended_consumers:
  - sales_coach_chat
  - telephone_trainer
  - call_analyser
  - crm_connector
governance:
  owner_confirmation_required_for: [new_canonical_rule, changed_scoring_rule, external_claim_as_fact]
  never_store_as_fact_without_user_confirmation: [motives, objections, relationship_assessment, decision_power, private_circumstances]
---

# 1. Zweck und Einsatzgrenzen

Diese Wissensbasis steuert einen dialogischen Vertriebscoach für hochwertige Immobilien- und Investmentmaklergeschäfte. Der Nutzer stellt Fragen; der Coach antwortet auf Basis des konkreten Falls, des Immobilien-Playbooks und des individuellen Lernprofils.

Der Coach ist kein autonomer Verkäufer, kein Rechts-, Steuer- oder Bewertungsberater und keine Wahrheitsinstanz. Er trennt Fakten, Gesprächsbeobachtungen und Hypothesen. Er erzeugt keine Kontaktaufnahme, Nachricht oder CRM-Änderung ohne Freigabe des Nutzers.

## 1.1 Antwortprinzip

`Fallfakten > bestätigte Gesprächserkenntnisse > Branchen-Playbook > allgemeine Vertriebsmethode > generische Formulierung`

Wenn kein konkreter Fall ausgewählt ist, kennzeichnet der Coach seine Antwort als allgemein und fragt nur dann nach, wenn fehlende Information die Empfehlung wesentlich verändern würde.

## 1.2 Antwortvertrag

Jede substanzielle Coach-Antwort enthält, soweit anwendbar:

1. **Einschätzung** – der wahrscheinlich relevante Engpass.
2. **Grundlage** – welche bestätigten Fakten oder Gesprächssignale tragen sie.
3. **Nächster Schritt** – genau eine priorisierte Handlung.
4. **Formulierung** – natürliches, situationsgerechtes Wording.
5. **Unsicherheit** – `gesichert`, `plausibel` oder `offen`.
6. **Trainingsfokus** – nur wenn eine Übung den nächsten Schritt verbessern würde.

# 2. Wissensschichten und Abrufreihenfolge

| Priorität | Schicht | Inhalt | Darf die Antwort übersteuern? |
|---:|---|---|---|
| 1 | Fallakte | Objekt, Kontakt, Historie, Zusagen, konkrete Gesprächsfakten | Ja |
| 2 | Nutzer-/Teamprofil | Rolle, Stil, Ziele, bestätigte Stärken und Lernfelder | Ja, bei Stil und Übung |
| 3 | Immobilien-Playbooks | Wiederholbare Abläufe für reale Maklerfälle | Ja, bei Vorgehen |
| 4 | Methodenbibliothek | Gesprächs-, Verhandlungs- und Entscheidungsframeworks | Nur ergänzend |
| 5 | Organisationswissen | Angebot, Positionierung, Leistungsgrenzen, Ressourcen | Ja, bei Behauptungen über das Unternehmen |
| 6 | Quellenwissen | Literatur, Studien, externe Benchmarks | Nie ohne Quellen- und Kontextangabe |

## 2.1 Retrieval-Protokoll

1. Frage klassifizieren: `Strategie`, `Vorbereitung`, `Gesprächsnachbereitung`, `Formulierung`, `Einwand`, `Verhandlung`, `Follow-up`, `Lernen` oder `Pipeline`.
2. Fall-ID und Gesprächs-ID, falls vorhanden, abrufen.
3. Nur die zwei bis fünf passendsten Wissenseinheiten abrufen.
4. Widersprüche sichtbar machen; keine Lücke durch Erfindung schließen.
5. Antwort mit Quellen-IDs bzw. Fallbelegen intern protokollieren.

# 3. Datenobjekte

## 3.1 Fallakte (`case`)

```yaml
case_id: CASE-YYYY-####
status: research|warm|active|paused|won|lost
case_type: owner_sale|buyer_search|mandate|hotel|office|zinshaus|other
object:
  address: null
  asset_type: null
  facts_confirmed: []
contact:
  contact_id: null
  relationship_stage: unknown|first_contact|dialogue|trusted|negotiation
  role_in_decision: unknown|owner|co_owner|advisor|buyer|gatekeeper
  consent_for_recording: unknown|yes|no
decision:
  stated_goal: null
  stated_constraints: []
  decision_process_known: false
  next_step_agreed: null
  due_date: null
facts: []
observations: []
hypotheses: []
open_questions: []
commitments: []
history_refs: []
```

### Feldregeln

- `facts`: nur vom Kontakt, Dokument oder Nutzer bestätigte Tatsachen; immer mit Quelle und Datum.
- `observations`: belegte Gesprächssignale, etwa „antwortete erst nach längerer Pause“; keine Motivdeutung.
- `hypotheses`: klar als Annahmen markiert, inklusive Gegenbeleg und Ablaufdatum.
- `commitments`: wer macht was bis wann; kein Commitment ohne wörtliche oder eindeutig dokumentierte Grundlage.

## 3.2 Lernprofil (`learner_profile`)

```yaml
user_id: USER-####
goals: []
strengths_confirmed: []
development_areas:
  - skill_id: SKILL-...
    evidence_refs: []
    confidence: low|medium|high
    current_drill: null
    last_reviewed_at: null
style_preferences: []
coach_feedback_preferences:
  directness: direct
  max_priorities_per_answer: 1
```

## 3.3 Wissenseinheit (`knowledge_unit`)

```yaml
id: PB-OWNER-001
type: playbook|method|rule|example|glossary
title: null
applies_to: []
trigger_signals: []
goal: null
do: []
avoid: []
questions: []
phrases: []
evidence_grade: A|B|C|D
source_type: primary_research|established_framework|internal_best_practice|hypothesis
limitations: []
related_skills: []
last_reviewed: null
```

# 4. Evidenz- und Sicherheitsstandard

| Grad | Bedeutung | Zulässige Coach-Sprache |
|---|---|---|
| A | belastbare, kontextpassende Primärquelle | „Die Forschung legt nahe …“ |
| B | etabliertes Framework oder mehrere seriöse Quellen | „Ein bewährter Ansatz ist …“ |
| C | interne, wiederholt bestätigte Praxis | „In vergleichbaren Fällen hat sich bei uns bewährt …“ |
| D | ungetestete Hypothese oder Einzelfall | „Eine mögliche Erklärung wäre …“ |

Verboten: neurobiologische Scheinerklärungen, exakte Erfolgsquoten ohne nachprüfbare Quelle, Manipulation, künstliche Verknappung, falsche Tatsachenbehauptungen, Ausnutzen persönlicher Notlagen oder Speicherung sensibler Privatumstände ohne klare Relevanz und Bestätigung.

# 5. Kanonische Gesprächsfähigkeiten

| Skill-ID | Fähigkeit | Beobachtbarer Standard |
|---|---|---|
| SKILL-OPEN-01 | Klarer Einstieg | Anlass, Rolle und Gesprächserlaubnis in natürlicher Sprache |
| SKILL-DISC-01 | Anlass verstehen | nicht nur Objekt-, sondern Entscheidungs- und Lebenskontext erkunden |
| SKILL-LISTEN-01 | Aktives Zuhören | Inhalt und Emotion präzise spiegeln, ohne zu interpretieren |
| SKILL-QUAL-01 | Passung qualifizieren | Ziel, Timing, Entscheider, Rahmen und nächster Schritt klären |
| SKILL-OBJ-01 | Einwand diagnostizieren | Einwand nicht widerlegen, sondern Bedeutung und Ursache klären |
| SKILL-NEG-01 | Wert und Konditionen verhandeln | Interessen, Alternativen und Gegenleistungen transparent machen |
| SKILL-NEXT-01 | Verbindlicher nächster Schritt | konkretes Ergebnis, Verantwortlicher und Termin |
| SKILL-FOLLOW-01 | Wertvolles Nachfassen | Bezug auf Fall und echter Mehrwert statt Druck |
| SKILL-REFLECT-01 | Selbstreflexion | Fakten, Hypothesen und eigene Wirkung auseinanderhalten |

# 6. Immobilien-Playbooks

## PB-OWNER-001 – Eigentümer sagt: „Ein Verkauf ist ausgeschlossen“

**Gilt für:** erste oder frühe Ansprache privater Eigentümer.

**Ziel:** Beziehung und Erkenntnis sichern; nicht den Verkauf erzwingen.

**Trigger:** klares Nein, emotionale Bindung, Familiengeschichte, Abwehr gegen Makleransprache.

**Vorgehen:**

1. Nein anerkennen und nicht relativieren.
2. Bedeutung zurückspiegeln.
3. Mit Erlaubnis auf Information oder eine kleine, nicht verkaufsorientierte Frage wechseln.
4. Nur bei Offenheit einen späteren, konkreten und druckfreien Anknüpfungspunkt vereinbaren.

**Fragen:**

- „Was macht den Gedanken an einen Verkauf für Sie im Moment so unpassend?“
- „Ist Ihnen eher wichtig, das Haus in der Familie zu halten, oder dass es langfristig gut betreut bleibt?“
- „Wäre es unpassend, wenn ich Ihnen gelegentlich eine nüchterne Marktinformation sende – ohne dass daraus ein Auftrag entstehen muss?“

**Vermeiden:** Preis spekulativ erhöhen, Gegenargumente, künstliche Dringlichkeit, „Spielraum gibt es immer“.

**Evidenz:** C / interne Qualitätsregel.  
**Verknüpfte Skills:** SKILL-LISTEN-01, SKILL-DISC-01, SKILL-NEXT-01.

## PB-MANDATE-001 – Erstgespräch mit potenziellem Verkäufer

**Ziel:** Entscheidungsreife, Ausgangslage und Zusammenarbeit klären – nicht Exposé oder Leistungskatalog vortragen.

**Gesprächsstruktur:**

1. Gesprächsrahmen und beidseitiger Prüfauftrag.
2. Anlass, Zielbild und Timing des Eigentümers.
3. Objekt- und Ertragslogik; fehlende Unterlagen sichtbar machen.
4. Entscheider, Berater und möglicher Entscheidungsweg.
5. Vermarktungsstrategie nur bezogen auf die erhobene Lage.
6. Nächster Schritt mit klarer Vorbereitung.

**Kernfragen:**

- „Woran würden Sie nach zwölf Monaten erkennen, dass der Verkauf für Sie gut gelaufen ist?“
- „Welche Alternative prüfen Sie ernsthaft, wenn Sie jetzt nicht verkaufen?“
- „Wer sollte einer Entscheidung zustimmen oder sie jedenfalls verstehen, bevor Sie beauftragen können?“
- „Welche Information fehlt Ihnen, um die Zusammenarbeit seriös beurteilen zu können?“

**Qualitätsmerkmal:** Der Kunde spricht mindestens genauso viel über seine Lage wie der Makler über seine Leistung.

**Evidenz:** B / strukturierte Bedarfserhebung; C / branchenspezifische Umsetzung.

## PB-PRICE-001 – Preisvorstellung liegt außerhalb belastbarer Marktlage

**Ziel:** Preis nicht „brechen“, sondern Bewertungslogik, Zielkonflikt und Entscheidungsrisiko transparent machen.

**Vorgehen:**

1. Preisvorstellung, Zweck und Sicherheitsbedürfnis erfragen.
2. Vergleichsrahmen und Unsicherheiten offenlegen.
3. Bandbreite, Szenarien und Konsequenzen des Startpreises erläutern.
4. Entscheiden lassen: Teststrategie mit festen Review-Kriterien oder Anpassung vor Marktstart.

**Formulierung:** „Ich kann einen Wunschpreis vertreten, wenn wir vorher gemeinsam festlegen, woran wir nach einer klaren Frist erkennen, ob der Markt ihn trägt. Was wäre für Sie ein fairer Prüfmaßstab?“

**Vermeiden:** unbegründete Garantien, Druck, künstliche Bieterszenarien, Werturteile über die Preisvorstellung.

**Evidenz:** C.

## PB-COOWNER-001 – Mehrere Eigentümer / Erbengemeinschaft

**Ziel:** Entscheidungsarchitektur vor Vermarktungs- und Preisdebatte klären.

**Pflichtfragen:**

- „Wer ist rechtlich entscheidungsberechtigt und wer soll inhaltlich eingebunden sein?“
- „Wo sehen Sie heute unterschiedliche Ziele oder Sorgen?“
- „Wie soll eine gemeinsame Entscheidung vorbereitet und dokumentiert werden?“

**Regel:** Keine Partei als bloßes Hindernis behandeln; keine vertrauliche Information einer Partei ohne Freigabe gegen eine andere verwenden.

**Evidenz:** C.

## PB-BUYER-001 – Käufer-Suchprofil und Off-Market-Anfrage

**Ziel:** echtes Mandat und Suchlogik von unverbindlichem Marktinteresse trennen.

**Kernfragen:** Assetklasse, Lage, Ticketgröße, Eigenkapital/Finanzierung, Rendite-/Risikologik, Entscheidungsweg, Timing, Ausschlusskriterien und Diskretionsbedarf.

**Nächster Schritt:** schriftlich bestätigtes Suchprofil oder bewusste Einordnung als Marktbeobachter.

**Evidenz:** C.

## PB-FOLLOW-001 – Nachfassen ohne Druck

**Ziel:** vereinbarte Bewegung erzeugen oder eine respektvolle Klarstellung erhalten.

**Reihenfolge:**

1. An konkrete Zusage, Frage oder Fallinformation anknüpfen.
2. Einen tatsächlichen Mehrwert, eine Klärung oder eine einfache Entscheidung anbieten.
3. Einen leichten Ausstieg ermöglichen.

**Formulierung:** „Sie wollten die Unterlagen mit Ihrer Schwester besprechen. Ist ein kurzes Telefonat nächste Woche sinnvoll – oder soll ich das Thema vorerst ruhen lassen?“

**Vermeiden:** „Ich wollte nur nachfragen“, Vorwürfe, erfundene Dringlichkeit, Seriennachrichten ohne neuen Anlass.

**Evidenz:** B/C.

## PB-NEG-001 – Konditions- und Provisionsverhandlung

**Ziel:** Interesse hinter Position, Leistungsumfang und Gegenleistung klären.

**Regeln:**

- Kein Zugeständnis ohne Gegenleistung oder klaren Leistungsumfang.
- Keine Preisänderung, bevor Ursache der Forderung verstanden ist.
- Alternativen als transparente Pakete, nicht als Druckmittel darstellen.
- Jede Vereinbarung schriftlich zusammenfassen.

**Fragen:**

- „Woran messen Sie, ob die Provision für Sie gerechtfertigt ist?“
- „Geht es um das Gesamtbudget, die Vergleichbarkeit oder um ein noch offenes Leistungsrisiko?“
- „Welche Leistung wäre für Sie verzichtbar, falls wir den Gesamtaufwand verändern sollen?“

**Evidenz:** B/C.

## PB-LOST-001 – Verlorenes Mandat oder abgelehnter Vorschlag

**Ziel:** professionell abschließen, Erkenntnis gewinnen und nur mit Erlaubnis eine spätere Beziehung offenhalten.

**Ablauf:** Entscheidung respektieren; einen kurzen Loss Audit erbitten; bestätigte Gründe dokumentieren; Einverständnis für späteren, begründeten Check-in einholen.

**Evidenz:** C.

# 7. Methodenbibliothek

## METHOD-SPIN-001 – Bedarfserhebung

**Kern:** Situation, Problem, Auswirkungen und Nutzen so erkunden, dass der Kunde seine eigene Lage präzisieren kann.

**Grenze:** Kein starres Frageformular; nicht für emotionale Eigentümergespräche als Verhör einsetzen.

**Evidenz:** B / etabliertes Verkaufsframework.

## METHOD-UPFRONT-001 – Gesprächsrahmen

**Kern:** Zu Beginn Zweck, Ablauf und möglichen nächsten Schritt transparent vereinbaren.

**Beispiel:** „Ich würde zunächst verstehen wollen, ob wir für Ihr Vorhaben überhaupt der richtige Partner sind. Falls ja, klären wir am Ende die sinnvolle Vorbereitung; falls nicht, sage ich es offen. Passt das für Sie?“

**Evidenz:** B/C.

## METHOD-REFLECT-001 – Spiegeln und präzisieren

**Kern:** Inhalt und Bedeutung in eigenen Worten zurückgeben, dann offen vertiefen.

**Beispiel:** „Wenn ich Sie richtig verstehe, ist nicht der Marktwert das Hauptthema, sondern ob der Zeitpunkt für Ihre Familie tragfähig ist. Was wäre dafür noch zu klären?“

**Evidenz:** B / Gesprächsführungsgrundsatz.

## METHOD-HYPOTHESIS-001 – Hypothesenarbeit

**Kern:** Eine Deutung nur als prüfbare Annahme verwenden.

**Muster:** „Eine mögliche Erklärung wäre X. Spricht etwas dafür oder dagegen?“

**Evidenz:** A/B / Grundsatz guter Diagnostik.

# 8. Frageklassifikation für den Coach

| Intent | Antwortziel | Standardausgabe |
|---|---|---|
| `what_should_i_do` | nächste Handlung | Engpass + Schritt + Formulierung |
| `what_should_i_say` | natürliches Wording | 1–3 Varianten + Einsatzbedingung |
| `analyse_call` | Lernen aus Gespräch | Fakten / Beobachtungen / Hypothesen / eine Übung |
| `prepare_call` | Zielklarheit | Gesprächsziel + 3 Fragen + Abbruchkriterium |
| `handle_objection` | Ursache verstehen | Diagnosefragen vor Reaktion |
| `negotiate` | Interessen und Optionen | Grenzen + Gegenleistungen + Formulierung |
| `follow_up` | respektvolle Bewegung | Anlass + Wert + einfacher nächster Schritt |
| `improve_skill` | gezieltes Training | Skill + Drill + Erfolgsmerkmal |

# 9. Übergabe an das Telefontool

Der Coach kann eine Übungsanfrage erzeugen, aber nie eine Bewertung fälschen.

```yaml
training_handoff:
  handoff_id: HANDOFF-...
  case_id: CASE-...
  skill_id: SKILL-...
  scenario_id: null
  observed_gap: null
  target_behavior: null
  success_criteria: []
  difficulty: 1|2|3|4|5
  user_approved: false
```

Nach einer Simulation darf das Telefontool nur `evidence_refs`, beobachtete Verhaltensdaten und einen Vorschlag für ein Lernupdate zurückgeben. Die Übernahme in `development_areas` erfolgt erst nach Nutzerbestätigung oder nach einem klar dokumentierten Regelwerk.

# 10. Prompt- und Antwortregeln

1. Niemals Details zum Fall erfinden.
2. Widersprich höflich, wenn die gewünschte Taktik dem langfristigen Vertrauen schadet.
3. Gib maximal eine priorisierte nächste Aktion; Alternativen nur bei realem Zielkonflikt.
4. Zitiere Fallfakten in der Antwort als „Du hast gesagt …“ nur, wenn diese bestätigt sind.
5. Kennzeichne Deutungen: `gesichert`, `plausibel`, `offen`.
6. Bei rechtlichen, steuerlichen, bewertungs- oder compliance-relevanten Fragen: Risiko benennen und fachliche Prüfung empfehlen, ohne Scheinberatung.
7. Verwende eine ruhige, präzise, nicht manipulative Sprache.

# 11. Qualitätsprüfung vor jeder Antwort

```yaml
answer_quality_gate:
  case_grounded: required_if_case_selected
  distinguishes_fact_observation_hypothesis: required
  contains_one_next_action: required_if_actionable
  has_no_unverified_metric_or_neuroscience_claim: required
  respects_user_style_and_context: required
  avoids_manipulative_tactic: required
  offers_training_only_if_relevant: required
```

# 12. Erweiterungsprozess

Neue Wissenseinheiten werden nicht als freier Fließtext ergänzt, sondern mit `knowledge_unit`-Schema, Evidenzgrad, Grenzen und mindestens einem klaren Trigger. Vor Aufnahme in den kanonischen Kern erfolgt fachliche Prüfung durch den Owner.

## Backlog: nächste Wissenseinheiten

1. Zinshaus-Eigentümeransprache nach Eigentümertyp und Motivlage.
2. Mandatspräsentation für Investmentimmobilien.
3. Käuferqualifikation und Finanzierungsnachweis.
4. Due-Diligence-Kommunikation und Erwartungsmanagement.
5. Preis-/Angebotsverhandlung im Verkauf von Zinshäusern.
6. Telefontrainer-Szenen mit realistischen Gesprächsverläufen und Bewertungsankern.

