# Verbindlicher Chatverlauf für jeden Rollenchat

Jeder Fachchat folgt diesem Ablauf. A Rolle und K Rolle sprechen sichtbar getrennt. Keine Freigabe in derselben Denkrunde wie die Erstlösung.

## Phase 1 Auftrag verstehen

**A Rolle antwortet:**

```text
AUFTRAGSVERSTÄNDNIS
- gewünschte Nutzerwirkung
- betroffene Komponente
- Nicht Ziele
- Annahmen und unbekannte Punkte
- vorgeschlagene Akzeptanzkriterien
```

Nur Fragen stellen, deren Antwort Architektur, Risiko oder Ergebnis wesentlich verändert. Ansonsten Annahme kennzeichnen und weiterarbeiten.

## Phase 2 Impact und Arbeitsplan

**A Rolle antwortet:**

```text
IMPACT_PLAN
- betroffene Dateien und Symbole
- betroffene Verträge und Daten
- abhängige Rollen
- bestehende Funktionen zur Wiederverwendung
- kleinster sicherer Änderungsumfang
- Zieltests
- Qualitäts- und Kostenwirkung
```

Bei Codeänderungen wird `CHANGE_ROUTER.md` angewandt.

## Phase 3 Umsetzung oder Fachentwurf

**A Rolle liefert:**

- konkrete Lösung oder minimalen Patch,
- geänderte Artefakte,
- ausgeführte Tests,
- Messwerte,
- verbleibende Hypothesen,
- bekannte Grenzen.

Keine Selbstaussage wie „funktioniert jetzt“ ohne Nachweis.

## Phase 4 unabhängige Gegenprüfung

**K Rolle erhält Auftrag und Ergebnis, aber nicht die interne Begründung der A Rolle.**

**K Rolle antwortet:**

```text
GEGENPRÜFUNG
Prüfumfang:
Durchgeführte Angriffe oder Tests:

BEFUNDE
- ID
- Fundstelle
- Schweregrad BLOCKER MAJOR MINOR NOTE
- verletztes Kriterium
- reproduzierbarer Nachweis
- minimaler Korrekturvorschlag

URTEIL
FREIGEGEBEN | NACHARBEIT | BLOCKIERT | EXPERIMENT ERFORDERLICH
```

K darf keine Mindestzahl an Fehlern erfinden. Keine Freigabe ohne dokumentierte Prüfung.

## Phase 5 Nachbesserung

**A Rolle beantwortet jeden Befund:**

```text
BEFUND_ID:
AKZEPTIERT | WIDERLEGT | VERSCHOBEN
BEGRÜNDUNG:
ÄNDERUNG:
NACHWEIS:
RESTRISIKO:
```

Widerlegung benötigt denselben Evidenzstandard wie der ursprüngliche Befund.

## Phase 6 Retest

K prüft nur korrigierte und angrenzende Risikofälle erneut. Kein vollständiger Neustart ohne dokumentierten Grund.

## Phase 7 Übergabe

Nach Freigabe erzeugt der Chat:

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
KONTEXT_FÜR_NÄCHSTEN_CHAT:
```

`KONTEXT_FÜR_NÄCHSTEN_CHAT` enthält nur die entscheidungsrelevanten Informationen, keine vollständige Gesprächshistorie.

## Beispiel Kurzverlauf

**Nutzer:** „Herr Gruber soll bei Unsicherheit länger pausieren und leiser sprechen.“

**A14 Auftragsverständnis:** Voice State Mapping ändern; keine Änderung an Charakterbiografie oder Audio Transport.

**A14 Impact Plan:** `behavior_to_voice`, Prosody Tests und Referenzsamples betroffen. A13 bestätigt Bedeutung von Unsicherheit; A06 nur bei fehlender Pausensteuerung.

**A14 Lösung:** Mapping für hohe Spannung und geringe Dominanz angepasst; drei Samples erzeugt; Blindtest vorbereitet.

**K14 Gegenprüfung:** MAJOR, weil Pause auch mitten in einer festen Wortgruppe gesetzt wird. Reproduzierbares Sample benannt.

**A14 Nachbesserung:** Pausen nur an syntaktisch zulässigen Grenzen; Test ergänzt.

**K14 Retest:** freigegeben. Emotion erkennbar, Satz bleibt natürlich.

**Übergabe:** geänderte Mapping Version, Hörtestergebnis, keine Änderung an A06 Vertrag.

