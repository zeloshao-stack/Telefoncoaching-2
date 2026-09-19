import { COACH_PROMPTS, type CoachPrompt } from "@/lib/coach-canon";
import type { SalesProperty } from "@/lib/sales-properties";

export type { CoachPrompt };

export const VERTICAL_IDS = ["immobilien", "versicherung", "hausverwaltung", "finanzierung"] as const;
export type VerticalId = (typeof VERTICAL_IDS)[number];
export const DEFAULT_VERTICAL: VerticalId = "immobilien";

export type Vertical = {
  id: VerticalId;
  label: string;
  shortLabel: string;
  audience: string;
  locale: string;
  status: "live" | "ready";
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  emptyLead: string;
  coachTitle: string;
  coachLead: string;
  coachIdentity: string;
  coachPlaceholder: string;
  coachEmptyHint: string;
  counterpartRole: string;
  traineeRole: string;
  frozenScenarioIds: string[];
  salesProperties: SalesProperty[];
  coachPrompts: CoachPrompt[];
};

const GENERIC_NEXT: SalesProperty = {
  id: "P-schritt",
  domain: "naechster",
  label: "Ein nächster Schritt",
  coachUse: "Nach geklärter Lage genau eine Vereinbarung: wer, was, bis wann — oder respektvolles Ende.",
  contraindication: "Kein Abschlussdruck bei Unentschlossenheit oder fehlender Vollmacht.",
};

const GENERIC_NO: SalesProperty = {
  id: "P-absage",
  domain: "einwand",
  label: "Berechtigtes Nein",
  coachUse: "Eine klare Absage respektieren und beenden. Hartnäckigkeit ist kein Erfolg.",
  contraindication: "Eine Absage nicht in einen verdeckten Abschluss umdeuten.",
};

const GENERIC_AUTHORITY: SalesProperty = {
  id: "P-vollmacht",
  domain: "entscheidung",
  label: "Wer zustimmen muss",
  coachUse: "Interesse einer Person ist keine Vollmacht. Vor dem Auftrag klären, wer mitentscheidet.",
  contraindication: "Kein Stakeholder-Verhör im ersten Satz, wenn die Lage noch unklar ist.",
};

const GENERIC_PERMISSION: SalesProperty = {
  id: "P-erlaubnis",
  domain: "einstieg",
  label: "Erlaubnis und Anlass",
  coachUse: "Zuerst Identität, Anlass und Wahlfreiheit. Lage klären, bevor Leistung oder Produkt kommt.",
  contraindication: "Kein Werbeanruf ohne zulässigen Kontaktweg. Kein Firmenmonolog.",
};

const GENERIC_FOLLOW: SalesProperty = {
  id: "P-folge",
  domain: "folge",
  label: "Nachfassen und reaktivieren",
  coachUse: "An einen konkreten Punkt anknüpfen, echten Anlass nennen, Ausstieg lassen. Verlorene Kontakte nur mit Erlaubnis wieder öffnen.",
  contraindication: "Kein „nur mal nachfragen“, keine erfundenen Dringlichkeit, nicht nachkarten.",
};

export const VERTICALS: Record<VerticalId, Vertical> = {
  immobilien: {
    id: "immobilien",
    label: "Immobilien",
    shortLabel: "Makler · Bauträger",
    audience: "KMU-Maklerbüros",
    locale: "de-AT",
    status: "live",
    heroKicker: "Telefoncoaching · Zinshaus",
    heroTitle: "Ein Anruf. Eine Sache. Dann dieselbe Stelle nochmal.",
    heroLead:
      "Live im Browser: Sie sprechen, die Gegenseite antwortet, legt bei Kaltakquise wirklich auf. Nach dem Auflegen: ein Coach-Satz, den Sie sofort üben.",
    emptyLead: "Noch kein Fall in dieser Branche.",
    coachTitle: "Vertriebscoach",
    coachLead:
      "Immobilienmakler und Bauträger. Dieselben Gesprächslagen wie überall — Erstkontakt, Einwand, Nachfassen, Reaktivieren — in der Sprache dieser Branche.",
    coachIdentity: "Fragen-Coach für Immobilienmakler und Bauträger in Österreich (de-AT, Sie).",
    coachPlaceholder: "Ihre Frage — z. B. Einwand, Nachfassen, Reservierung …",
    coachEmptyHint: "Eine Frage stellen oder eine gängige Gesprächslage wählen.",
    counterpartRole: "Eigentümerin oder Eigentümer",
    traineeRole: "Makler",
    frozenScenarioIds: ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08"],
    salesProperties: [
      GENERIC_PERMISSION,
      {
        id: "P-lage",
        domain: "objekt",
        label: "Öffentliche Objektlage",
        coachUse:
          "Nur was im Briefing steht: Adresse, Nutzung, sichtbare Verfassung. Daraus Fragen ableiten, keine Motive erfinden.",
        contraindication: "Keine verdeckten Verkaufsmotive als Wissen des Maklers.",
      },
      {
        id: "P-vergleich",
        domain: "kommerziell",
        label: "Honorar vs. Leistungsumfang",
        coachUse: "Vor jeder Preisbewegung den Vergleich klären: welche Leistungen, welche Bedingungen.",
        contraindication: "Keine Konzession, nur weil die Gegenseite eine Zahl nennt.",
      },
      GENERIC_AUTHORITY,
      GENERIC_NO,
      {
        id: "P-beleg",
        domain: "objekt",
        label: "Belegte Nachfrage",
        coachUse: "Wert nur mit wahren Belegen. Keine erfundenen Käufer, keine erfundenen Mehrerlöse.",
        contraindication: "Keine Marktzahlen erfinden, um Druck zu erzeugen.",
      },
      GENERIC_FOLLOW,
      GENERIC_NEXT,
    ],
    coachPrompts: COACH_PROMPTS.immobilien,
  },
  versicherung: {
    id: "versicherung",
    label: "Versicherung",
    shortLabel: "Vorsorge · Bestand",
    audience: "KMU-Maklerbüros",
    locale: "de-AT",
    status: "live",
    heroKicker: "Maklerbüro · Versicherung",
    heroTitle: "Dieselbe Übung, anderer Beratungsgegenstand.",
    heroLead:
      "Zwei Fälle zum Üben: Prämie rauf und Partner nicht am Apparat. Dann Kfz nach dem Schaden. Bedarf vor Produkt.",
    emptyLead: "Noch keine fertigen Fälle. Legen Sie ein Szenario an — die Schleife ist dieselbe.",
    coachTitle: "Vertriebscoach",
    coachLead:
      "Versicherung. Bedarf vor Produkt. Dieselben Lagen — Erstgespräch, Einwand, Abschlussreife, Reaktivieren — ohne erfundene Deckungen.",
    coachIdentity: "Fragen-Coach für Versicherungsmakler in Österreich (de-AT, Sie).",
    coachPlaceholder: "Ihre Frage — z. B. Haushaltsversicherung, Einwand, Nachfassen …",
    coachEmptyHint: "Eine Frage stellen oder eine gängige Gesprächslage wählen.",
    counterpartRole: "Kundin oder Kunde",
    traineeRole: "Makler",
    frozenScenarioIds: [],
    salesProperties: [
      GENERIC_PERMISSION,
      {
        id: "P-bedarf",
        domain: "objekt",
        label: "Bedarf vor Produkt",
        coachUse: "Zuerst die Lage und den Absicherungsbedarf klären, dann erst ein Produkt nennen.",
        contraindication: "Kein Produktpitch, bevor die Lage klar ist.",
      },
      {
        id: "P-vergleich",
        domain: "kommerziell",
        label: "Prämie vs. Leistung",
        coachUse: "Vor einem Preiszugeständnis klären, welche Leistungen verglichen werden.",
        contraindication: "Keine Rabatte als Ersatz für ungeklärten Bedarf.",
      },
      GENERIC_AUTHORITY,
      GENERIC_NO,
      {
        id: "P-beleg",
        domain: "objekt",
        label: "Nur belegte Leistungen",
        coachUse: "Nur Leistungen nennen, die im Briefing oder im Transkript stehen.",
        contraindication: "Keine erfundenen Deckungen oder Schadenquoten.",
      },
      GENERIC_FOLLOW,
      GENERIC_NEXT,
    ],
    coachPrompts: COACH_PROMPTS.versicherung,
  },
  hausverwaltung: {
    id: "hausverwaltung",
    label: "Hausverwaltung",
    shortLabel: "Service · Konflikt",
    audience: "Hausverwaltungen",
    locale: "de-AT",
    status: "live",
    heroKicker: "Verwaltung · Service",
    heroTitle: "Sachverhalt, Frist und nächster Schritt — kein Abschlussdruck.",
    heroLead:
      "Eigene Welt: Schaden, Betriebskosten, Beirat. Verstehen, zuordnen, dokumentieren. Übungsszenen folgen; der Coach ist schon da.",
    emptyLead: "Noch keine fertigen Übungsfälle. Der Vertriebscoach beantwortet die gängigen Lagen bereits.",
    coachTitle: "Vertriebscoach",
    coachLead:
      "Hausverwaltung. Verstehen, Verantwortung, Frist, Dokumentation. Kein Verkaufsdruck, keine ungesicherte Rechts- oder Technikzusage.",
    coachIdentity: "Fragen-Coach für Hausverwaltungen in Österreich (de-AT, Sie).",
    coachPlaceholder: "Ihre Frage — z. B. Schaden, Betriebskosten, Beirat …",
    coachEmptyHint: "Eine Frage stellen oder eine gängige Gesprächslage wählen.",
    counterpartRole: "Mieterin, Eigentümer oder Beirat",
    traineeRole: "Verwalter",
    frozenScenarioIds: [],
    salesProperties: [
      {
        id: "P-sachverhalt",
        domain: "service",
        label: "Sachverhalt vor Zusage",
        coachUse: "Zuerst konkret: was ist wann passiert. Dann Zuständigkeit und dokumentierter nächster Schritt.",
        contraindication: "Keine technische oder rechtliche Sofortzusage ohne Prüfung.",
      },
      {
        id: "P-frist",
        domain: "service",
        label: "Frist und Rückmeldung",
        coachUse: "Einen Zeitpunkt nennen, bis wann Rückmeldung kommt. Offenes nicht zusagen.",
        contraindication: "Keine Frist erfinden, die intern nicht haltbar ist.",
      },
      GENERIC_AUTHORITY,
      GENERIC_NO,
      {
        id: "P-beleg",
        domain: "objekt",
        label: "Nur geprüfte Aussagen",
        coachUse: "Nur sagen, was belegt oder zur Prüfung übernommen ist.",
        contraindication: "Keine Schuldzuweisung, keine Rechtsauskunft als Tatsache.",
      },
      GENERIC_FOLLOW,
      GENERIC_NEXT,
    ],
    coachPrompts: COACH_PROMPTS.hausverwaltung,
  },
  finanzierung: {
    id: "finanzierung",
    label: "Finanzierung",
    shortLabel: "Kredit · Tragbarkeit",
    audience: "KMU-Maklerbüros",
    locale: "de-AT",
    status: "live",
    heroKicker: "Maklerbüro · Finanzierung",
    heroTitle: "Tragbarkeit klären, bevor die Rate verkauft wird.",
    heroLead:
      "Zwei Fälle: Wohnkredit ohne zweite Unterschrift. Umschuldung, Sondertilgung unklar. Tragbarkeit vor der Zahl.",
    emptyLead: "Noch keine fertigen Fälle. Szenario schreiben startet dasselbe Training.",
    coachTitle: "Vertriebscoach",
    coachLead: "Finanzierung. Tragbarkeit und Vollmacht vor der Rate. Nachfassen und Reaktivieren ohne Werberate.",
    coachIdentity: "Fragen-Coach für Finanzierungsmakler in Österreich (de-AT, Sie).",
    coachPlaceholder: "Ihre Frage — z. B. Tragbarkeit, Unterschrift, Nachfassen …",
    coachEmptyHint: "Eine Frage stellen oder eine gängige Gesprächslage wählen.",
    counterpartRole: "Kreditnehmerin oder Kreditnehmer",
    traineeRole: "Berater",
    frozenScenarioIds: [],
    salesProperties: [
      GENERIC_PERMISSION,
      {
        id: "P-tragbarkeit",
        domain: "objekt",
        label: "Tragbarkeit",
        coachUse: "Zuerst Einkommen, Lasten und Zweck klären. Die Rate folgt der Lage, nicht umgekehrt.",
        contraindication: "Keine Raten nennen, die nicht im Briefing stehen.",
      },
      GENERIC_AUTHORITY,
      GENERIC_NO,
      {
        id: "P-beleg",
        domain: "objekt",
        label: "Nur belegte Zahlen",
        coachUse: "Nur Zahlen verwenden, die gesagt oder im Briefing stehen.",
        contraindication: "Keine erfundenen Bankzusagen oder Bewertungen.",
      },
      GENERIC_FOLLOW,
      GENERIC_NEXT,
    ],
    coachPrompts: COACH_PROMPTS.finanzierung,
  },
};

export function isVerticalId(value: string | null | undefined): value is VerticalId {
  return !!value && (VERTICAL_IDS as readonly string[]).includes(value);
}

export function getVertical(id: string | null | undefined): Vertical {
  if (isVerticalId(id)) return VERTICALS[id];
  return VERTICALS[DEFAULT_VERTICAL];
}

export function listVerticals(): Vertical[] {
  return VERTICAL_IDS.map((id) => VERTICALS[id]);
}
