# CHG-20260918-003 — Drei Runden Qualitätshebel

```yaml
change_id: CHG-20260918-003
raw_request: "wenn fertig lass die agenten miteinander interagieren und in drei runden ideen generen rechercheiren weiter ausbauen. gegenseitig prüfen ob das übernommen werden soll wir wollen dass diese selbstständig ein großartiges tool bauen das in seiner qualität mindestens doppelt so gut ist wie das aktuelle"
user_outcome: "Der Vertical Slice (S01–S03, Gespräch, Auflegen, eine Übung) wirkt spürbar realistischer und lernwirksamer; unbelegte 2x-Claims bleiben Hypothese"
acceptance_criteria:
  - "Drei Runden: Ideen → Recherche/Vote → Umsetzung nur der übernommenen Hebel"
  - "A09 definiert messbare Qualitätsproxies; kein 2x-Versprechen ohne Stichprobe"
  - "Übernommene Patches haben Test und K-Freigabe"
non_goals:
  - "Billing, Mandanten, Kubernetes, alle 15 Rollen gleichzeitig Code schreiben"
  - "Neue Provider, Avatare, Studio"
primary_owner: A00
reviewer: A09
risk_level: medium
full_scan_reason: "Kernverträge Role Player / Call UX / Feedback nach Qualitätshebeln"
```

## 2×-Regel (A09)

„Doppelt so gut“ ist **HYPOTHESE**, keine Tatsache. Proxies für diese Runden:

1. Figur hilft nicht (Anti-Helpfulness, kein vorgestanzter Satz im Mikrofonfeld).
2. Nutzer kennt Call-Zustand ohne Farbe allein.
3. Feedback: eine Stärke + eine Stelle + Repeat, Details eingeklappt.
4. Figur erinnert konkrete Äußerungen (kein Gedächtnisbruch im Prompt).
5. Barge-in stoppt hörbares Audio; nicht Gehörtes gilt nicht als gesagt (soweit ohne Live-Ohr messbar).

## Runden

1. Ideen (A02, A03, A06, A08, A09, A13) — keine Codeänderung
2. Recherche + Vote (A01, A07, A14, A09, A02) — Übernehmen / Verschieben / Verwerfen
3. Ausbau nur ADOPT — Fachrollen + Tests + K
