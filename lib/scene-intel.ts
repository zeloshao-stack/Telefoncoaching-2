/**
 * Coach-/Karten-Pack für Frozen-Drills S01–S08.
 * Authored Trainingsstücke: ein Fokus, drei Ziele (title + why), Challenge, public_brief.
 * qualify/prep/evalBeats nur Coach nach Hangup. Keine zweite Rubrik, kein 0–4, kein 70/30.
 *
 * Role Player / persona-prompt / characters: dieses Modul nicht importieren.
 */

import { FROZEN_SCENARIO_IDS, SCENARIO_BLURBS, type FrozenScenarioId } from "@/lib/content/pack";
import { drillHonesty } from "@/lib/scenario-product";

/** Nur im Coach-Kontext. Player-Prompts dürfen dieses Wort nicht enthalten. */
export const TRAININGSZIELE_MARKER = "TRAININGSZIELE";

export type SceneBeat = {
  /** Fetttitel — Nutzer-UI und Coach. */
  title: string;
  /** Ein Satz, warum das zählt — Katalog, Briefing und Coach. Nicht Role Player. */
  why: string;
};

export type SceneEvalBeat = {
  title: string;
  /** Hörbares Verhalten, derselbe Fokus — Hinweis, keine Note. */
  observable: string;
};

export type SceneIntel = {
  id: FrozenScenarioId;
  challenge: string;
  goal: string;
  beats: SceneBeat[];
  qualify: string[];
  prep: string[];
  evalBeats: SceneEvalBeat[];
};

/** Was A04 auf Katalog/Briefing zeigen darf — title+why, ohne evalBeats. */
export type SceneIntelPublic = {
  id: FrozenScenarioId;
  challenge: string;
  goal: string;
  beatTitles: string[];
  beats: Array<{ title: string; why: string }>;
  qualify: string[];
  prep: string[];
};

type AuthoredIntel = Omit<SceneIntel, "id" | "goal">;

/**
 * Authored, nicht synthetisiert. goal zur Laufzeit aus drillHonesty.practiceFocus.
 * Ein Drill, drei Beobachtungsmomente — nicht drei Kompetenzen.
 */
const PACK: Record<FrozenScenarioId, AuthoredIntel> = {
  S01: {
    challenge: SCENARIO_BLURBS.S01,
    beats: [
      {
        title: "Umfang zuerst",
        why: "Sie klären, ob beide Honorare tatsächlich dieselben Leistungen und Bedingungen abdecken.",
      },
      {
        title: "Unterschied prüfen",
        why: "Sie erklären den Unterschied von 12.000 Euro anhand belegter Leistungen, die der Eigentümerin wichtig sind.",
      },
      {
        title: "Überlegt verhandeln",
        why: "Sie entscheiden erst nach dem Vergleich, ob und worüber eine Verhandlung sinnvoll ist.",
      },
    ],
    qualify: [
      "Was das andere Angebot umfasst.",
      "Woran die Gegenseite die 12.000 Euro Unterschied misst.",
    ],
    prep: [
      "Erlaubtes Gespräch, Alleineigentümerin, Alsergrund.",
      "Eigenes Angebot: 48.000 EUR Honorar, Aufbereitung und Käuferqualifizierung.",
      "Konkurrenzumfang unbekannt.",
      "Alle Beträge sind erfundene Trainingswerte.",
    ],
    evalBeats: [
      {
        title: "Umfang zuerst",
        observable: "Fragt nach Leistungen oder Bedingungen des anderen Angebots, bevor eine Preisbewegung kommt.",
      },
      {
        title: "Unterschied prüfen",
        observable: "Prüft den genannten Unterschied anhand dessen, was gesagt oder im Briefing steht.",
      },
      {
        title: "Überlegt verhandeln",
        observable: "Bewegt die eigene Zahl nicht, bevor der Vergleich geklärt ist.",
      },
    ],
  },
  S02: {
    challenge: SCENARIO_BLURBS.S02,
    beats: [
      {
        title: "Absage aufnehmen",
        why: "Sie zeigen, dass Sie die klare Absage gehört haben, ohne nach einem versteckten Interesse zu suchen.",
      },
      {
        title: "Kontaktwunsch respektieren",
        why: "Sie respektieren auch den Wunsch nach keinen weiteren Anrufen und vereinbaren keinen unerwünschten Rückruf.",
      },
      {
        title: "Sauber beenden",
        why: "Sie beenden das Gespräch ruhig und verbindlich, ohne noch ein Verkaufsargument anzuhängen.",
      },
    ],
    qualify: [
      "Dass keine weiteren Anrufe gewünscht sind.",
      "Dass kein Rückruf und kein Auftrag entsteht.",
    ],
    prep: [
      "Kaltanruf, Ottakring.",
      "Die Person lehnt Verkauf und weitere Gespräche ausdrücklich ab.",
      "Ein Auftrag ist hier kein Ziel.",
    ],
    evalBeats: [
      {
        title: "Absage aufnehmen",
        observable: "Nimmt das gesagte Nein auf, ohne es umzudeuten.",
      },
      {
        title: "Kontaktwunsch respektieren",
        observable: "Vereinbart keinen Rückruf und keinen Auftrag gegen den Wunsch.",
      },
      {
        title: "Sauber beenden",
        observable: "Beendet das Gespräch oder akzeptiert das Ende.",
      },
    ],
  },
  S03: {
    challenge: SCENARIO_BLURBS.S03,
    beats: [
      {
        title: "Entscheidung gemeinsam verstehen",
        why: "Sie klären, wie die Geschwister entscheiden und welche Rolle Ihr Gesprächspartner dabei hat.",
      },
      {
        title: "Interesse richtig einordnen",
        why: "Sie nehmen sein Interesse ernst, ohne daraus eine Zustimmung der abwesenden Schwester abzuleiten.",
      },
      {
        title: "Gemeinsamer Schritt",
        why: "Sie finden einen nächsten Schritt, der beide Geschwister einbezieht und keine Entscheidung vorwegnimmt.",
      },
    ],
    qualify: [
      "Wer außer der Person am Apparat zustimmen muss.",
      "Ob eine Vollmacht vorliegt.",
      "Was ein gemeinsamer nächster Schritt sein kann, ohne die abwesende Partei zu binden.",
    ],
    prep: [
      "Elternhaus in Währing, zwei Geschwister.",
      "Ein Gesprächspartner äußert Interesse.",
      "Vollmacht der Schwester ist ungeklärt.",
    ],
    evalBeats: [
      {
        title: "Entscheidung gemeinsam verstehen",
        observable: "Fragt, wer zustimmen muss, bevor etwas Verbindliches entsteht.",
      },
      {
        title: "Interesse richtig einordnen",
        observable: "Unterstellt keine Alleinvollmacht und erfindet keine Zustimmung der Schwester.",
      },
      {
        title: "Gemeinsamer Schritt",
        observable: "Schlägt einen Schritt vor, der die abwesende Partei nicht bindet.",
      },
      {
        title: "Kein Drängen",
        observable: "Drängt nicht zur Alleinunterschrift der Person am Apparat.",
      },
    ],
  },
  S04: {
    challenge: SCENARIO_BLURBS.S04,
    beats: [
      {
        title: "Anlass zuerst",
        why: "Sie sagen knapp, weshalb Sie den Kontakt suchen, ohne einen Objektanlass oder eine Empfehlung zu erfinden.",
      },
      {
        title: "Zeitdruck ernst nehmen",
        why: "Sie reagieren auf die knappe Zeit und lassen Raum für eine Antwort, statt Ihre Firma ausführlich vorzustellen.",
      },
      {
        title: "Reaktion gelten lassen",
        why: "Sie gehen auf die tatsächliche Antwort ein und akzeptieren ein Ende ohne zweiten Anlauf.",
      },
    ],
    qualify: [
      "Ob ein konkreter Anlass für genau diese Verwaltung genannt wurde.",
      "Ob nach dem Abwimmeln Schluss war.",
    ],
    prep: [
      "Unangemeldeter Anruf in einer Hausverwaltung, Hernals.",
      "Die Person am Apparat ist unbekannt.",
      "Kein Termin, kein Empfehlungsname und kein bekanntes Objekt im Bestand.",
    ],
    evalBeats: [
      {
        title: "Anlass zuerst",
        observable: "Nennt einen konkreten Grund für genau diesen Anruf, bevor eine Firmenshow kommt.",
      },
      {
        title: "Zeitdruck ernst nehmen",
        observable: "Hält keinen Leistungsmonolog ohne Anlass.",
      },
      {
        title: "Reaktion gelten lassen",
        observable: "Macht nach dem Abwimmeln nicht mit einem zweiten Pitch weiter.",
      },
    ],
  },
  S05: {
    challenge: SCENARIO_BLURBS.S05,
    beats: [
      {
        title: "Mehrheit klären",
        why: "Sie klären, woran die für diesen Fall erforderliche Mehrheit bisher gescheitert ist.",
      },
      {
        title: "Befugnis nicht unterstellen",
        why: "Sie unterscheiden den persönlichen Wunsch Ihres Gesprächspartners von einer gemeinsamen Entscheidung.",
      },
      {
        title: "Klärung ermöglichen",
        why: "Sie besprechen einen nächsten Schritt, der die offenen Punkte klärt und die anderen Eigentümer einbezieht.",
      },
    ],
    qualify: [
      "Ob eine Mehrheit oder Vollmacht der anderen Eigentümer vorliegt.",
      "Was die letzte Versammlung beschlossen oder abgelehnt hat.",
      "Welcher Schritt die Gemeinschaft nicht vorwegnimmt.",
    ],
    prep: [
      "Wohnungseigentum in der Josefstadt, nicht bloß zwei Geschwister.",
      "Fallvorgabe: Für die Maßnahme am Gemeinschaftseigentum fehlt die erforderliche Mehrheit.",
      "In der letzten Versammlung ist sie nicht zustande gekommen.",
    ],
    evalBeats: [
      {
        title: "Mehrheit klären",
        observable: "Fragt, wer außer der Person am Apparat zustimmen muss, bevor ein Auftrag entsteht.",
      },
      {
        title: "Befugnis nicht unterstellen",
        observable: "Unterstellt keine Mehrheit und erfindet keinen Versammlungsbeschluss.",
      },
      {
        title: "Klärung ermöglichen",
        observable: "Schlägt einen Schritt vor, der die anderen Eigentümer nicht bindet.",
      },
    ],
  },
  S06: {
    challenge: SCENARIO_BLURBS.S06,
    beats: [
      {
        title: "Anliegen verstehen",
        why: "Sie greifen die Frage zu den Mietzahlungen auf und klären, welche Hilfe die Eigentümerin jetzt benötigt.",
      },
      {
        title: "Unsicherheit klar benennen",
        why: "Sie erklären verständlich, was ohne Unterlagen und fachliche Prüfung noch nicht beantwortet werden kann.",
      },
      {
        title: "Prüfung konkret machen",
        why: "Sie helfen mit einem konkreten nächsten Prüfschritt weiter, ohne eine sichere Kündigung zu versprechen.",
      },
    ],
    qualify: [
      "Ob die Mietfrage aufgenommen wurde, ohne sie in einen Hausverkauf zu drehen.",
      "Ob eine Rechtsfolge als sicher behauptet wurde.",
      "Ob ein fachlicher nächster Schritt ohne Anwaltsrolle genannt wurde.",
    ],
    prep: [
      "Die Eigentümerin hat sich mit einer Mietfrage gemeldet.",
      "Kein Mietvertrag und keine geprüfte Rechtslage liegen vor.",
      "Sie sind Makler, nicht Anwalt.",
    ],
    evalBeats: [
      {
        title: "Anliegen verstehen",
        observable: "Nimmt die mietrechtliche Frage auf, bevor ein Rat oder ein Verkauf kommt.",
      },
      {
        title: "Unsicherheit klar benennen",
        observable: "Behauptet keine sichere Kündigung oder Wirksamkeit nach Mietrecht.",
      },
      {
        title: "Prüfung konkret machen",
        observable: "Nennt einen Prüf- oder Anwaltsweg, ohne selbst Recht zu sprechen.",
      },
    ],
  },
  S07: {
    challenge: SCENARIO_BLURBS.S07,
    beats: [
      {
        title: "Sorge benennen",
        why: "Sie greifen die konkrete Sorge um die Bindung auf, bevor Sie über eine Unterschrift sprechen.",
      },
      {
        title: "Bedingungen ehrlich klären",
        why: "Sie klären die offene Frage anhand tatsächlicher Bedingungen und erfinden keine Frist oder Ausstiegsklausel.",
      },
      {
        title: "Passend weitergehen",
        why: "Sie vereinbaren einen nächsten Schritt, der zum Klärungsstand passt und der Eigentümerin eine Entscheidung ermöglicht.",
      },
    ],
    qualify: [
      "Welche letzte Sorge vor der Vollmacht genannt wurde.",
      "Ob darauf eine Antwort kam, bevor die Unterschrift verlangt wurde.",
      "Ob genau ein nächster Schritt vereinbart wurde.",
    ],
    prep: [
      "Bestandskontakt, Landstraße. Honorar und Ablauf waren schon Thema.",
      "Eine unterschriebene Vollmacht liegt noch nicht vor.",
      "Die offene Frage betrifft die Bindung, falls kein Käufer kommt.",
    ],
    evalBeats: [
      {
        title: "Sorge benennen",
        observable: "Nimmt die genannte Sorge vor der Vollmacht auf, bevor ein Abschlussdruck kommt.",
      },
      {
        title: "Bedingungen ehrlich klären",
        observable: "Nimmt die Bindungsfrage ernst und behauptet keine im Fall unbelegte Vertragsfrist oder Ausstiegsmöglichkeit.",
      },
      {
        title: "Passend weitergehen",
        observable: "Vereinbart genau einen passenden nächsten Schritt, ohne ein neues Verkaufsgespräch zu öffnen.",
      },
    ],
  },
  S08: {
    challenge: SCENARIO_BLURBS.S08,
    beats: [
      {
        title: "Empfehlung annehmen",
        why: "Sie würdigen die Weiterempfehlung und greifen genau diesen Anlass des Gesprächs auf.",
      },
      {
        title: "Beim Anlass bleiben",
        why: "Sie lassen den abgeschlossenen Verkauf abgeschlossen und machen der Kundin kein neues Verkaufsangebot.",
      },
      {
        title: "Kontaktweg abstimmen",
        why: "Sie klären, ob eine Vorstellung oder die Weitergabe Ihrer Kontaktdaten gewünscht ist, statt Kontaktaufnahme vorauszusetzen.",
      },
    ],
    qualify: [
      "Ob die Empfehlung angenommen wurde, ohne einen neuen Verkauf der Anruferin.",
      "Ob nach Erlaubnis für den Kontakt zur Nachbarin gefragt wurde.",
    ],
    prep: [
      "Bestandskundin in der Wieden, Haus bereits über Sie verkauft.",
      "Sie ruft nicht wegen eines eigenen Verkaufs an.",
      "Eine Nachbarin hat nach Ihrem Namen gefragt; weitere Daten fehlen.",
    ],
    evalBeats: [
      {
        title: "Empfehlung annehmen",
        observable: "Nimmt die Weiterempfehlung auf, ohne die Anruferin in einen neuen Verkauf zu ziehen.",
      },
      {
        title: "Beim Anlass bleiben",
        observable: "Bietet der Bestandskundin kein zweites Objekt und keinen neuen Auftrag an.",
      },
      {
        title: "Kontaktweg abstimmen",
        observable: "Klärt einen gewünschten Kontaktweg und unterstellt weder Kontaktdaten noch Erlaubnis zur direkten Kontaktaufnahme.",
      },
    ],
  },
};

export function isFrozenScenarioId(id: string): id is FrozenScenarioId {
  return (FROZEN_SCENARIO_IDS as readonly string[]).includes(id);
}

export function sceneIntel(id: string): SceneIntel | null {
  if (!isFrozenScenarioId(id)) return null;
  const row = PACK[id];
  return {
    id,
    goal: drillHonesty(id).practiceFocus,
    challenge: row.challenge,
    beats: row.beats,
    qualify: row.qualify,
    prep: row.prep,
    evalBeats: row.evalBeats,
  };
}

export function sceneIntelPublic(id: string): SceneIntelPublic | null {
  const intel = sceneIntel(id);
  if (!intel) return null;
  return {
    id: intel.id,
    challenge: intel.challenge,
    goal: intel.goal,
    beatTitles: intel.beats.map((beat) => beat.title),
    beats: intel.beats.map((beat) => ({ title: beat.title, why: beat.why })),
    qualify: intel.qualify,
    prep: intel.prep,
  };
}

export function sceneIntelForCoach(id: string): SceneIntel | null {
  return sceneIntel(id);
}

export function formatCoachIntel(intel: SceneIntel): string {
  const beats = intel.beats
    .map((beat) => `- ${beat.title}${beat.why ? `: ${beat.why}` : ""}`)
    .join("\n");
  const qualify = intel.qualify.map((line) => `- ${line}`).join("\n");
  const evals = intel.evalBeats.map((beat) => `- ${beat.title}: ${beat.observable}`).join("\n");
  return [
    TRAININGSZIELE_MARKER,
    `Ziel: ${intel.goal}`,
    `Beats:\n${beats}`,
    `Das klären Sie:\n${qualify}`,
    `Hinweise (keine Note, derselbe Fokus):\n${evals}`,
  ].join("\n");
}

export function coachIntelBlock(scenarioId: string): string {
  const intel = sceneIntelForCoach(scenarioId);
  return intel ? formatCoachIntel(intel) : "";
}
