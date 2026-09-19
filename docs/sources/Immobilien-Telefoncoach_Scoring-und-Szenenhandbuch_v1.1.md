# Immobilien-Telefoncoach - Scoring- und Szenenhandbuch v1

Status: Arbeitsgrundlage fuer Produkt und Entwicklerteam. Zielgruppe: Immobilienmakler, Zinshausmakler und Hausverwaltungen im deutschsprachigen Raum.

## 1. Produktentscheidung

Das Produkt ist kein allgemeiner Sales-Coach und kein Call-Center-Monitoring. Es trainiert einen Makler vor dem echten Gespraech auf genau eine konkrete Situation und gibt danach nur eine umsetzbare Verbesserung aus.

**Kernversprechen:** In drei Klicks ein realistisches Rollenspiel starten; nach dem Gespraech wissen, welche eine Formulierung oder Gespraechsbewegung beim naechsten Anruf verbessert werden soll.

### V1 bewusst klein

1. Nutzer waehlt Rolle, Ziel und Schwierigkeit.
2. Er fuehrt ein Sprach-Rollenspiel mit einer glaubwuerdigen Immobilien-Persona.
3. Das System zeigt Ergebnis, 3-5 belegte Szenenziele, einen staerksten Hebel und die Wiederholungsuebung.
4. "Nochmal an der Stelle" startet nicht den ganzen Call neu, sondern genau den kritischen Einwand.

Nicht V1: CRM, Live-Mithoeren, Ranking von Mitarbeitern, vollautomatische Bewertung echter Kundencalls, komplexer Prompt-Editor, hundert Szenen oder Gamification-Punkte ohne Lernwert.

## 2. Die drei Trainingswelten

| Welt | Nutzer | Zweck | Typische Resultate |
|---|---|---|---|
| Makler - Eigentuemer gewinnen | Wohnungs-, Haus-, Zinshausmakler | Zugang, Vertrauen, Termin, Mandat | Ersttermin, Bewertungsauftrag, Alleinvermittlungsauftrag |
| Makler - Vermarktung und Abschluss | Makler | Kaufinteresse qualifizieren, Preis und Prozess fuehren | Besichtigung, Finanzierungsnachweis, Angebot, Nachfass-Termin |
| Hausverwaltung - Service und Konflikt | Verwalter, Objektbetreuer | Anliegen klaeren, deeskalieren, verbindlich weiterfuehren | Ticket, Unterlagen, Zutritt, Beschluss, Erwartungsmanagement |

Die drei Welten teilen nur vier Basiskompetenzen: Klarheit, Zuhoeren, Einwand-/Konfliktarbeit, verbindlicher naechster Schritt. Alles andere ist rollenspezifisch. Ein Hausverwalter soll nicht fuer "Closing" bestraft werden, wenn eine sachliche Eskalation korrekt ist.

## 3. Bedienung: Ein Trainingsstart in 20 Sekunden

Startmaske ohne Freitextpflicht:

1. **Ich bin:** Makler / Zinshausmakler / Hausverwalter.
2. **Ich will:** Ersttermin / Alleinauftrag / Preisgespraech / Kaufinteresse / Beschwerde klaeren / eigenen Fall trainieren.
3. **Gegenueber:** Privatperson / Erbengemeinschaft / Anleger / Unternehmer / Mieter / Beirat.
4. **Schwierigkeit:** Normal / skeptisch / sehr schwierig.

Erst danach: optional Objektart, Ort, konkrete Aussage des Gegenuebers und Aufnahme- oder Textmodus. Die Standardszene muss immer sofort startbar sein.

## 4. Szenenbaukasten statt Prompt-Sammlung

Jede Szene ist eine strukturierte Konfiguration, keine lose Textanweisung.

### Pflichtfelder einer Szene

| Baustein | Inhalt |
|---|---|
| Szenen-ID und Trainingstyp | z. B. `M-OWNER-COLD-001`, Eigentuemerkontakt |
| Ausgangslage | Objekt, Anlass, bisheriger Kontakt, realistische Informationen |
| Ziel des Nutzers | Eine messbare Bewegung, nicht "gut verkaufen" |
| Ziel der Persona | Was die Person schuetzen, erreichen oder vermeiden will |
| Persona | Alter nur falls relevant, Rolle, Wissen, Kommunikationsstil, Vertrauen, Entscheidungsbefugnis |
| Widerstand | konkrete Einwaende, Ausloeser, Eskalationslogik |
| Wahrheitsgrenzen | Was die Persona weiss/nicht weiss; keine erfundenen Fakten |
| Szenenziele | 3 bis 5 beobachtbare Kriterien mit Gewicht und BARS-Ankern |
| Meilensteine | notwendige, aber nicht bepunktete Ereignisse |
| Anti-Patterns | nur schaedliche, klar erkennbare Handlungen; kein Doppeltabzug |
| Wissenskarten | nur fuer diese Szene zugelassene Fakten, Formulierungen, Risiken |
| Drill-Variante | kritische Stelle mit gleicher Persona erneut abspielen |

### Kern-Szenen fuer V1

**Makler - Eigentuemer**

1. Kalter Erstkontakt: "Ich will nicht verkaufen."
2. Eigentumswohnung: "Ich mache das privat, wozu Provision?"
3. Zinshaus: Familieneigentum, emotionaler Widerstand, nur enger Spielraum.
4. Erbengemeinschaft: keine einheitliche Haltung, wer entscheidet?
5. Preisgespraech: unrealistische Erwartung ohne Beziehung zu zerstoeren.
6. Alleinvermittlungsauftrag: Vergleich mit mehreren Maklern / keine Bindung.
7. Nachfassen nach Bewertung: Interesse vorhanden, aber Vertagung.

**Makler - Kaufseite**

8. Interessent will sofort einen Preisnachlass.
9. Finanzierung ist unklar, Interessent will trotzdem reservieren.
10. Angebot unter Erwartung: Verhandlung in klare Kriterien ueberfuehren.

**Hausverwaltung**

11. Akuter Schaden: Erwartung "sofort reparieren", aber Abklaerung noetig.
12. Betriebskostenbeschwerde: emotional, mit Verdacht auf Fehler.
13. Mieter fordert Ausnahme / rechtliche Zusage am Telefon.
14. Beirat verlangt Unterlagen oder Beschluss, Frist und Verantwortung klaeren.

## 5. Scoring: Immobilienlogik vor allgemeiner Rhetorik

Careertrainer ist mit evidenzbasierten Teilurteilen, BARS, Anti-Pattern-Deckel und nachvollziehbarer Formel ein guter Referenzrahmen. Fuer dieses Produkt braucht jedes Szenario aber einen hoeheren Anteil an **Geschaeftsbewegung**.

### Scoringformel

Alle Einzelkriterien werden von der KI mit 0-10 bewertet; die Software rechnet danach deterministisch:

`Gesamtscore = 0,80 x Szenariozielwert + 0,20 x Basiswert - Anti-Pattern-Abzug`

- Szenariozielwert: gewichtetes Mittel aus 3-5 Szenenzielen.
- Basiswert: Mittel nur der anwendbaren Basiskompetenzen.
- Anti-Pattern-Abzug: maximal 15 % des Basiswerts und maximal 1,5 Punkte.
- Nicht beobachtbar = N/A, nicht 0. N/A faellt aus dem Nenner.
- Unter drei klaren Nutzerbeitraegen: kein Score, nur kurzes Feedback und Wiederholung.
- Compliance-/Wahrheitsverstoss: kein Punkteabzug, sondern rotes Sicherheits-Flag und konkrete Korrektur.

Die Gewichtung 80/20 statt 70/30 verhindert, dass ein gutes allgemeines Auftreten einen verfehlten Eigentuemertermin oder eine falsche HV-Zusage ueberdeckt.

### Vier universelle Basiskompetenzen (20 %)

| Kompetenz | Was wird beobachtet |
|---|---|
| Klarheit und Struktur | Anlass, Rolle und naechster Schritt sind ohne Worthuelsen klar |
| Aktives Zuhoeren | Relevante Aussage aufnehmen, spiegeln, sinnvoll vertiefen |
| Umgang mit Widerstand | nicht argumentativ ueberfahren; Ursache klaeren und passend antworten |
| Verbindlichkeit | konkreter naechster Schritt mit Zeitpunkt, Person und Zweck |

### Beispiel: Kaltakquise beim Zinshauseigentuemer

| Szenenziel | Gewicht | 0-3 | 4-7 | 8-10 |
|---|---:|---|---|---|
| Relevanter, respektvoller Einstieg | 25 % | generischer Verkaufspitch | Anlass und Rolle klar | spezifische, glaubwuerdige Relevanz ohne Druck |
| Haltung zum Objekt verstehen | 30 % | fragt nicht / argumentiert sofort | fragt nach grundsaetzlicher Haltung | macht Bedeutung, Zeithorizont und Bedingung fuer Offenheit sichtbar |
| Einwand "kein Verkauf" bearbeiten | 25 % | widerspricht oder beendet zu frueh | anerkennt, bleibt aber allgemein | validiert, klaert Ursache und oeffnet eine kleine naechste Stufe |
| Passenden Folgeschritt sichern | 20 % | vages "melden Sie sich" | Rueckruf oder Information vereinbart | konkrete Erlaubnis, Zeitpunkt und nachvollziehbarer Nutzen |

Moegliche Meilensteine: Person identifiziert; Kontaktgrund akzeptiert; ein echter Einwand ausgesprochen. Sie machen keinen Score, zeigen aber, wo der Call abbrach.

### Anti-Patterns fuer Immobilien

- falsche Markt-, Rechts- oder Preiszusage;
- Druck, Schuld oder kuenstliche Verknappung;
- Diskussion gegen eine emotionale Bindung statt Verstehen;
- Provisionsverteidigung, bevor der Nutzen oder die Ursache klar ist;
- bei HV: verbindliche rechtliche/technische Zusage ausserhalb der Freigabe.

Ein Verhalten darf entweder als Szenenziel schlecht bewertet **oder** als Anti-Pattern abgezogen werden - niemals beides.

## 6. BARS und Evidenz: damit die Bewertung glaubwuerdig bleibt

Jedes Teilurteil braucht drei Felder:

1. Timestamp oder Turn-ID.
2. Woertliches Nutzerzitat.
3. Kurze Begruendung gegen den Szenenanker.

Kein erfundenes Zitat. Unsichere Transkription ist als unsicher zu markieren und nicht zu bewerten. Die KI erhaelt nur Teilkriterien und Belege; Formel, Gewichte, N/A-Logik und Abzug laufen im Code.

Der Score ist ein Lernsignal, keine Leistungsbeurteilung. Kein Team-Ranking, keine Personalentscheidung und keine Aussage ueber Persoenlichkeit.

## 7. Die Auswertung: maximal eine Handlung ausloesen

Die Ergebnisansicht soll nicht wie ein Gutachten wirken. Reihenfolge:

1. **Dein naechster Hebel:** ein Satz - z. B. "Vor der Marktargumentation die emotionale Bindung und die Verkaufsbedingung klaeren."
2. **Was gelungen ist:** ein belegtes Verhalten.
3. **Kritischer Moment:** Zitat "Du sagtest" gegen "wirksamer waere" und warum.
4. **Sofort-Drill:** Button "Einwand jetzt nochmals ueben".
5. Einklappbar: Ziele, Belege, Scoreformel, Sicherheitsflags.

Keine zehn Tipps. Nach drei Uebungen mit demselben Hebel wird erst ein zweiter Hebel freigeschaltet.

## 8. Wissensbasis: freigegeben, versioniert, trennscharf

Die Wissensbasis dient nicht dazu, die Persona mit Fakten zu ueberladen. Sie versorgt Szenengenerator und Feedback mit kontrollierten Inhalten.

| Wissensschicht | Inhalt | Freigabe |
|---|---|---|
| Gespraechsprinzipien | Fragen, Spiegeln, Einwaende, Terminierung, Deeskalation | interne Redaktion |
| Rollenwissen | Maklerprozess, Eigentuemerlogik, Hausverwaltungsablaeufe | Fachexperte |
| Szenenwissen | konkrete Persona, Lage, Einwaende, Ziele, erlaubte Fakten | Szenenredaktion |
| Recht und Compliance | klare Grenzen, Eskalationssaetze, verbotene Zusagen | Jurist/Fachverantwortlicher |
| Unternehmenswissen | Leistungsangebot, Gebiet, Referenzen, interne Prozesse | Unternehmen |

Jede Wissenskarte hat Quelle, Geltungsbereich, Verantwortlichen, Version, Datum und Ablaufdatum. Ohne freigegebene Karte darf das Modell keine spezifische Rechts-, Preis-, Steuer- oder Marktbehauptung erzeugen. Stattdessen: "Das pruefe ich verbindlich und melde mich bis [Zeitpunkt]."

## 9. KI-Architektur, einfach und robust

1. **Szenen-Compiler:** Nimmt Auswahl oder Nutzerfall entgegen und erzeugt eine strukturierte `ScenarioSpec` gegen das Schema.
2. **Role/Character Engine:** Spielt die Persona mit Gedachtnis, Ziel, Widerstandsstufen und Fakten-Grenzen. Sie darf nicht unlogisch einknicken.
3. **Conversation Runtime:** Sprache, Turn-Taking, Transkript, Unterbrechung, Ende.
4. **Evidence Evaluator:** Bewertet nur definierte Kriterien und gibt JSON mit Score, Zitaten, Turn-IDs, N/A und Unsicherheit zurueck.
5. **Score Engine im Code:** validiert die JSON-Ausgabe, rechnet deterministisch, sperrt Doppelabzuege.
6. **Coach Composer:** zeigt genau einen priorisierten Drill; keine neue freie Bewertung.

Minimaler Datensatz je Session: Szenen-ID/Version, Persona-Version, Transkript mit Turns, Teilurteile und Evidenz, berechnete Formel, Lernhebel, Drill-Ergebnis. Das reicht fuer Fortschritt, Kalibrierung und Fehleranalyse.

## 10. Qualitaetssicherung vor Ausbau

### Referenzset

Fuer jede V1-Szene 8-12 feste Testdialoge:

- klar schwach, mittel, gut;
- echter Einwand / Vorwand;
- kurzer abgebrochener Call;
- emotionale Reaktion;
- falsche Rechtszusage;
- Voice-Transkript mit Fehlern.

Zu jedem Testdialog: Soll-N/A, erlaubter Score-Bereich, erwartete Belegstellen, erlaubter Lernhebel und erwartetes Sicherheitsflag.

### Kalibrierung

Zwei erfahrene Makler/HV-Fachleute bewerten monatlich je drei Referenzdialoge unabhaengig. Abweichungen werden anhand der Belege und Anker geloest; erst dann werden Anker oder Prompts angepasst. Ziel ist nicht eine scheinwissenschaftliche Genauigkeit, sondern stabile, nachvollziehbare Lernhinweise.

## 11. Reihenfolge der Umsetzung

1. Eine Makler-Szene vollstaendig: Zinshaus-Kaltkontakt, Eigentuemereinstellung, enger Spielraum.
2. Sprachgespraech, turnbasierte Persona und manuelles Ende.
3. Vier Ziele, vier Basisdimensionen, Evidenz-JSON und Score Engine.
4. Eine Ergebnisansicht plus Wiederholungs-Drill.
5. Zehn Referenzdialoge und erste Kalibrierung.
6. Erst danach Szenen 2-7, dann Hausverwaltung als eigenes Modul.

**Abnahmekriterium fuer V1:** Ein Makler kann ohne Anleitung in unter einer Minute starten; er erkennt nach dem Call sofort den einen Hebel; dieselbe Szene bleibt bei gleicher Leistung in einem engen, begruendbaren Scorebereich; die Persona bleibt auch bei Druck plausibel.

## 12. Einordnung der Careertrainer-Referenz

Uebernehmen: klare Linke Navigation und ruhige Karte, Ergebnis oben, Belegpflicht, BARS-Baender, N/A, gedeckelte Anti-Patterns, Formel offenlegen, "Nochmal ueben".

Nicht uebernehmen: Produkt- und B2B-SaaS-Sprache, generische Kompetenzliste als Hauptsteuerung, zu viele Profi-Tipps, Bewertung ohne Immobiliensituation, 70/30 als fixe Wahrheit und ein breiter Szenarienkatalog vor einem kalibrierten Kernfall.

Der Vorteil der Spezialisierung ist nicht eine andere Benutzeroberflaeche, sondern bessere Szenen, realistische Gegenueber und richtige Kriterien an den wirklich kritischen Stellen im Immobiliengespraech.

## 13. Verhaltensprofil: erst spaeter, dann sehr nuetzlich

Die zusaetzliche Careertrainer-Referenz zeigt ein **Verhaltensprofil**: Es trennt einzelne Szenen-Scores von wiederkehrenden, situationsbezogenen Beobachtungen und zeigt vor der Mindeststichprobe bewusst keine Diagnose. Dieses Prinzip uebernehmen wir als Phase 2.

### Regel: keine Persoenlichkeitsdiagnose

Das Profil sagt nie "Du bist zu dominant" oder "Du kannst keine Einwaende". Es zeigt ausschliesslich beobachtetes Verhalten aus vergleichbaren, zentralen Trainings: "In 4 von 5 Eigentuemer-Erstkontakten kam die Marktargumentation vor der ersten Verstehensfrage."

### Immobilienprofil - sechs sinnvolle Indikatoren

| Indikator | Beobachtung | Erst nach |
|---|---|---|
| Verstehensfragen vor Argumentation | Fragen zu Bindung, Anlass, Zeithorizont, Bedingungen vor Markt-/Leistungspitch | 4 Eigentuemer-Kernfaellen |
| Frueher Pitch | Marktwert, Provision oder Leistungsangebot vor einer tragfaehigen Klaerung | 4 passenden Faellen |
| Einwand anerkannt | Einwand erst gespiegelt/anerkannt, dann erst Antwort oder Vertiefung | 4 Faellen mit echtem Einwand |
| Emotionale Bindung vertieft | Bedeutung des Objekts bzw. Verkaufshemmnis sichtbar gemacht | 4 Eigentuemerfaellen |
| Konkrete Next Steps | Zeitpunkt, Person und Zweck des naechsten Schrittes vereinbart | 4 abschliessbaren Faellen |
| Freigabegrenzen eingehalten | Keine unzulaessige Rechts-, Preis- oder Leistungszusage | alle passenden Faelle |

Die Anzeige bleibt bis zur Mindeststichprobe schlicht: "1 von mindestens 4 vergleichbaren Trainings - noch kein Muster." Periphere Faelle (etwa Kaufinteressent oder HV-Beschwerde) duerfen nicht stillschweigend in ein Eigentuemer-Akquiseprofil einfliessen.

### UX-Entscheidung

In V1 existiert nur der Verlauf pro Szenenziel und der letzte Lernhebel. Das Verhaltensprofil kommt erst, wenn die ersten Kernfaelle kalibriert sind. Dann erscheint es als eigener, privater Bereich neben "Auswertungen" - ohne Ampel, ohne Gesamtpersoenlichkeitsscore und ohne Teamvergleich.
