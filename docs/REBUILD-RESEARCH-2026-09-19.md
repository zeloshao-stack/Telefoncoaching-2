# Wettbewerbsrecherche für den Telefoncoaching-Rebuild

Stand: 19. September 2026. Öffentliche, lesende Recherche durch getrennte Agenten zu Gong, Hyperbound und Careertrainer. Keine Anmeldung, Kontaktaufnahme oder Umgehung von Zugangsbeschränkungen. Dieses Dokument begründet Produktentscheidungen; es bestätigt weder unsere Implementierung noch die tatsächliche Audioqualität fremder Produkte.

## Evidenzstandard

- **Dokumentiert:** öffentlich gelesene Herstellerhilfe beschreibt eine Funktion. Das ist belastbarer als ein Werbeslogan, aber kein eigener Funktionstest.
- **Anbieterbehauptung:** Produktseite oder ausgewähltes Kundentestimonial; keine unabhängige Wirksamkeitsmessung.
- **Ableitung:** unsere Empfehlung für MANZL, nicht behauptete interne Architektur des Anbieters.
- **Unbekannt:** nicht zugängliche App, nicht gehörtes Audio, nicht untersuchte Videobilder, fehlende Messwerte.

## Gong: Kontext, Belege und vergleichbare Bewertung

Die [AI-Trainer-Dokumentation](https://help.gong.io/docs/ai-trainer) (aktualisiert 13.04.2026) unterscheidet Persona, Unternehmenslage, Gesprächsanlass, Beziehungshistorie, Lernendenbriefing und optionale reale Gesprächsausschnitte. Motive und Kommunikationsstil sind ausdrücklich Teile der Persona. **Ableitung:** Unsere Figuren brauchen eigene Interessen und eine nachvollziehbare Vorgeschichte. Ein Szenario beschreibt eine Situation mit mehreren möglichen Verläufen. Die Dokumentation beweist keine interne Trennung von Spielerwissen und Bewertungswissen bei Gong.

[Practice customer calls](https://help.gong.io/docs/practice-customer-calls-with-ai-trainer) (15.09.2026) dokumentiert wiederholbare Versuche, Auswertung nach Gesprächsende und einen anschließenden dialogischen Coach. Versuche bleiben bis zur Abgabe privat. **Übernehmen:** Ausprobieren, gezieltes Nachfragen zum abgeschlossenen Versuch und sofortiges erneutes Üben. **Nicht übernehmen:** Pflichtmodule, Abgabeprozess und offene Scorecard während des Gesprächs als Standard für unsere kurze Telefonübung.

[Gong AI for scoring](https://help.gong.io/docs/gong-ai-for-scoring) (13.09.2026) empfiehlt eindeutige Einzelfragen, kleine definierte Skalen und Tests an realen Transkripten; warnt vor Ja-Tendenz und subjektiven Urteilen. Modellwechsel können Bewertungstrends verändern. **Übernehmen:** Belegpflicht und versionierte Bewertungsregeln. Eine technisch gestörte oder nicht beurteilbare Situation erhält keine erfundene Note.

[Aufnahmen navigieren](https://help.gong.io/docs/listen-to-and-navigate-a-call-recording) (14.09.2026) und [Kommentare](https://help.gong.io/docs/add-a-comment) (07.01.2026) dokumentieren Zeitsprünge und an Textstellen verankerte Rückmeldungen. **Übernehmen:** Jeder zentrale Coachinghinweis führt direkt zur betreffenden Stelle. Das Wiederherstellen des Zustands vor dieser Stelle ist unsere eigene technische Anforderung, kein nachgewiesenes Gong-Verfahren.

[Measuring AI performance](https://help.gong.io/docs/measuring-ai-performance-at-gong) (28.05.2026) beschreibt getrennte Vergleiche pro Funktion bei Änderungen an Modell, Prompt oder Eingangsdaten. **Übernehmen:** Alt/Neu/Gleichstand an denselben Referenzfällen; Dialogqualität, Figurentreue, Bewertung und Audio getrennt beurteilen. Ein erfolgreicher Build ist kein Qualitätsvergleich.

## Hyperbound: den schwierigen Moment wiederholen

[Restart calls](https://support.hyperbound.ai/articles/6184242048-restart-calls-from-any-point-in-time) dokumentiert den Neustart an einer Bot-Transkriptzeile mit Verweis auf das ursprüngliche Gespräch. **Übernehmen:** „Diesen Moment erneut üben“ beginnt bei der Figurenaussage vor der betreffenden Maklerantwort. Unveränderliche Zustandskopien und Herkunfts-IDs sind unsere Umsetzungsempfehlung; Hyperbounds interne Speicherung ist unbekannt.

Die Anleitungen zu [Cold Calls](https://support.hyperbound.ai/articles/9749423534-how-to-create-and-edit-a-cold-call-bot-in-hyperbound) und [Discovery](https://support.hyperbound.ai/articles/3527498343-how-to-how-to-create-a-discovery-call-bot-in-hyperbound) führen Identität, Prioritäten, Einwände, Meinungen, Vorwissen und Gesprächsanlass als Eingaben. **Übernehmen:** Eigentumssituation, Entscheidungsbefugnis, frühere Maklererfahrung und Offenbarungsbedingungen explizit beschreiben. **Verwerfen:** freundlich gleich leicht, unhöflich gleich schwer. Schwierigkeit entsteht bei uns aus widersprüchlichen Interessen, begrenzter Befugnis und Informationslücken.

[Scorecards mit Transkripten testen](https://support.hyperbound.ai/articles/1718325921-how-to-test-scorecards-with-transcripts) und [Bewertungsfehler korrigieren](https://support.hyperbound.ai/articles/8747788086-how-to-correct-ai-scoring-errors-in-hyperbound-s-coaching-platform) dokumentieren Kalibrierung anhand vorhandener Gespräche. [N/A](https://support.hyperbound.ai/articles/6080499305-enabling-the-n-a-option-on-scorecard-criteria) wird nicht als Null gewertet. **Übernehmen:** Referenzen mit berechtigtem Nein, guter Gesprächsführung ohne Termin und unzureichender Evidenz. Nicht anwendbar und nicht beurteilbar bleiben unterschiedliche Gründe.

[Building bots](https://support.hyperbound.ai/articles/2228003008-building-bots) weist darauf hin, dass eine KI Autoreneingaben umformt. **Verwerfen:** unkontrolliertes Neugenerieren eingefrorener Fallfakten. Entwürfe müssen geprüft und versioniert werden.

[Hyperbound Practice](https://www.hyperbound.ai/product/hyperbound-practice) bewirbt kurze Übungen und belegtes Feedback. **Ableitung:** kompakte Vorbereitung, eine Stärke, ein Hebel, Zitat und Wiederholung. Profilbasierte Charaktergenerierung ist keine Evidenz für private Motive einer realen Person. Figuren bleiben ausdrücklich fiktiv oder zusammengesetzt.

## Careertrainer: verständliche Vorbereitung und konkrete Rückmeldung

Die öffentlichen Produktseiten zu [KI-Rollenspielen](https://careertrainer.ai/funktionen/ki-rollenspiele/), [Szenariobibliothek](https://careertrainer.ai/funktionen/szenario-bibliothek/) und [Rollenspiele erstellen](https://careertrainer.ai/funktionen/rollenspiele-erstellen/) beschreiben charakterabhängige Reaktionen, Szenenauswahl nach Kategorie und Ziel sowie Klärung fehlender Angaben und Vorschau vor dem Start. Das sind Anbieterbeschreibungen, keine eigenen App-Tests; ein Veröffentlichungsdatum wurde nicht festgestellt. **Übernehmen:** verständliche Situationskarten und eine inhaltliche Prüfung, bevor eine Szene telefonierbar wird. **Nicht übernehmen:** ein breites Branchenportal im Einstieg unseres spezialisierten Produkts.

[KI-Gesprächsevaluierung](https://careertrainer.ai/funktionen/ki-gespraechsevaluierung/) beschreibt Zitate, Beispiele und die Unterscheidung zwischen Lernendenverhalten und Verhalten des KI-Gegenübers. **Übernehmen:** Der Makler darf nicht für Fehler oder mangelnde Kooperationsbereitschaft der Simulation bestraft werden. **Verwerfen:** pauschale Gewichtung 70 Prozent Ziele / 30 Prozent Kompetenzen und scheinpräzise Noten ohne eigene Kalibrierung. Eine separate Bewertungs-KI allein beweist keine Objektivität.

Ein öffentliches [Gründer-Demo-Transkript](https://de.linkedin.com/posts/janniklindner_das-ist-wirklich-mit-generativer-ki-m%C3%B6glich-activity-7351179494264602624-IeB0) wurde tatsächlich gelesen: Ein unpünktlicher Designer verteidigt sich zunächst mit längeren Arbeitszeiten, reagiert dann auf den Einwand zu Kernzeiten und schlägt flexible Zeiten vor. Das belegt im dargestellten Beispiel einen inhaltlichen Anschluss, aber keine anspruchsvolle Immobilienverhandlung. Die Aussage, stärkerer Widerstand sei einstellbar, bleibt Anbieterbehauptung. Audio und Bilder wurden nicht untersucht.

**Ableitung für Gedächtnis:** Die Wiederholung eines Moments benötigt den damaligen Zustand. Ein späteres Folgegespräch darf hingegen die abgeschlossene Vorgeschichte behalten. Diese zwei Modi dürfen nicht durch ein pauschales „merkt sich alles“ vermischt werden.

Die [OMR-Produktseite](https://omr.com/de/reviews/product/careertrainer-ai) enthielt zum Recherchezeitpunkt keine Nutzerbewertungen. Die identifizierten YouTube-Demos ([1](https://www.youtube.com/watch?v=aLaPIM7ICkE), [2](https://www.youtube.com/watch?v=7L938BQHxT8), [3](https://www.youtube.com/watch?v=PSeuNh1281E)) konnten nicht inhaltlich abgerufen werden. Titel oder Kapitelbeschreibungen sind kein angesehenes Video und kein Qualitätsnachweis.

## Gemeinsame Entscheidungen für MANZL

1. **Situation statt Gesprächsbaum:** konsistente Fakten, Motive und Grenzen; Antworten müssen sich auf den tatsächlichen Verlauf beziehen.
2. **Spieler und Coach trennen:** Trainingsziele und Rubrik gehören nicht in den Rollenprompt. Dies ist unser Vertrag, keine behauptete Wettbewerberarchitektur.
3. **Ein Moment als Arbeitseinheit:** Rückmeldung, Zitat, Hörposition und Repeat beziehen sich auf denselben Moment.
4. **Bewertung kalibrieren:** fachlich geprüfte Referenztranskripte, eindeutige Maßstäbe, echte Nichtbeurteilbarkeit und Versionsangaben.
5. **Qualität messen:** Vergleich mit dem alten Stand, Fehlunterbrechungen, Ende der Nutzeräußerung bis hörbare Antwort und vollständig hörbares Auflegen prüfen.
6. **Umfang begrenzen:** keine Übernahme von Forecast, Umsatzprognosen, Ranglisten, MEDDPICC oder breiten Unternehmensdashboards für den Trainingskern.

## Videos, Nutzerstimmen und offene Evidenz

Ein öffentlich zugängliches [Kundenvideo-Transkript von Cody Normand/Klaviyo](https://www.linkedin.com/posts/cody-normand_role-plays-suck-theyre-also-mostly-ineffective-activity-7478101328939077632-Mmko) wurde gelesen. Es beschreibt interne Quellen, erzeugte Entwürfe und manuelle Nachbearbeitung vor Nutzung. Aussagen zu Einarbeitung und Zeitgewinn bleiben ausgewählte Kundenbehauptungen. Audio und Videobilder wurden nicht untersucht.

Gefunden, aber **nicht angesehen oder angehört**: [Gong Academy](https://academy.gong.io/learn/video/how-gong-works), [Gong AI-Trainer-Kurs](https://academy.gong.io/learn/course/master-your-skills-with-gongs-ai-trainer/master-your-skills/with-gongs-ai-trainer), Hyperbound-[Discovery-Tutorial](https://www.loom.com/embed/5da00ab1a5d648fa8683ed6d22f4180d) und [Scorecard-Tutorial](https://www.loom.com/embed/35770f59e67d4385b6a580a69b7df160). Kein auswertbarer Video-/Audiostream oder lesbares Transkript dieser Ressourcen lag vor.

Die vollständigen G2-Seiten für [Gong](https://www.g2.com/products/gong/reviews) und [Hyperbound](https://www.g2.com/products/hyperbound/reviews) waren nicht abrufbar. Suchausschnitte begründen keinen Nutzerkonsens. Wettbewerbervergleiche anderer Anbieter wurden nicht als unabhängige Erfahrungsberichte verwendet.

Keine Folienpräsentation wurde geprüft. Keine eigenen Messungen zu Wettbewerberlatenz, österreichischem Dialekt, Unterbrechungsqualität oder Lerntransfer liegen vor. Hyperbounds [Mikrofonhilfe](https://support.hyperbound.ai/articles/2886820389-how-to-fix-an-unresponsive-bot-and-microphone-issues) beschreibt technische Audioprobleme, liefert aber keinen Latenzbenchmark. Diese Eigenschaften müssen wir an unserer App testen.
