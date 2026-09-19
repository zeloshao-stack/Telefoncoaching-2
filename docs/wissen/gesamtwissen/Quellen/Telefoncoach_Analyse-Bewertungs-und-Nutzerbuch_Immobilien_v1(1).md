# Telefoncoach fuer Immobilien
## Analyse-, Bewertungs- und Nutzerbuch v1

Dieses Buch hat zwei Aufgaben:

1. Es definiert, wie die KI ein Trainingsgespraech fair, nachvollziehbar und wiederholbar analysiert.
2. Es erklaert dem Makler die wichtigsten Telefonwerkzeuge in kurzen Immobiliengeschichten.

Es ist fuer den klassischen Wohnmakler geschrieben: Eigentumswohnungen, Einfamilienhaeuser, kleine Zinshaeuser und Kaufinteressent:innen.

---

# Teil I - Was an der Gemini-Recherche bleibt und was sich aendert

## 1. Uebernommen

- Phasenlogik statt freiem Verkaufsskript.
- Erlaubnisbasierter, klarer Einstieg.
- Fragen vor Leistungsargumenten.
- SPIN als lose Fragefolge: Situation, Problem, Auswirkung, gewuenschte Loesung.
- LAER als Einwandprozess: zuhoeren, anerkennen, erforschen, antworten.
- Spiegeln, Labeln, Zusammenfassen und konkrete naechste Schritte.
- Teilkriterien mit Verhaltensankern, Belegen und Micro-Drills.

## 2. Geaendert

| Gemini-These | Entscheidung fuer unseren Coach | Grund |
|---|---|---|
| Sechs Phasen sichern planbare Abschlussquoten | Phasen sind Orientierung, keine Garantie | Ergebnis haengt von Lage, Anlass und Gegenueber ab |
| Jede Ablehnung ist Vorwand oder Einwand | Wir nennen es zunaechst **Widerstand** | Die KI kann Motive nicht sicher lesen |
| "No time" muss neutralisiert werden | Ein klares Nein wird respektiert | Kein Drucktraining |
| 1,6 Sekunden Pause ist Benchmark | KI beobachtet: unterbricht der Makler / gibt er Raum? | Fester Zahlenwert ist Scheingenauigkeit |
| 43/57 Redeanteil ist Ziel | KI bewertet nur im Kontext | Erstkontakt und Erklaerung brauchen andere Anteile als Discovery |
| Downward Inflection ist Pflicht | KI bewertet Klarheit und Ruhe, nicht eine künstliche Stimme | Deutschsprachige Natuerlichkeit ist wichtiger |
| Late-night DJ Voice | Kein Trainingsziel | Bildhafte Technik, aber nicht verlässlich operationalisierbar |
| "Schicken Sie Unterlagen" ist Vorwand | KI behandelt es als legitime Bitte, bis Gegenteiliges sichtbar wird | Respektvolle Interpretation statt Manipulationslogik |
| Termine immer im Call fixieren | Ziel ist ein klarer naechster Schritt; manchmal ist eine Absage richtig | Kein falscher Abschlussdruck |

## 3. Die zentrale KI-Regel

Die KI bewertet **nur beobachtbares Verhalten**, nie vermutete Absichten oder Persoenlichkeit.

Nicht: "Der Kunde war ein Vorwandtyp."  
Sondern: "Der Kunde bat um Unterlagen. Du hast ohne Klaerungsfrage zugesagt; offen blieb, welche Information ihm hilft und ob ein Nachfasszeitpunkt erwünscht ist."

---

# Teil II - Datenmodell fuer die KI

## 4. Was eine Trainingssession speichert

```text
session_id
scenario_id + scenario_version
training_type: owner_contact | valuation | mandate | buyer | follow_up
transcript: [{turn_id, speaker, text, start_ms, end_ms, transcript_confidence}]
scene_facts: freigegebene Fakten
scene_goals: 3-5 Ziele mit Gewicht und BARS-Ankern
milestones: notwendige Ereignisse ohne Punkte
anti_patterns: klar abgegrenzte schaedliche Verhaltensweisen
criterion_judgements: [{criterion_id, score_0_10 | NA, evidence_turn_ids, quotes, reasoning, certainty}]
computed_score: Code-Ausgabe
learning_focus: ein priorisierter Drill
```

## 5. Drei Beweisregeln

1. **Kein Urteil ohne Turn-ID und Wortlaut.**
2. **Unsichere Transkription nicht bewerten.** Bei unklarer Stelle sagt die KI "nicht belastbar".
3. **Keine Doppelbestrafung.** Wenn "zu frueher Pitch" bereits ein Szenenziel verschlechtert, darf er nicht nochmals als Anti-Pattern abgezogen werden.

## 6. Ausgabeformat der KI (verbindliches JSON)

```json
{
  "criterion_id": "owner_motivation",
  "applicable": true,
  "score": 6,
  "evidence": [
    {"turn_ids": [7, 8], "quote": "...", "why": "Makler fragt nach Haltung, vertieft die Aussage aber nicht."}
  ],
  "strength": "Du hast die emotionale Bindung erkannt.",
  "next_move": "Frage als Nächstes: 'Was müsste bei einem möglichen Verkauf unbedingt erhalten bleiben?'",
  "confidence": "medium"
}
```

Die KI darf nur die `score`-Felder je Kriterium liefern. Gewichtung, N/A, Abzug und Gesamtscore rechnet die Software.

---

# Teil III - Bewertungsmodell

## 7. Erst die Szenenziele, dann die Basiskompetenzen

`Score = 80 % Szenenzielwert + 20 % Basiswert - gedeckelter Anti-Pattern-Abzug`

- Unter drei verstaendlichen Maklerbeitraegen: **kein Gesamtscore**.
- Nicht beobachtbar: **N/A**, faellt aus dem Nenner.
- Anti-Pattern-Abzug: maximal 1,5 Punkte und maximal 15 % des Basiswerts.
- Ein rotes Sicherheits-/Wahrheitsproblem erzeugt einen Warnhinweis, keinen versteckten Punkteabzug.

## 8. Vier Basiskompetenzen (immer gleich)

| ID | Kompetenz | Die KI sucht nach | Die KI darf nicht daraus machen |
|---|---|---|---|
| B1 | Klarheit | Rolle, Anlass, kurze Saetze, nachvollziehbare Aussage | "starke Persoenlichkeit" |
| B2 | Zuhoeren | Aufnehmen, Spiegeln, passende Vertiefung | Gedankenlesen |
| B3 | Widerstand bearbeiten | Anerkennen, klaeren, passende Antwort | "Vorwand entlarvt" |
| B4 | Verbindlichkeit | klarer naechster Schritt oder klare Absage | Termin um jeden Preis |

## 9. BARS-Skala fuer jeden einzelnen Wert

| Score | Bedeutung | Erlaubte Beurteilung |
|---:|---|---|
| 0-2 | entgegenwirkend | unterbricht, ignoriert, verspricht Unhaltbares, greift an |
| 3-4 | kaum sichtbar | Prinzip fehlt oder bleibt zufaellig |
| 5-6 | grundsaetzlich vorhanden | richtige Bewegung, aber unvollstaendig oder mechanisch |
| 7-8 | gut und wiederholt sichtbar | passend, ruhig, mehrmals belegt |
| 9-10 | aussergewoehnlich praezise | unterschiedliche Stellen, sehr passend zur Lage, ohne Druck |

Eine 10 ist selten. "Freundlich" allein ist nie mehr als eine 5 oder 6.

## 10. Anti-Patterns: nur klar belegbare Schaeden

| ID | Anti-Pattern | Ausloeser | Nicht ausloesen bei |
|---|---|---|---|
| A1 | Druck / künstliche Dringlichkeit | erfindet Zeitdruck, droht indirekt, macht Schuld | legitimer Klarheit zum Prozess |
| A2 | Unbelegte Zusage | Preis, Markt, Leistung oder Ergebnis als sicher behauptet | klar gekennzeichnete Einschätzung |
| A3 | Einwand ueberfahren | Antwort ohne Bezug zur Aussage / Unterbrechung | kurze Klarungsfrage |
| A4 | Manipulative Deutung | behauptet Motiv des Kunden als Tatsache | vorsichtige Hypothese als Frage |
| A5 | Abwertung Dritter | anderer Makler, Familie, Kaufinteressent wird abgewertet | sachlicher Vergleich |

---

# Teil IV - Szenen-Scorecards

## 11. Eigentümer-Erstkontakt

**Situation:** Eigentümer:in kennt den Makler nicht; die Immobilie ist oft emotional und wirtschaftlich bedeutsam.

| Ziel | Gewicht | 0-3 | 5-6 | 8-10 | Nachweis |
|---|---:|---|---|---|---|
| S1 Klarer Einstieg | 25 % | unklar, langer Pitch | Rolle und Anlass klar | respektvoll, relevant, kein Druck | erster Maklerturn |
| S2 Haltung verstehen | 30 % | argumentiert vor Fragen | fragt nach grundsaetzlicher Haltung | macht Bedeutung und Bedingung sichtbar | Kundenwort + Vertiefung |
| S3 Widerstand klaeren | 25 % | dagegen reden | anerkennt und fragt einmal | spiegelt, klaert Hauptgrund, passt Antwort an | Einwandsequenz |
| S4 passender Folgeschritt | 20 % | vage Vertagung | Rueckruf / Information vereinbart | Zeit, Zweck, Wahlfreiheit und Vorbereitung klar | Schlusssequenz |

**Meilensteine:** richtige Person erreicht; Kontaktgrund akzeptiert; echte Haltung ausgesprochen.  
**Typischer Drill:** "Ich verkaufe nicht" - drei Turns lang keine Preis-, Markt- oder Leistungsargumente.

## 12. Bewertungsgespräch

| Ziel | Gewicht | KI schaut auf |
|---|---:|---|
| S1 Erwartung verstehen | 30 % | Wunschwert, Herkunft und Funktion der Zahl |
| S2 Objekt und Lage strukturieren | 25 % | relevante Fakten, offene Punkte, keine Scheinexpertise |
| S3 Einordnung nachvollziehbar machen | 25 % | Vergleichslogik und Unsicherheit statt Behauptung |
| S4 Entscheidungspfad | 20 % | was folgt nach der Einordnung, wer entscheidet |

**Story-Hebel:** Wunschpreis nicht zerstoeren. Zuerst fragen: "Was würde diese Zahl für Sie ermöglichen?"

## 13. Alleinauftrag

| Ziel | Gewicht | KI schaut auf |
|---|---:|---|
| S1 Auswahlkriterien | 25 % | was ein Makler tragen soll |
| S2 Vermarktungsweg | 25 % | Preisstrategie, Steuerung, Bericht, Ansprache |
| S3 Risiko klaeren | 25 % | Doppelansprache, Informationsverlust, Entscheidungsdruck ohne Angstverkauf |
| S4 Mandat / Entscheidung | 25 % | klare Vereinbarung oder respektvolle Offenheit |

## 14. Kaufinteressent

| Ziel | Gewicht | KI schaut auf |
|---|---:|---|
| S1 Passung klaeren | 30 % | Bedürfnisse, Muss-Kriterien, Ausschlusskriterien |
| S2 Ernsthaftigkeit | 25 % | Entscheidungsweg, Zeithorizont, Finanzierung sachlich erfragt |
| S3 Objektfragen | 20 % | offene Fakten priorisiert und sauber behandelt |
| S4 naechster Schritt | 25 % | Besichtigung, Unterlagen, Angebot oder ehrliche Absage |

---

# Teil V - Die Methoden als maschinenlesbare Lernkarten

## 15. Karte: Erlaubnisbasierter Einstieg

**Zweck:** Widerstand senken, weil Rolle und Gesprächszweck klar sind.  
**Nicht:** Trick, um ein Nein zu verhindern.  
**Gute Form:** "Ich sage Ihnen kurz, weshalb ich anrufe; Sie entscheiden dann, ob es fuer Sie gerade relevant ist."  
**Die KI erkennt:** Identitaet + Anlass + Wahlfreiheit binnen der ersten zwei Maklerturns.  
**Fehler:** Entschuldigen, langer Unternehmenspitch, vorgetaeuschte Vertrautheit.  
**Drill:** 30 Sekunden, maximal 45 Woerter, dann Stopp.

## 16. Karte: Trichterfrage

**Zweck:** Von einer allgemeinen Aussage zu einem Entscheidungsgrund kommen.  
**Sequenz:** offen -> Bedeutung -> Kriterium -> Beteiligte -> naechster Schritt.  
**Gute Form:** "Was bedeutet ein guter Preis fuer Sie konkret?"  
**Die KI erkennt:** Kundenantwort wird in der naechsten Frage aufgegriffen.  
**Fehler:** Fragebogenserie, Warum-Fragen im Kreuzverhoer, Preisargument vor Kriterium.  
**Drill:** Aus "Ich ueberlege noch" drei vertiefende Fragen machen.

## 17. Karte: Spiegeln und Labeln

**Zweck:** Bedeutung pruefen, ohne zu behaupten, man kenne das Gegenueber.  
**Gute Form:** "Es klingt, als waere Ihnen Kontrolle im Prozess wichtiger als Geschwindigkeit. Trifft das?"  
**Die KI erkennt:** vorsichtige Sprache + Rueckfrage + passende Folgefrage.  
**Fehler:** "Sie haben Angst" oder mechanisches Wiederholen der letzten Worte.  
**Drill:** Drei Kundenaussagen in eine neutrale, pruefbare Zusammenfassung uebersetzen.

## 18. Karte: Pause

**Zweck:** Raum fuer Antwort und Entschleunigung schaffen.  
**Die KI misst nicht:** eine magische Sekundenanzahl.  
**Die KI erkennt:** Unterbrechung, sofortige Verteidigung oder ob nach einer starken Frage eine Kundenantwort moeglich wurde.  
**Drill:** nach jeder Kernfrage bewusst still bleiben und nur dann nachfragen, wenn der Kunde fertig ist.

## 19. Karte: V-S-K-B bei Widerstand

**Validieren:** "Das verstehe ich." Nur sagen, wenn nachfolgend klar wird, was verstanden wurde.  
**Spiegeln:** "Sie moechten keine Entscheidung bereuen."  
**Klaeren:** "Ist das der Hauptgrund oder gibt es noch etwas anderes?"  
**Bruecke:** "Dann waere eine neutrale Einordnung der erste Schritt, nicht sofort ein Auftrag."  
**Die KI erkennt:** Der erste Maklerturn nach Widerstand nennt nicht sofort Leistung oder Gegenargument.

## 20. Karte: Nutzenbruecke

**Zweck:** Leistung aus der Kundensituation ableiten.  
**Gute Form:** "Weil Ihnen Diskretion wichtig ist, sollten wir zuerst den kontrollierten Kreis der Ansprache festlegen."  
**Die KI erkennt:** Kundenkriterium wird explizit mit einer Leistung / Handlung verbunden.  
**Fehler:** Leistungsmenue: "Wir machen Foto, Expose, Inserat, Besichtigungen ..."  
**Drill:** Zu drei Kundenbedürfnissen je nur eine passende Leistungsbruecke formulieren.

## 21. Karte: Terminierung

**Zweck:** Aus Sympathie wird ein umsetzbarer Schritt.  
**Formel:** Zweck + Dauer + Vorbereitung + Wahl.  
**Gute Form:** "Damit Sie eine belastbare Grundlage haben, nehme ich mir 20 Minuten und bringe Vergleichsfälle mit. Sie schauen, ob Sie Grundriss und Betriebskostenaufstellung finden. Passt Dienstag 10 Uhr oder Donnerstag 16 Uhr?"  
**Die KI erkennt:** mindestens zwei der vier Elemente; volle Punkte nur bei allen vier oder einer begruendeten Alternative.  
**Fehler:** "Wir telefonieren irgendwann."  
**Drill:** denselben Termin in 20, 35 und 60 Sekunden anbieten.

---

# Teil VI - Das kleine Buch fuer den Makler

## Vorwort: Der leere Sessel

Am Telefon sieht man das Gegenueber nicht. Man sieht nicht, ob jemand laechelt, aus dem Fenster schaut oder gerade den Brief der Bank auf dem Tisch liegen hat. Deshalb ist der leere Sessel auf der anderen Seite keine Luecke. Er ist eine Einladung, besser zuzuhören.

Ein guter Makler fuellt diesen Sessel nicht mit Worten. Er schafft genug Ruhe, damit der andere Mensch sagen kann, worum es wirklich geht.

## Geschichte 1 - Frau Leitner verkauft nicht

Frau Leitner sagte gleich zu Beginn: "Nein, ich verkaufe nicht."

Der junge Makler sagte: "Gerade jetzt waere aber ein guter Zeitpunkt. Wir haben viele vorgemerkte Kunden."

Frau Leitner wurde still. Dann sagte sie: "Dann haben Sie mir ja nicht zugehört." Das Gespräch war vorbei.

Eine Woche spaeter rief ein anderer Makler an. Er sagte: "Das respektiere ich. Was macht das Thema fuer Sie heute ausgeschlossen?"

Frau Leitner erzaehlte von ihrem verstorbenen Mann, von den Kindern und davon, dass sie nicht wusste, was mit der Wohnung passieren wuerde, wenn sie selbst einmal nicht mehr entscheiden konnte.

Der zweite Makler bekam keinen Auftrag. Aber er bekam etwas Besseres: eine Einladung, in zwei Monaten mit den Kindern gemeinsam eine ruhige Entscheidungsgrundlage zu besprechen.

**Lernsatz:** Ein Nein ist oft kein Ende. Aber es ist immer zuerst ein Satz, der verstanden werden will.

## Geschichte 2 - Die Zahl auf dem Kuenzettel

Herr Roth hatte eine Zahl im Kopf. Sie stand seit Monaten auf einem kleinen gelben Zettel in seiner Kuche. Der Makler nannte eine niedrigere Vergleichsspanne. Herr Roth wurde hart: "Dann brauchen wir nicht weiterreden."

Die Maklerin fragte nicht, ob er realistisch sei. Sie fragte: "Was wuerde diese Zahl fuer Sie moeglich machen?"

Da kam heraus: Herr Roth wollte seiner Tochter Eigenkapital fuer eine Wohnung geben und selbst ohne Sorgen kleiner wohnen.

Nun war die Zahl nicht mehr nur eine Zahl. Sie war ein Plan. Die Maklerin konnte zeigen, welche Wege es gab und welche Informationen noch fehlten.

**Lernsatz:** Hinter einer Preisvorstellung steht oft eine Aufgabe. Finde die Aufgabe, bevor du die Zahl diskutierst.

## Geschichte 3 - "Wir machen das privat"

"Wir machen das privat", sagte Frau Hofer. Der Makler wollte sofort erklaeren, warum private Inserate schlecht seien. Er hielt inne.

"Was ist Ihnen am privaten Weg wichtig?", fragte er stattdessen.

"Dass nicht jeder Nachbar weiss, dass wir verkaufen. Und dass wir nicht an zehn Makler gebunden sind."

Der Makler antwortete: "Dann reden wir nicht ueber moeglichst breite Vermarktung. Wir reden darüber, wie Sie Kontrolle und Diskretion behalten. Wenn das nicht besser ist als Ihr eigener Weg, sollten Sie es privat machen."

Frau Hofer bat um einen Termin.

**Lernsatz:** Wer eine Entscheidung des Kunden respektiert, bekommt erst die Chance, sein Kriterium zu verstehen.

## Geschichte 4 - Die Pause

Frau Berger sagte: "Die Provision ist mir ehrlich gesagt zu hoch."

Der Makler spürte, wie ihm schon die Argumente kamen. Expose, Fotos, Besichtigungen, Verhandlung. Er sagte nichts.

Nach einem Moment sagte Frau Berger weiter: "Mein Bruder hatte mit einem Makler eine schlechte Erfahrung. Am Ende war alles chaotisch."

Jetzt war die richtige Frage sichtbar: "Was muesste diesmal anders laufen, damit Sie den Prozess als geordnet und seinen Preis wert erleben?"

**Lernsatz:** Die zweite Aussage nach einem Einwand ist oft wichtiger als die erste. Gib ihr Raum.

## Geschichte 5 - Zwei Termine, kein Druck

Der Makler sagte frueher immer: "Wann passt es Ihnen denn?"

Die meisten Menschen sagten: "Melden Sie sich naechste Woche." Und dann meldete sich niemand.

Er lernte, einen Termin klein zu machen: "Ich moechte Ihnen keinen Auftrag vorlegen. Ich bringe Vergleichsfälle und einen Vorschlag fuer einen diskreten Ablauf mit. Wir nehmen 20 Minuten. Dienstag um 10 oder Donnerstag um 16?"

Die Menschen hatten immer noch die Freiheit, Nein zu sagen. Aber jetzt war klar, wozu sie Ja sagen konnten.

**Lernsatz:** Verbindlichkeit entsteht nicht durch Druck. Sie entsteht durch einen kleinen, klaren und nützlichen Schritt.

## Geschichte 6 - Der stille Kaufinteressent

Bei der Besichtigung fragte der Interessent fast nichts. Die Maklerin wollte die Vorzuege der Wohnung erklaeren. Stattdessen fragte sie: "Was muesste diese Wohnung fuer Sie koennen, damit Sie sich nach der Besichtigung wirklich damit befassen?"

Er sagte: "Ich suche nicht nur fuer mich. Meine Mutter soll vielleicht einziehen. Die Liftfrage ist entscheidend."

Nun wusste die Maklerin, was sie klaeren musste. Nicht mehr, aber auch nicht weniger.

**Lernsatz:** Die beste Produktpraesentation ist oft eine gute Frage vor der Produktpraesentation.

## Geschichte 7 - Das saubere Ende

Ein Eigentuemer sagte nach zehn Minuten: "Es ist wirklich kein Thema. Bitte rufen Sie nicht mehr an."

Der Makler wollte noch eine letzte Chance. Dann sagte er: "In Ordnung. Ich respektiere das und nehme Sie aus meiner Wiedervorlage. Falls sich das einmal aendert, wissen Sie, wie Sie mich erreichen."

Ein Jahr spaeter rief der Eigentuemer selbst an.

**Lernsatz:** Ein respektvolles Ende ist kein verlorenes Gespräch. Es ist Teil der Marke, die du aufbaust.

---

# Teil VII - Was der Nutzer nach einem Training sieht

## 22. Die Ergebnisansicht

Oben nur vier Dinge:

1. **Dein naechster Hebel:** "Vor dem Preisargument die Funktion der Wunschzahl klaeren."
2. **Was gelungen ist:** ein wörtliches, belegtes Verhalten.
3. **Der kritische Moment:** "Du sagtest" / "wirksamer waere" / "warum".
4. **Button:** "Diese Stelle jetzt nochmals ueben."

Einklappbar: Ziele, Belege, Formel und Sicherheitsflags. Keine zehn Profi-Tipps.

## 23. Beispiel einer echten KI-Auswertung

**Stark:** Du hast bei "Ich mache das privat" nicht widersprochen, sondern gefragt: "Was ist Ihnen daran wichtig?" Dadurch nannte die Person Diskretion als Kriterium.

**Naechster Hebel:** Nach der Antwort "Diskretion" bist du direkt zu Fotos und Vermarktung gegangen. Frage zuerst: "Wovor moechten Sie die Diskretion konkret schuetzen?"

**Sofort-Drill:** Der Kunde sagt nochmals: "Wir machen das privat." Dein Ziel sind drei Turns ohne Leistungsaufzaehlung.

---

# Teil VIII - Abnahme- und Kalibrierungsregeln

1. Jede neue Szene erhaelt 8-12 eingefrorene Referenzdialoge.
2. Jeder Dialog hat erlaubten Scorebereich, Belegturns, N/A-Entscheidungen und erwarteten Drill.
3. Zwei erfahrene Makler bewerten drei Referenzfaelle unabhaengig; Abweichungen pruefen zuerst die Anker, nicht die Person.
4. Eine KI-Aenderung darf nicht live gehen, bevor die Referenzfaelle stabil bleiben.
5. Das Nutzerbuch wird nicht als "Wahrheit" bewertet. Es ist ein einpraegsames Lernmittel; die Scorecard bleibt sachlich und belegpflichtig.
