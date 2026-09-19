export const COACH_SITUATIONS = [
  "vorbereitung",
  "erstkontakt",
  "einwand",
  "nachfassen",
  "reaktivierung",
  "entscheidung",
  "konditionen",
  "abschluss",
  "absage",
  "service",
] as const;

export type CoachSituationId = (typeof COACH_SITUATIONS)[number];

export type CoachPrompt = {
  title: string;
  text: string;
  situation: CoachSituationId;
};

export type CoachPlaybook = {
  id: string;
  situation: CoachSituationId;
  title: string;
  goal: string;
  do: string[];
  avoid: string[];
  questions: string[];
  phrase: string;
};

export const SITUATION_LABELS: Record<CoachSituationId, string> = {
  vorbereitung: "Vor dem Anruf",
  erstkontakt: "Erstkontakt",
  einwand: "Einwand",
  nachfassen: "Nachfassen",
  reaktivierung: "Reaktivieren",
  entscheidung: "Wer entscheidet",
  konditionen: "Preis und Leistung",
  abschluss: "Abschlussreife",
  absage: "Klare Absage",
  service: "Service und Konflikt",
};

export const PLAYBOOKS: CoachPlaybook[] = [
  {
    id: "PB-PREP-001",
    situation: "vorbereitung",
    title: "90-Sekunden-Check",
    goal: "Vor dem Anruf Zulässigkeit, Anlass, ein Ziel und ein Abbruchkriterium klären — nicht den Auftrag.",
    do: [
      "Kontaktweg und Einwilligung prüfen. Ohne zulässige Grundlage kein Werbeanruf.",
      "Ein echter Anlass, drei Fragen, eine Wahrheitsgrenze.",
      "Ziel ist die nächste angemessene Stufe, nicht der Abschluss.",
    ],
    avoid: [
      "Erfundenen Anlass.",
      "Skript ohne Abbruchkriterium.",
      "Rechts- oder Preiszusagen vorbereiten, die nicht belegt sind.",
    ],
    questions: [
      "Weshalb ist dieser Kontakt für diese Person möglicherweise relevant?",
      "Was darf ich sicher sagen — und was muss ich prüfen?",
      "Wann beende ich respektvoll, statt weiter zu drücken?",
    ],
    phrase:
      "Ich rufe an, weil [belegter Anlass]. In 20 Sekunden der Grund — danach entscheiden Sie, ob das relevant ist.",
  },
  {
    id: "PB-OPEN-001",
    situation: "erstkontakt",
    title: "Wer, weshalb, Nein ist erlaubt",
    goal: "Identität, Anlass und Wahlfreiheit in den ersten Sätzen. Danach die Lage klären, nicht die Leistung vortragen.",
    do: [
      "Erlaubnis: wer, weshalb, Gegenüber kann Nein sagen.",
      "Relevanz als prüfbare Vermutung, nicht als Behauptung über die Person.",
      "Klären, erst dann Brücke, dann ein kleiner nächster Schritt.",
    ],
    avoid: [
      "„Störe ich?“",
      "Firmenmonolog.",
      "Fingierte Bekanntschaft.",
      "Kaltakquise ohne zulässigen Kontaktweg.",
    ],
    questions: [
      "Wie sehen Sie das Thema heute grundsätzlich?",
      "Was müsste geklärt sein, bevor das überhaupt ein Thema wird?",
      "Wer müsste bei so einer Überlegung eingebunden sein?",
    ],
    phrase:
      "Guten Tag, [Name], [Name] von [Firma]. Darf ich Ihnen in 20 Sekunden sagen, weshalb ich anrufe — und Sie entscheiden, ob das gerade passt?",
  },
  {
    id: "PB-OBJ-001",
    situation: "einwand",
    title: "Einwand aufnehmen",
    goal: "Den Einwand nicht widerlegen. Erst Bedeutung und Ursache klären, dann eine bescheidene Option.",
    do: [
      "Validieren, nur wenn verstanden.",
      "Spiegeln: den Kern in eigenen Worten.",
      "Klären: Hauptgrund oder noch etwas anderes?",
      "Erst danach eine passende Brücke.",
    ],
    avoid: [
      "Dagegen argumentieren.",
      "Sofort Preis senken oder Leistung verteidigen.",
      "Konkurrenz abwerten.",
      "Ein klares Nein umdeuten.",
    ],
    questions: [
      "Was macht das Thema für Sie heute ausgeschlossen?",
      "Ist das der Hauptgrund, oder spricht noch etwas dagegen?",
      "Woran beurteilen Sie, ob sich der Aufwand am Ende gerechnet hat?",
    ],
    phrase:
      "Das kann ich nachvollziehen. Sie wollen [Kern]. Ist das der Hauptpunkt — oder gibt es noch etwas, das gegen ein Gespräch spricht?",
  },
  {
    id: "PB-FOLLOW-001",
    situation: "nachfassen",
    title: "Nachfassen ohne Druck",
    goal: "An eine konkrete Zusage anknüpfen, echten Mehrwert anbieten, leichten Ausstieg lassen.",
    do: [
      "Bezug auf vereinbarten Punkt, Frage oder Unterlage.",
      "Einen tatsächlichen Klärungspunkt anbieten.",
      "Ja, Nein oder konkreter Termin — kein Schwebezustand.",
    ],
    avoid: [
      "„Ich wollte nur nachfragen.“",
      "Erfundene Dringlichkeit.",
      "Seriennachrichten ohne neuen Anlass.",
    ],
    questions: [
      "Was genau sollte bis zu diesem Zeitpunkt geklärt sein?",
      "Ist ein kurzes Gespräch sinnvoll — oder soll das Thema ruhen?",
    ],
    phrase:
      "Sie wollten [konkreten Punkt] klären. Ist ein kurzes Telefonat [Zeitfenster] sinnvoll — oder soll ich das Thema vorerst ruhen lassen?",
  },
  {
    id: "PB-LOST-001",
    situation: "reaktivierung",
    title: "Verlorenen Kontakt reaktivieren",
    goal: "Die frühere Entscheidung respektieren. Nur mit neuem, wahrem Anlass und Erlaubnis wieder öffnen.",
    do: [
      "Entscheidung anerkennen, nicht nachkarten.",
      "Einen kurzen, ehrlichen Anlass nennen.",
      "Einverständnis für den jetzigen Kontakt einholen.",
      "Danach Lage klären oder sauber beenden.",
    ],
    avoid: [
      "So tun, als wäre nichts entschieden worden.",
      "Rabatt oder Angst als Wiedereröffnung.",
      "Die Person umgehen, die damals abgelehnt hat.",
    ],
    questions: [
      "Darf ich anknüpfen, weil sich [belegter Anlass] geändert hat?",
      "Was wäre heute anders als beim letzten Mal — oder bleibt die Entscheidung stehen?",
    ],
    phrase:
      "Sie haben damals klar entschieden. Ich rufe nur an, weil [neuer Anlass]. Soll ich das kurz einordnen — oder belassen wir es dabei?",
  },
  {
    id: "PB-AUTH-001",
    situation: "entscheidung",
    title: "Wer zustimmen muss",
    goal: "Interesse einer Person ist keine Vollmacht. Entscheidungsarchitektur vor dem Auftrag klären.",
    do: [
      "Fragen, wer rechtlich und inhaltlich eingebunden ist.",
      "Keine Vereinbarung treffen, die eine abwesende Partei bindet.",
      "Den gemeinsamen nächsten Schritt vorschlagen.",
    ],
    avoid: [
      "Abschluss mit der Person am Apparat erzwingen.",
      "Eine Partei als Hindernis behandeln.",
      "Vertrauliches einer Seite gegen die andere verwenden.",
    ],
    questions: [
      "Wer muss einer Entscheidung zustimmen oder sie zumindest verstehen?",
      "Wo sehen Sie heute unterschiedliche Ziele?",
      "Wie soll die gemeinsame Entscheidung vorbereitet werden?",
    ],
    phrase:
      "Bevor wir etwas Verbindliches machen: Wer außer Ihnen muss zustimmen — und was bräuchte diese Person, um mitentscheiden zu können?",
  },
  {
    id: "PB-PRICE-001",
    situation: "konditionen",
    title: "Preis, Prämie, Honorar",
    goal: "Kein Zugeständnis, bevor Vergleichsrahmen und Kriterium klar sind.",
    do: [
      "Zuerst verstehen, woran die Zahl gemessen wird.",
      "Leistungsumfang und Bedingungen nebeneinanderlegen.",
      "Alternativen als transparente Pakete, nicht als Druck.",
    ],
    avoid: [
      "Sofort nachgeben, weil eine Zahl genannt wird.",
      "Unbegründete Garantien.",
      "Werturteile über die Preisvorstellung.",
    ],
    questions: [
      "Woran messen Sie, ob die Kondition gerechtfertigt ist?",
      "Geht es um das Budget, die Vergleichbarkeit oder ein offenes Leistungsrisiko?",
      "Welche Leistung wäre verzichtbar, falls wir den Umfang verändern?",
    ],
    phrase:
      "Bevor wir an der Zahl drehen: Was genau umfasst das andere Angebot — und woran erkennen Sie, dass sich der Unterschied für Sie rechnet?",
  },
  {
    id: "PB-CLOSE-001",
    situation: "abschluss",
    title: "Abschlussreife prüfen",
    goal: "Nur abschließen, wenn Lage, Bedarf, Entscheider und nächster Schritt klar sind. Sonst die Lücke benennen.",
    do: [
      "Bedarf oder Lage in einem Satz spiegeln.",
      "Offene Punkte sichtbar machen.",
      "Genau eine verbindliche nächste Handlung vorschlagen — oder respektvoll stoppen.",
    ],
    avoid: [
      "Produkt oder Auftrag, bevor die Lage klar ist.",
      "Abschlussdruck bei Unentschlossenheit.",
      "Zusagen zu Recht, Preis, Deckung oder Finanzierung ohne Beleg.",
    ],
    questions: [
      "Was fehlt Ihnen noch, um das seriös beurteilen zu können?",
      "Wer muss noch zustimmen?",
      "Woran erkennen wir nach diesem Schritt, ob es passt?",
    ],
    phrase:
      "Wenn [Bedarf] stimmt und [Person] mitentscheiden kann, ist der nächste Schritt [konkrete Handlung]. Was davon ist noch offen?",
  },
  {
    id: "PB-NO-001",
    situation: "absage",
    title: "Berechtigtes Nein",
    goal: "Eine klare Absage respektieren und beenden. Hartnäckigkeit ist kein Erfolg.",
    do: [
      "Nein wörtlich nehmen.",
      "Kurz bestätigen, was gilt: keine weiteren Anrufe, kein Auftrag, Thema ruht.",
      "Nur auf ausdrückliche Erlaubnis später einen begründeten Anknüpfungspunkt offenhalten.",
    ],
    avoid: [
      "Weiter argumentieren.",
      "Absage in einen verdeckten Abschluss umdeuten.",
      "„Nur noch eine Frage“ nach dem Nein.",
    ],
    questions: [
      "Soll ich vermerken, dass keine weiteren Anrufe erwünscht sind?",
    ],
    phrase:
      "Verstanden. Ich vermerke, dass Sie keine weiteren Anrufe wünschen. Alles Gute — auf Wiederhören.",
  },
  {
    id: "PB-SVC-001",
    situation: "service",
    title: "Service, Frist, Deeskalation",
    goal: "Sachverhalt, Verantwortung und Frist klären. Kein Abschlussdruck. Keine Rechts- oder Technikzusage ohne Prüfung.",
    do: [
      "Konkret: was ist wann passiert.",
      "Zuständigkeit und nächsten dokumentierten Schritt nennen.",
      "Rückmeldung mit Zeitpunkt, nicht mit ungesicherter Zusage.",
    ],
    avoid: [
      "Sofortige rechtliche oder technische Zusage.",
      "Schuld zuweisen.",
      "Das Anliegen in einen Verkauf umbiegen.",
    ],
    questions: [
      "Was ist konkret wann passiert?",
      "Was wurde bisher unternommen — und bis wann brauchen Sie eine Rückmeldung?",
      "Wer darf den nächsten Schritt beauftragen?",
    ],
    phrase:
      "Ich verstehe, dass das dringend wirkt. Damit ich es richtig zuordne: Was ist konkret wann passiert? Ich kläre [Punkt] und gebe Ihnen bis [Zeitpunkt] Rückmeldung.",
  },
];

const KEYWORDS: Record<CoachSituationId, RegExp> = {
  vorbereitung: /vorbereit|briefing|vor dem anruf|check|zulässig|einwilligung|anlass/,
  erstkontakt: /kaltakquise|erstkontakt|erstgespräch|einstieg|eröffn|werbeanruf|anrufen|kontakt aufnehmen/,
  einwand: /einwand|zu teuer|kein interesse|schon einen|privat verk|schicken sie|überlege noch|nicht verkaufen|kündigen/,
  nachfassen: /nachfass|nachhak|keine rückmeldung|liegt das angebot|wollte nur|folgeanruf/,
  reaktivierung: /reaktiv|verloren|konkurrenz|zurückhol|bestandskunde ist weg|kunde ist weg|abgesprungen|mandatsverlust/,
  entscheidung: /vollmacht|partner|miteigent|erben|unterschrift|wer entscheid|wer muss|nicht am apparat|beirat|geschwister|keinen auftrag|keinen abschluss/,
  konditionen: /honorar|provision|prämie|praemie|preis|leistungsumfang|kondition|vergleich|rabatt|36|48/,
  abschluss: /abschließ|abschluss|mandat|auftrag|police|polic|reservier|unterschreib|haushaltsversicherung|bedarf vor|produktpitch/,
  absage: /absage|keine anrufe|auflegen|endgültig nicht|will nicht/,
  service: /schaden|beschwerde|betriebskosten|professionist|eskalation|ticket|wohnung unbewohn|heizung|wasserschaden/,
};

export function classifyCoachQuestion(question: string): CoachSituationId {
  const q = question.toLowerCase();
  let best: CoachSituationId = "erstkontakt";
  let score = 0;
  for (const situation of COACH_SITUATIONS) {
    if (KEYWORDS[situation].test(q)) {
      const n = (q.match(KEYWORDS[situation]) || []).length + 1;
      if (n > score) {
        score = n;
        best = situation;
      }
    }
  }
  return best;
}

export function playbookFor(situation: CoachSituationId): CoachPlaybook {
  return PLAYBOOKS.find((item) => item.situation === situation) ?? PLAYBOOKS[1]!;
}

export function playbooksForQuestion(question: string): CoachPlaybook[] {
  const primary = playbookFor(classifyCoachQuestion(question));
  const extras = PLAYBOOKS.filter((item) => item.id !== primary.id && KEYWORDS[item.situation].test(question.toLowerCase()));
  return [primary, ...extras].slice(0, 2);
}

export function formatPlaybooks(books: CoachPlaybook[]): string {
  return books
    .map(
      (book) =>
        `${book.id} · ${book.title}: Ziel: ${book.goal} Tun: ${book.do.join(" ")} Nicht: ${book.avoid.join(" ")} Formulierung: ${book.phrase}`,
    )
    .join("\n");
}

export const COACH_PROMPTS: Record<string, CoachPrompt[]> = {
  immobilien: [
    {
      situation: "vorbereitung",
      title: "Vor dem Eigentümeranruf",
      text: "Wie bereite ich einen Anruf beim Eigentümer vor — Anlass, Ziel und Abbruch — ohne den Auftrag schon im Kopf zu haben?",
    },
    {
      situation: "erstkontakt",
      title: "Erstkontakt, Verkauf unklar",
      text: "Wie eröffne ich das Gespräch, wenn unklar ist, ob überhaupt verkauft werden soll?",
    },
    {
      situation: "einwand",
      title: "„Ich verkaufe nicht“",
      text: "Der Eigentümer sagt klar, ein Verkauf sei ausgeschlossen. Wie gehe ich mit diesem Einwand um, ohne dagegen zu argumentieren?",
    },
    {
      situation: "konditionen",
      title: "Honorar vor dem Nachgeben",
      text: "Wie kläre ich den Leistungsumfang, bevor ich über das Honorar spreche — ohne sofort nachzugeben?",
    },
    {
      situation: "entscheidung",
      title: "Miteigentum und Vollmacht",
      text: "Ein Geschwister zeigt Interesse. Wann darf ich keinen Auftrag annehmen?",
    },
    {
      situation: "nachfassen",
      title: "Nachfassen ohne Druck",
      text: "Nach dem Gespräch sollte die Person Unterlagen mit der Familie klären. Wie fasse ich nach, ohne zu drängen?",
    },
    {
      situation: "reaktivierung",
      title: "Mandat verloren",
      text: "Der Eigentümer ist zu einem anderen Büro gegangen. Wie reaktiviere ich den Kontakt — oder lasse ich ihn ruhen?",
    },
    {
      situation: "abschluss",
      title: "Bauträger: Reservierung",
      text: "Ein Kaufinteressent will reservieren, die Finanzierung ist unklar. Was muss ich klären, bevor etwas Verbindliches entsteht?",
    },
    {
      situation: "absage",
      title: "Keine weiteren Anrufe",
      text: "Der Eigentümer will nicht verkaufen und keine weiteren Anrufe. Was ist der richtige nächste Schritt?",
    },
  ],
  versicherung: [
    {
      situation: "vorbereitung",
      title: "Vor dem Beratungsgespräch",
      text: "Wie bereite ich den Anruf zur Haushaltsversicherung vor — Bedarf, Unterlagen, Abbruch — ohne schon eine Police im Kopf zu haben?",
    },
    {
      situation: "erstkontakt",
      title: "Erstgespräch ohne Produktpitch",
      text: "Wie eröffne ich ein Gespräch zur Absicherung, ohne sofort eine Police zu empfehlen?",
    },
    {
      situation: "abschluss",
      title: "Haushaltsversicherung abschließen",
      text: "Wie schließe ich eine Haushaltsversicherung ab? Was muss am Telefon geklärt sein, bevor etwas Verbindliches entsteht?",
    },
    {
      situation: "einwand",
      title: "„Die Prämie ist zu teuer“",
      text: "Der Kunde vergleicht nur die Prämie. Wie kläre ich Leistung und Bedarf, ohne sofort Rabatt zu geben?",
    },
    {
      situation: "entscheidung",
      title: "Partner nicht am Apparat",
      text: "Nur eine Person ist am Apparat. Wann darf ich keinen Abschluss annehmen?",
    },
    {
      situation: "nachfassen",
      title: "Angebot ohne Rückmeldung",
      text: "Das Angebot liegt, es kommt keine Rückmeldung. Wie fasse ich nach, ohne zu drängen?",
    },
    {
      situation: "reaktivierung",
      title: "Bestandskunde ist weg",
      text: "Der Kunde ist zur Konkurrenz gewechselt. Wie spreche ich das an — mit neuem Anlass, ohne nachzukarten?",
    },
    {
      situation: "absage",
      title: "Kündigen, nichts Neues",
      text: "Die Kundin will kündigen und kein neues Angebot. Was ist der richtige nächste Schritt?",
    },
  ],
  hausverwaltung: [
    {
      situation: "service",
      title: "Akuter Schaden",
      text: "Mieter meldet Wasserschaden und will sofort eine Zusage. Wie kläre ich Sachverhalt, Frist und Verantwortung — ohne etwas zuzusagen, das ich nicht prüfen kann?",
    },
    {
      situation: "service",
      title: "Betriebskostenbeschwerde",
      text: "Ein Eigentümer hält die Abrechnung für falsch. Wie führe ich das Gespräch, ohne mich zu rechtfertigen oder zu eskalieren?",
    },
    {
      situation: "entscheidung",
      title: "Beirat unter Frist",
      text: "Der Beirat verlangt eine Zusage und Unterlagen bis morgen. Was darf ich zusagen — und was muss ich prüfen?",
    },
    {
      situation: "einwand",
      title: "„Das ist Ihre Pflicht“",
      text: "Die Gegenseite weist jede Mitwirkung zurück. Wie entgegne ich, ohne in einen Streit über Zuständigkeit zu kippen?",
    },
    {
      situation: "nachfassen",
      title: "Professionist kommt nicht",
      text: "Der Handwerker ist nicht erschienen. Wie fasse ich nach — intern und gegenüber dem Melder — mit klarem Zeitpunkt?",
    },
    {
      situation: "absage",
      title: "Keine Sofortzusage",
      text: "Ich kann die rechtliche oder technische Entscheidung jetzt nicht treffen. Wie beende ich das Gespräch verbindlich, ohne zu blockieren?",
    },
  ],
  finanzierung: [
    {
      situation: "vorbereitung",
      title: "Vor dem Kreditgespräch",
      text: "Wie bereite ich das Gespräch zum Wohnkredit vor — Zweck, Tragbarkeit, Unterlagen — ohne eine Rate zu versprechen?",
    },
    {
      situation: "abschluss",
      title: "Tragbarkeit vor der Rate",
      text: "Wie kläre ich Tragbarkeit, ohne eine Rate zu nennen, die ich nicht belegen kann?",
    },
    {
      situation: "entscheidung",
      title: "Zwei Unterschriften",
      text: "Nur eine Person ist am Apparat. Wann ist ein Abschluss unzulässig?",
    },
    {
      situation: "einwand",
      title: "„Die Rate ist zu hoch“",
      text: "Die Gegenseite bricht am Betrag ab. Wie kläre ich Lasten und Zweck, bevor ich an der Zahl drehe?",
    },
    {
      situation: "nachfassen",
      title: "Unterlagen fehlen",
      text: "Für die Prüfung fehlen Unterlagen. Wie fasse ich nach, ohne Druck auf die Unterschrift?",
    },
    {
      situation: "reaktivierung",
      title: "Kredit abgelehnt",
      text: "Ein früherer Antrag ist gescheitert. Wie spreche ich das wieder an, ohne falsche Bankzusagen?",
    },
  ],
};

export function groupCoachPrompts(prompts: CoachPrompt[]): { id: CoachSituationId; label: string; prompts: CoachPrompt[] }[] {
  const order: CoachSituationId[] = [];
  for (const prompt of prompts) {
    if (!order.includes(prompt.situation)) order.push(prompt.situation);
  }
  return order.map((id) => ({
    id,
    label: SITUATION_LABELS[id],
    prompts: prompts.filter((prompt) => prompt.situation === id),
  }));
}

/** 12 Enablement-Karten = Grammatik, nicht 12 Screens. Karte 12 ist Loop, keine Situation. */
export type EnablementCard = {
  id: number;
  situation: CoachSituationId | null;
  chipTitle: string;
  einwandOnly?: boolean;
};

export const ENABLEMENT_CARDS: EnablementCard[] = [
  { id: 1, situation: "vorbereitung", chipTitle: "Anlass und Abbruch" },
  { id: 2, situation: "erstkontakt", chipTitle: "Wer, weshalb, Nein ist erlaubt" },
  { id: 3, situation: "erstkontakt", chipTitle: "Lage vor der Leistung" },
  { id: 4, situation: "einwand", chipTitle: "Einwand aufnehmen", einwandOnly: true },
  { id: 5, situation: "absage", chipTitle: "Berechtigtes Nein" },
  { id: 6, situation: "nachfassen", chipTitle: "Nachfassen am Punkt" },
  { id: 7, situation: "reaktivierung", chipTitle: "Öffnen oder lassen" },
  { id: 8, situation: "entscheidung", chipTitle: "Wer mitreden muss" },
  { id: 9, situation: "konditionen", chipTitle: "Leistung vor Zahl" },
  { id: 10, situation: "abschluss", chipTitle: "Lücke vor dem Ja" },
  { id: 11, situation: "service", chipTitle: "Frist und Sachverhalt" },
  { id: 12, situation: null, chipTitle: "Nächster angemessener Schritt" },
];

export const NEXT_STEP_PROMPT: CoachPrompt = {
  situation: "abschluss",
  title: "Nächster angemessener Schritt",
  text: "Was ist der eine nächste angemessene Schritt — ein Termin, ein Ruhen oder ein klares Nein? Ein Termin ist kein Beweis.",
};

export function enablementChipTitle(situation: CoachSituationId): string {
  const card = ENABLEMENT_CARDS.find((item) => item.situation === situation);
  return card?.chipTitle ?? SITUATION_LABELS[situation];
}

export function groupEnablementPrompts(
  prompts: CoachPrompt[],
  opts?: { includeEinwand?: boolean },
): { id: CoachSituationId; label: string; prompts: CoachPrompt[] }[] {
  const includeEinwand = opts?.includeEinwand ?? true;
  const filtered = includeEinwand ? prompts : prompts.filter((prompt) => prompt.situation !== "einwand");
  const groups = groupCoachPrompts(filtered);
  const hasNext = groups.some((group) => group.prompts.some((prompt) => prompt.title === NEXT_STEP_PROMPT.title));
  if (hasNext) return groups.map((group) => ({ ...group, label: enablementChipTitle(group.id) }));
  const close = groups.find((group) => group.id === "abschluss");
  if (close) close.prompts = [...close.prompts, NEXT_STEP_PROMPT];
  else groups.push({ id: "abschluss", label: enablementChipTitle("abschluss"), prompts: [NEXT_STEP_PROMPT] });
  return groups.map((group) => ({ ...group, label: enablementChipTitle(group.id) }));
}
