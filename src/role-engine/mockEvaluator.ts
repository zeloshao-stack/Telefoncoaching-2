import { DIMENSION_LABELS } from "@/lib/content/pack";
import { defaultFocusForScenario, getFocus, type FocusId } from "@/lib/focus";
import { oneSentence } from "@/lib/spotlight";
import type { VerticalId } from "@/lib/verticals";
import type { Evaluation, RubricDimension, TranscriptTurn } from "./types";
import { detectUnverifiableClaim } from "./unverifiableClaims";

function quoteOf(turns: TranscriptTurn[], id: string) {
  return turns.find((t) => t.id === id)?.text ?? "";
}

function traineeTurns(turns: TranscriptTurn[]) {
  return turns.filter((t) => t.speaker === "trainee");
}

function verticalForScenario(scenarioId: string): VerticalId {
  if (scenarioId.startsWith("V")) return "versicherung";
  if (scenarioId.startsWith("F")) return "finanzierung";
  return "immobilien";
}

export function mockEvaluate(scenarioId: string, turns: TranscriptTurn[], focusId?: string): Evaluation {
  const trainee = traineeTurns(turns);
  const last = trainee[trainee.length - 1];

  const scores: Evaluation["scores"] = [];
  let importantMomentTurnId = last?.id ?? null;
  let correction = "Halten Sie sich an das, was im Gespräch tatsächlich gesagt wurde.";
  let strength =
    "In diesem kurzen Ausschnitt liegt noch keine belastbare Stärke — die Lehre sitzt bei der Korrektur.";
  let summary = "Belegte Auswertung auf Basis des Transkripts (Regel-Fallback, kein Live-Modell).";
  const mustNotice: string[] = [];

  const add = (
    dimension: RubricDimension,
    score: number | null,
    turnId: string | null,
    rationale: string,
  ) => {
    scores.push({
      dimension,
      score,
      evidenceTurnIds: turnId ? [turnId] : [],
      quote: turnId ? quoteOf(turns, turnId) : "",
      rationale,
    });
  };

  if (scenarioId === "S01") {
    const concession = trainee.find((t) => /36\.?000|auch um/.test(t.text.toLowerCase()));
    const buyers = trainee.find((t) => detectUnverifiableClaim(t.text) !== null);
    const diagnosis = trainee.find((t) =>
      /welche leistung|umfang|unterschied konkret|vergleichen/.test(t.text.toLowerCase()),
    );

    if (buyers) {
      add("truthfulness", 0, buyers.id, "Käufer und Mehrerlös sind im Fall nicht belegt.");
      importantMomentTurnId = buyers.id;
      correction =
        "Keine unbelegten Käufer oder sicheren Mehrerlöse. Bleiben Sie bei freigegebenen Fallinformationen.";
      mustNotice.push("unbelegte Käuferzahl", "unbelegte Sicherheit des Mehrerlöses");
      summary = "Wahrhaftigkeit bricht: erfundene Nachfrage. Stil hilft hier nicht.";
      strength = "Sie sind ins Argument gegangen. Die Substanz fehlt, weil die Käufer nicht belegt sind.";
    } else {
      add("truthfulness", null, null, "Keine grob unbelegte Käuferzahl im Transkript erkennbar.");
    }

    if (concession && !diagnosis) {
      add("diagnosis", 1, concession.id, "Der Vergleich wurde vor der Konzession nicht geklärt.");
      importantMomentTurnId = concession.id;
      correction =
        "Vor jeder Preisbewegung klären, welche Leistungen das andere Angebot umfasst. Erst dann über Honorar sprechen.";
      mustNotice.push("ungeklärter Leistungsumfang");
      summary = "Honorar wurde bewegt, bevor der Leistungsumfang klar war.";
      strength = "Sie haben den Preis nicht totgeschwiegen — aber zuerst gehört der Vergleich, nicht die Konzession.";
    } else if (diagnosis) {
      add("diagnosis", 4, diagnosis.id, "Eine relevante Informationslücke wird gezielt angesprochen.");
      importantMomentTurnId = diagnosis.id;
      correction =
        "Gut. Halten Sie den Preis noch offen, bis der Umfang steht — und erfinden Sie keine Käufer.";
      mustNotice.push("Preisfrage noch nicht abschließend beantwortet");
      summary = "Diagnose sitzt: der Vergleich wird erfragt, nicht erraten.";
      strength = "Sie klären den Leistungsumfang, bevor Sie das Honorar verteidigen.";
    } else {
      add("diagnosis", 2, last?.id ?? null, "Vergleich wurde nur teilweise aufgegriffen.");
    }

    add("commercial_judgment", concession ? 1 : diagnosis ? 3 : 2, last?.id ?? null, "Kaufmännische Lage folgt der Diagnose, nicht der Nachgiebigkeit.");
    add("next_step", 2, last?.id ?? null, "Nächster Schritt nur, wenn der Vergleich trägt.");
    add("contextual_fit", 3, last?.id ?? null, "Passung zum Honorarvergleich.");
    add("decision_process", null, null, "Keine klare Gelegenheit zur Entscheidungsbefugnis in diesem Ausschnitt.");
  } else if (scenarioId === "S02") {
    const respect = trainee.find((t) => /verstanden|vermerke|auf wiederhören|keine weiteren/.test(t.text.toLowerCase()));
    const pressure = trainee.find((t) => /zwei minuten|anbieten kann|hören, was/.test(t.text.toLowerCase()));
    const callback = trainee.find((t) => /sechs monat|wieder an/.test(t.text.toLowerCase()));

    if (pressure) {
      add("contextual_fit", 0, pressure.id, "Die explizite Ablehnung wird übergangen.");
      importantMomentTurnId = pressure.id;
      correction = "Grenze respektieren und auflegen. Hartnäckigkeit ist hier kein Erfolg.";
      mustNotice.push("Grenzüberschreitung");
      summary = "Druck nach klarem Nein. Berechtigtes Ende wäre der Erfolg.";
      strength = "Sie sind am Apparat geblieben. Die Grenze selbst wurde nicht aufgenommen.";
    } else if (callback) {
      add("next_step", 0, callback.id, "Der angekündigte nächste Schritt widerspricht der Kontaktablehnung.");
      add("contextual_fit", 1, callback.id, "Ablehnung wird in einen späteren Kontakt umgedeutet.");
      importantMomentTurnId = callback.id;
      correction = "Kein Rückruf ohne Zustimmung. Vermerken und beenden.";
      mustNotice.push("Widerspruch zur geäußerten Grenze");
      summary = "Nächster Schritt verletzt die geäußerte Grenze.";
      strength = "Ein Folgeschritt ist gedacht — er widerspricht aber dem ausgesprochenen Nein.";
    } else if (respect) {
      add("contextual_fit", 4, respect.id, "Die eindeutige Grenze wird respektiert.");
      add("next_step", 4, respect.id, "Kein Auftrag ist hier ein akzeptables Ergebnis.");
      importantMomentTurnId = respect.id;
      correction = "Genau so. Kein Bonus für Hartnäckigkeit, kein umgedeuteter Abschluss.";
      mustNotice.push("Kein Auftrag ist hier ein akzeptables Ergebnis.");
      summary = "Ablehnung respektiert. Das ist das Trainingsziel, kein Misserfolg.";
      strength = "Sie haben die klare Absage wörtlich genommen und das Gespräch beendet.";
    } else {
      add("contextual_fit", 2, last?.id ?? null, "Umgang mit der Absage ist uneindeutig.");
    }
    add("diagnosis", null, null, "Keine Diagnosepflicht gegen eine klare Kontaktablehnung.");
    add("truthfulness", null, null, "Keine erfundenen Käufer in diesem Fall im Vordergrund.");
    add("decision_process", null, null, "Nicht beurteilbar: Alleinablehnung, keine Mitentscheiderfrage.");
    add("commercial_judgment", 3, last?.id ?? null, "Ein begründetes Nein ist kaufmännisch zulässig.");
  } else if (scenarioId === "S03") {
    const close = trainee.find((t) => /auftrag|bestätigung/.test(t.text.toLowerCase()));
    const clarify = trainee.find((t) => /schwester|beide|entscheid/.test(t.text.toLowerCase()) && t.text.includes("?"));
    const mind = trainee.find((t) => /kontrolle|durchsetzen|offenbar/.test(t.text.toLowerCase()));

    if (close && !clarify) {
      add("decision_process", 0, close.id, "Interesse einer Person wird mit gemeinsamer Zustimmung verwechselt.");
      importantMomentTurnId = close.id;
      correction = "Keine Alleinvollmacht unterstellen. Klären, wie die Geschwister entscheiden.";
      mustNotice.push("fehlende Zustimmung");
      summary = "Auftrag ohne Vollmacht. Harte Regel verletzt.";
      strength = "Sie wollen verbindlich werden. Ohne die Schwester ist das keine Einigung.";
    } else if (mind) {
      add("contextual_fit", 0, mind.id, "Ein Motiv wird ohne Beleg unterstellt.");
      importantMomentTurnId = mind.id;
      correction = "Nicht Gedanken lesen. Fragen, was für die Schwester passen müsste.";
      mustNotice.push("unbelegte Interpretation");
      summary = "Unterstellung statt Klärung.";
      strength = "Sie haben die Schwester überhaupt erwähnt — aber als Motiv, nicht als Frage.";
    } else if (clarify) {
      add("decision_process", 4, clarify.id, "Der Entscheidungsprozess wird passend geklärt.");
      importantMomentTurnId = clarify.id;
      correction = "Halten Sie den nächsten Schritt gemeinsam — ohne erfundene Zustimmung der Schwester.";
      mustNotice.push("Zustimmung noch offen");
      summary = "Vollmacht wird ernst genommen. Das ist die Substanz.";
      strength = "Sie klären, wie die Geschwister entscheiden, statt Alleinvollmacht zu unterstellen.";
    } else {
      add("decision_process", 2, last?.id ?? null, "Mitentscheidung nur teilweise aufgegriffen.");
    }
    add("next_step", close ? 0 : clarify ? 3 : 2, last?.id ?? null, "Nächster Schritt muss zur ungeklärten Vollmacht passen.");
    if (mind) {
      add("truthfulness", 1, last?.id ?? null, "Ein Motiv wird ohne Beleg unterstellt.");
    } else {
      add("truthfulness", null, null, "Keine grob unbelegte Zustimmung der Schwester im Transkript erkennbar.");
    }
    add("diagnosis", 2, last?.id ?? null, "Lage der Miteigentümer nur soweit im Transkript sichtbar.");
    add("contextual_fit", mind ? 0 : 3, last?.id ?? null, "Passung zur Mitentscheidung.");
    add("commercial_judgment", 3, last?.id ?? null, "Kein Abschluss ohne Vollmacht ist kaufmännisch richtig.");
  } else if (scenarioId === "V01" || scenarioId === "V02") {
    const fake = trainee.find(
      (t) =>
        detectUnverifiableClaim(t.text) !== null ||
        /deckung zu 100|beitragsfrei/.test(t.text.toLowerCase()),
    );
    const close = trainee.find((t) => /auftrag|bestätigung|wir schließen|antrag|police ist durch/.test(t.text.toLowerCase()));
    const partner = trainee.find(
      (t) => /partner|wer entscheid|mitentscheider|wer muss mit|am vertrag/.test(t.text.toLowerCase()) && t.text.includes("?"),
    );
    const bedarf = trainee.find(
      (t) => /bedarf|wofür|was ist versichert|prämie|schaden|wechseln darf/.test(t.text.toLowerCase()) && t.text.includes("?"),
    );

    if (fake) {
      add("truthfulness", 0, fake.id, "Leistung oder Sicherheit sind im Fall nicht belegt.");
      importantMomentTurnId = fake.id;
      correction = "Keine erfundenen Deckungen. Bleiben Sie bei dem, was gesagt wurde.";
      summary = "Wahrhaftigkeit: unbelegte Leistung.";
      strength = "Sie argumentieren — aber mit Behauptungen, die der Fall nicht hergibt.";
    } else {
      add("truthfulness", null, null, "Keine grob unbelegte Deckung erkennbar.");
    }

    if (close && !partner) {
      add("decision_process", 0, close.id, "Abschluss ohne die Person, die mitentscheiden muss.");
      importantMomentTurnId = close.id;
      correction = "Kein Abschluss ohne den Partner. Zuerst klären, wer am Vertrag steht.";
      mustNotice.push("fehlende Zustimmung");
      summary = "Abschluss ohne Mitentscheider. Harte Regel verletzt.";
      strength = "Sie wollen verbindlich werden. Ohne den Partner ist das keine Einigung.";
    } else if (partner) {
      add("decision_process", 4, partner.id, "Der Mitentscheider wird erfragt, nicht unterstellt.");
      importantMomentTurnId = partner.id;
      correction = "Halten Sie den nächsten Schritt gemeinsam — ohne erfundene Zustimmung.";
      summary = "Vollmacht wird ernst genommen. Das ist die Substanz.";
      strength = "Sie klären, wer zustimmen muss, statt allein abzuschließen.";
    } else {
      add("decision_process", 2, last?.id ?? null, "Mitentscheidung nur teilweise aufgegriffen.");
    }

    if (bedarf && !close) {
      add("diagnosis", 4, bedarf.id, "Bedarf oder Schadenstand wird erfragt, nicht übersprungen.");
    } else if (close && !bedarf) {
      add("diagnosis", 1, close.id, "Produktbewegung, bevor der Bedarf klar war.");
    } else {
      add("diagnosis", 2, last?.id ?? null, "Bedarf nur teilweise angefasst.");
    }

    add("contextual_fit", partner || bedarf ? 3 : 2, last?.id ?? null, "Passung zu Versicherung: Bedarf und Vollmacht.");
    add("next_step", close && !partner ? 1 : partner ? 3 : 2, last?.id ?? null, "Nächster Schritt nur nach geklärter Vollmacht.");
    add("commercial_judgment", close && !partner ? 1 : 3, last?.id ?? null, "Kein Abschluss ohne Mitentscheider.");
  } else if (scenarioId === "F01" || scenarioId === "F02") {
    const fake = trainee.find(
      (t) =>
        detectUnverifiableClaim(t.text) !== null ||
        /bank sagt zu|zusage der bank|werberate|sicherer zins/.test(t.text.toLowerCase()),
    );
    const close = trainee.find((t) => /auftrag|bestätigung|wir schließen|antrag|kredit ist durch/.test(t.text.toLowerCase()));
    const signer = trainee.find(
      (t) => /unterschrift|partnerin|mann|wer zeichnet|wer muss mit|allein/.test(t.text.toLowerCase()) && t.text.includes("?"),
    );
    const tragbarkeit = trainee.find(
      (t) => /tragbar|einkommen|lasten|sondertilgung|bestehend/.test(t.text.toLowerCase()) && t.text.includes("?"),
    );

    if (fake) {
      add("truthfulness", 0, fake.id, "Rate oder Bankzusage sind im Fall nicht belegt.");
      importantMomentTurnId = fake.id;
      correction = "Keine erfundenen Raten. Bleiben Sie bei dem, was gesagt wurde.";
      summary = "Wahrhaftigkeit: unbelegte Zahl.";
      strength = "Sie wollen konkret sein — mit einer Zahl, die der Fall nicht hergibt.";
    } else {
      add("truthfulness", null, null, "Keine grob unbelegte Bankzusage erkennbar.");
    }

    if (close && !signer) {
      add("decision_process", 0, close.id, "Abschluss ohne die zweite Unterschrift.");
      importantMomentTurnId = close.id;
      correction = "Kein Abschluss ohne Mitunterschrift. Zuerst klären, wer zeichnet.";
      mustNotice.push("fehlende Unterschrift");
      summary = "Abschluss ohne zweite Unterschrift. Harte Regel verletzt.";
      strength = "Sie wollen verbindlich werden. Ohne die zweite Unterschrift geht das nicht.";
    } else if (signer) {
      add("decision_process", 4, signer.id, "Die Mitunterschrift wird erfragt.");
      importantMomentTurnId = signer.id;
      correction = "Halten Sie den nächsten Schritt gemeinsam — ohne erfundene Zeichnung.";
      summary = "Unterschriftenlage wird ernst genommen.";
      strength = "Sie klären, wer zeichnen muss, statt eine Rate zu verkaufen.";
    } else {
      add("decision_process", 2, last?.id ?? null, "Mitunterschrift nur teilweise aufgegriffen.");
    }

    if (tragbarkeit && !close) {
      add("diagnosis", 4, tragbarkeit.id, "Tragbarkeit oder Bestand wird erfragt, bevor eine Zahl fällt.");
    } else if (close && !tragbarkeit) {
      add("diagnosis", 1, close.id, "Abschlussbewegung, bevor die Tragbarkeit klar war.");
    } else {
      add("diagnosis", 2, last?.id ?? null, "Tragbarkeit nur teilweise angefasst.");
    }

    add("contextual_fit", signer || tragbarkeit ? 3 : 2, last?.id ?? null, "Passung zu Finanzierung: Tragbarkeit und Unterschrift.");
    add("next_step", close && !signer ? 1 : signer ? 3 : 2, last?.id ?? null, "Nächster Schritt nur nach geklärter Unterschrift.");
    add("commercial_judgment", close && !signer ? 1 : 3, last?.id ?? null, "Kein Abschluss ohne zweite Unterschrift.");
  } else {
    const buyers = trainee.find((t) => detectUnverifiableClaim(t.text) !== null);
    const close = trainee.find((t) => /auftrag|bestätigung/.test(t.text.toLowerCase()));
    const askedWill = trainee.find((t) => /verkaufen|wollen sie|wie geht|verfassung|gesprochen/.test(t.text.toLowerCase()) && t.text.includes("?"));

    if (buyers) {
      add("truthfulness", 0, buyers.id, "Käufer oder Sicherheit sind im Fall nicht belegt.");
      importantMomentTurnId = buyers.id;
      correction = "Keine unbelegten Käufer. Bleiben Sie bei dem, was gesagt wurde.";
      summary = "Wahrhaftigkeit: erfundene Nachfrage.";
      strength = "Sie argumentieren — aber mit Behauptungen, die der Fall nicht hergibt.";
    } else {
      add("truthfulness", null, null, "Keine grob unbelegte Käuferzahl erkennbar.");
    }

    if (close && !askedWill) {
      add("diagnosis", 1, close.id, "Abschlussbewegung, bevor die verdeckte Lage klar war.");
      if (!buyers) {
        importantMomentTurnId = close.id;
        correction = "Zuerst klären, ob verkauft werden soll und wie die Lage ist. Dann erst der nächste Schritt.";
        summary = "Zu früh verbindlich. Der verdeckte Zustand wurde nicht erfragt.";
        strength = "Sie wollen zum Punkt kommen. Ohne geklärten Willen ist das kein Auftrag.";
      }
    } else if (askedWill) {
      add("diagnosis", 4, askedWill.id, "Eine relevante verdeckte Lage wird erfragt, nicht unterstellt.");
      if (!buyers) {
        importantMomentTurnId = askedWill.id;
        correction = "Halten Sie den Druck raus. Verfassung und Wille sind keine Hebel zum Abschluss.";
        summary = "Diagnose sitzt: Sie fragen nach dem, was im Briefing nicht stand.";
        strength = "Sie klären den Willen, statt zu schließen.";
      }
    } else {
      add("diagnosis", 2, last?.id ?? null, "Die verdeckte Lage wurde nur teilweise angefasst.");
    }

    add("contextual_fit", askedWill ? 3 : 2, last?.id ?? null, "Passung zum eigenen Fall.");
    add("next_step", close ? 1 : askedWill ? 3 : 2, last?.id ?? null, "Nächster Schritt nur nach geklärtem Willen.");
    add("decision_process", null, null, "Keine Mitentscheiderfrage in diesem Entwurf.");
    add("commercial_judgment", close && !askedWill ? 1 : 3, last?.id ?? null, "Kein Auftrag bei Unentschlossenheit.");
  }

  const present = new Set(scores.map((s) => s.dimension));
  for (const dim of Object.keys(DIMENSION_LABELS) as RubricDimension[]) {
    if (!present.has(dim)) add(dim, null, null, "Keine ausreichende Gelegenheit in diesem Transkript.");
  }

  const abstainNote = scores.some((s) => s.score === null)
    ? "Enthaltung (null) bedeutet fehlende Gelegenheit, nicht Note 0."
    : null;

  const moment = turns.find((t) => t.id === importantMomentTurnId);
  const repeatPrompt = moment
    ? `Dieselbe Stelle: antworten Sie erneut auf „${turns.filter((t) => t.speaker === "counterpart").slice(-1)[0]?.text ?? "die letzte Aussage der Gegenseite"}“. Ziel: ${correction}`
    : correction;

  return applyFocus(
    {
      engine: "mock",
      summary,
      strength,
      scores,
      importantMomentTurnId,
      correction,
      nextStep: oneSentence(correction),
      repeatPrompt,
      mustNotice,
      abstainNote,
    },
    scenarioId,
    focusId,
  );
}

function applyFocus(ev: Evaluation, scenarioId: string, focusId?: string): Evaluation {
  const vertical = verticalForScenario(scenarioId);
  const resolved = (focusId as FocusId | undefined) || defaultFocusForScenario(scenarioId, vertical);
  const focus = getFocus(vertical, resolved);
  const scored = ev.scores.find((item) => item.dimension === focus.dimension);
  const value = scored?.score;
  if (value != null && value <= 2) {
    return {
      ...ev,
      summary: `${focus.label}: ${ev.summary}`,
      nextStep: focus.nextStep,
      correction: `${focus.nextStep} ${ev.correction}`.trim(),
      repeatPrompt: `${ev.repeatPrompt} Fokus: ${focus.label}.`,
    };
  }
  return {
    ...ev,
    nextStep: focus.nextStep,
  };
}
