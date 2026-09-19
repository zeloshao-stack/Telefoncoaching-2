import type { CallGuide } from "@/lib/authored-types";

export const CHIP_GROUP_ORDER = [
  { id: "einstieg", label: "Einstieg" },
  { id: "anlass", label: "Anlass" },
  { id: "einwand", label: "Einwand" },
  { id: "naechster", label: "Nächster Schritt" },
] as const;

export type ChipGroupId = (typeof CHIP_GROUP_ORDER)[number]["id"];

export const HINT_CHIPS = [
  {
    id: "nachbar",
    group: "einstieg",
    label: "Nachbar-Tipp",
    text: "Nachbarn haben den Tipp gegeben, dass verkauft werden soll.",
  },
  {
    id: "kollege",
    group: "einstieg",
    label: "Empfehlung Kollege",
    text: "Ein Kollege hat mich empfohlen.",
  },
  {
    id: "empfehlung",
    group: "einstieg",
    label: "Empfehlung (allgemein)",
    text: "Ich komme über eine Empfehlung.",
  },
  {
    id: "vorbei",
    group: "einstieg",
    label: "Einfach mal vorbeigefahren",
    text: "Ich bin einfach mal vorbeigefahren.",
  },
  {
    id: "inserat",
    group: "einstieg",
    label: "Inserat gesehen",
    text: "Ich habe ein Inserat zum Objekt gesehen.",
  },
  {
    id: "hausverwaltung",
    group: "einstieg",
    label: "Hausverwaltung kennt uns",
    text: "Die Hausverwaltung kennt uns und hat den Kontakt ermöglicht.",
  },
  {
    id: "kaltkontakt",
    group: "einstieg",
    label: "Kaltkontakt Zinshaus",
    text: "Kaltkontakt zu einem Wiener Zinshaus, ohne vorherigen Termin.",
  },
  {
    id: "grundbuch",
    group: "einstieg",
    label: "Grundbuch",
    text: "Den Eigentümer habe ich über das Grundbuch gefunden.",
  },
  {
    id: "nachbarhaus",
    group: "einstieg",
    label: "Nachbarhaus verkauft",
    text: "Im Nachbarhaus wurde verkauft, deshalb rufe ich an.",
  },
  { id: "erbschaft", group: "anlass", label: "Erbschaft", text: "Es gibt eine Erbschaft." },
  {
    id: "miteigentum",
    group: "anlass",
    label: "Miteigentum / Erben",
    text: "Es geht um Miteigentum oder mehrere Erben.",
  },
  {
    id: "sanierung",
    group: "anlass",
    label: "Sanierung / Fassade / Stiegenhaus",
    text: "Fassade, Stiegenhaus oder eine Sanierung stehen an.",
  },
  {
    id: "bank",
    group: "anlass",
    label: "Bank / Finanzierung im Spiel",
    text: "Eine Bank oder Finanzierung spielt mit.",
  },
  {
    id: "bewertung",
    group: "anlass",
    label: "Bewertung nachfassen",
    text: "Ich möchte eine frühere Bewertung nachfassen.",
  },
  {
    id: "leerstand",
    group: "anlass",
    label: "Leerstand / Mieterwechsel",
    text: "Es gibt Leerstand oder einen Mieterwechsel.",
  },
  {
    id: "parifizierung",
    group: "anlass",
    label: "Parifizierung / Teilung",
    text: "Es geht um Teilung oder Parifizierung.",
  },
  {
    id: "versammlung",
    group: "anlass",
    label: "Eigentümerversammlung",
    text: "Nach der Eigentümerversammlung ist das Thema wieder offen.",
  },
  {
    id: "abgelehnt",
    group: "einwand",
    label: "Schon einmal abgelehnt",
    text: "Der Eigentümer hat bereits einmal abgelehnt. Ich möchte trotzdem noch einmal ins Gespräch kommen.",
  },
  {
    id: "honorar",
    group: "einwand",
    label: "Honorarvergleich",
    text: "Es geht um einen Honorarvergleich mit einem anderen Makler.",
  },
  {
    id: "alleinauftrag",
    group: "einwand",
    label: "Alleinauftrag / Bindung",
    text: "Es geht um Alleinauftrag oder Bindung.",
  },
  {
    id: "keinverkauf",
    group: "einwand",
    label: "Kein Verkauf gesagt",
    text: "Es wurde gesagt, dass nicht verkauft wird.",
  },
  {
    id: "privat",
    group: "einwand",
    label: "Privat verkaufen",
    text: "Die Eigentümerseite will privat verkaufen.",
  },
  {
    id: "provision",
    group: "einwand",
    label: "Provision zu hoch",
    text: "Die Provision wird als zu hoch empfunden.",
  },
  {
    id: "schonmakler",
    group: "einwand",
    label: "Schon einen Makler",
    text: "Es ist bereits ein Makler im Spiel.",
  },
  {
    id: "familie",
    group: "einwand",
    label: "Muss mit Familie reden",
    text: "Es muss noch mit der Familie gesprochen werden.",
  },
  {
    id: "diskretion",
    group: "einwand",
    label: "Diskretion / kein Inserat",
    text: "Diskretion ist wichtig, kein öffentliches Inserat.",
  },
  {
    id: "schicken",
    group: "naechster",
    label: "Schicken Sie etwas",
    text: "Die Bitte war: Schicken Sie etwas.",
  },
  {
    id: "reinkommen",
    group: "naechster",
    label: "Wieder reinkommen nach Absage",
    text: "Ich möchte nach einer Absage wieder reinkommen.",
  },
  {
    id: "termin",
    group: "naechster",
    label: "Termin vor Ort wollen",
    text: "Die Gegenseite will einen Termin vor Ort.",
  },
  {
    id: "rueckruf",
    group: "naechster",
    label: "Rückruf",
    text: "Ein Rückruf wurde angeboten oder gewünscht.",
  },
  {
    id: "unterlagen",
    group: "naechster",
    label: "Unterlagen folgen",
    text: "Unterlagen oder ein kurzes Schreiben sollen folgen.",
  },
] as const;

export type HintChip = (typeof HINT_CHIPS)[number];

export const HINT_CHIP_GROUPS = CHIP_GROUP_ORDER.map((group) => ({
  ...group,
  chips: HINT_CHIPS.filter((chip) => chip.group === group.id),
}));

export type ScenarioSeed = {
  situation: string;
  counterpart: string;
  objekt: string;
  happened: string;
  rollHidden?: boolean;
  variant?: number;
  verticalId?: string;
};

export type SituationKind = "reentry" | "shared" | "honor" | "rumor" | "generic";

export type HiddenHinge = {
  id: "reentry" | "rumor" | "cautious-yes" | "clear-no" | "shared" | "honor";
  kind: SituationKind;
  titleHint: string;
  sellWill: string;
  wellbeing: string;
  priorTalk: string;
  constitution: string;
  disclosure: string;
  outcome: string;
  guide: CallGuide;
};

function compact(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeSeed(input: Partial<ScenarioSeed>): ScenarioSeed {
  return {
    situation: compact(input.situation ?? ""),
    counterpart: compact(input.counterpart ?? ""),
    objekt: compact(input.objekt ?? ""),
    happened: compact(input.happened ?? ""),
    rollHidden: Boolean(input.rollHidden),
    variant: input.variant,
    verticalId: input.verticalId || "immobilien",
  };
}

export function seedHasContent(seed: ScenarioSeed) {
  return seed.situation.length >= 12;
}

export function appendChip(situation: string, chipText: string) {
  const current = situation.trim();
  if (!chipText.trim()) return current;
  if (current.toLowerCase().includes(chipText.trim().toLowerCase())) return current;
  return current ? `${current.replace(/[.!?]*$/, "")}. ${chipText.trim()}` : chipText.trim();
}

export function chipIsSelected(situation: string, chipText: string) {
  const needle = chipText.trim().toLowerCase();
  return Boolean(needle) && situation.toLowerCase().includes(needle);
}

export function removeChip(situation: string, chipText: string) {
  const needle = chipText.trim();
  if (!needle) return situation.trim();
  const idx = situation.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return situation.trim();
  const next = `${situation.slice(0, idx)}${situation.slice(idx + needle.length)}`
    .replace(/\s+/g, " ")
    .replace(/\s+([.!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/^[.!?]\s*/, "")
    .trim();
  return next;
}

export function toggleChip(situation: string, chipText: string) {
  return chipIsSelected(situation, chipText) ? removeChip(situation, chipText) : appendChip(situation, chipText);
}

export function appendSpoken(current: string, spoken: string) {
  const text = spoken.replace(/\s+/g, " ").trim();
  if (!text) return current.trim();
  const base = current.trim();
  if (!base) return text;
  return /[.!?]$/.test(base) ? `${base} ${text}` : `${base}. ${text}`;
}

export function publicFacts(seed: ScenarioSeed) {
  return [seed.situation, seed.counterpart, seed.objekt, seed.happened].filter(Boolean);
}

export function composePublicBrief(seed: ScenarioSeed) {
  const parts = publicFacts(seed);
  if (parts.length === 0) return "Nur das dürfen Sie vor dem Gespräch wissen.";
  const lead = parts.join(" ").replace(/\s+/g, " ").trim();
  const body = /[.!?]$/.test(lead) ? lead : `${lead}.`;
  return `${body} Nur das dürfen Sie vor dem Gespräch wissen.`;
}

export function classifySituation(seed: ScenarioSeed): SituationKind {
  const blob = publicFacts(seed).join(" ").toLowerCase();
  if (/abgelehnt|absage|nein gesagt|nochmal|reinkommen|fuß in|fuss in|wieder anruf|zurückholen|zurueckholen/.test(blob)) {
    return "reentry";
  }
  if (/erbschaft|miteigent|geschwister|erben/.test(blob)) return "shared";
  if (/honorar|provision|vergleich/.test(blob)) return "honor";
  if (/nachbar|tipp gegeben|gerücht|geruecht/.test(blob)) return "rumor";
  return "generic";
}

export function inferFemale(seed: ScenarioSeed) {
  const p = publicFacts(seed).join(" ").toLowerCase();
  if (/eigentümerin|dame|frau|witwe|tochter/.test(p)) return true;
  if (/eigentümer|herr|mann|sohn|witwer/.test(p)) return false;
  return true;
}

const WOMEN = ["Helene Sommer", "Maria Leitner", "Elisabeth Huber", "Anna Berger"];
const MEN = ["Franz Berger", "Andreas Huber", "Otto Sommer", "Karl Leitner"];

export function inferName(seed: ScenarioSeed, salt = 0) {
  const blob = publicFacts(seed).join(" ");
  const named = blob.match(/[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+/);
  if (named && !/Zinshaus|Wallner|Wien/.test(named[0])) return named[0];
  if (seed.counterpart) {
    const fromField = seed.counterpart.match(/[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)+/);
    if (fromField) return fromField[0];
  }
  const list = inferFemale(seed) ? WOMEN : MEN;
  return list[Math.abs(hashSeed(seed) + salt) % list.length] ?? list[0]!;
}

export function inferProfession(seed: ScenarioSeed) {
  const blob = publicFacts(seed).join(" ").toLowerCase();
  const female = inferFemale(seed);
  if (/zinshaus/.test(blob)) return female ? "Zinshaus-Eigentümerin" : "Zinshaus-Eigentümer";
  if (/wohnung/.test(blob)) return female ? "Wohnungseigentümerin" : "Wohnungseigentümer";
  return female ? "Eigentümerin" : "Eigentümer";
}

export function hashSeed(seed: Pick<ScenarioSeed, "situation" | "counterpart" | "objekt" | "happened">) {
  const text = `${seed.situation}|${seed.counterpart}|${seed.objekt}|${seed.happened}`;
  let n = 0;
  for (let i = 0; i < text.length; i += 1) n = (n * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(n);
}

export function titleFromSeed(seed: ScenarioSeed, hint: string) {
  const street = `${seed.objekt} ${seed.situation}`.match(/([A-ZÄÖÜ][a-zäöüß]+(?:straße|gasse|platz|weg))/);
  if (street?.[1]) return `${street[1]} · ${hint}`;
  if (seed.objekt) return `${seed.objekt.split(",")[0]?.trim()} · ${hint}`;
  return hint;
}

const REENTRY_GUIDE: CallGuide = {
  occasion:
    "Nachfassen nach einer Absage. Ziel: Erlaubnis für ein kurzes, neues Anliegen — nicht der Auftrag.",
  presumed:
    "Die Absage kann ernst sein, ein Vorwand, oder es fehlte damals ein Anlass. Das unterstellen Sie nicht; Sie klären es.",
  lines: [
    "Wir haben schon gesprochen, und Sie haben abgelehnt. Das respektiere ich.",
    "Ich rufe nicht mit demselben Anliegen an. Darf ich in einem Satz sagen, warum ich mich noch einmal melde?",
    "Wenn das Nein weiterhin gilt, lasse ich Sie in Ruhe. Gilt es noch?",
    "Was müsste sich geändert haben, damit ein kurzes Gespräch für Sie überhaupt Sinn hätte?",
    "Mir geht es nicht um einen Auftrag heute, sondern um die Frage, ob die Tür einen Spalt offen bleibt.",
    "Falls jetzt der falsche Zeitpunkt ist: Wann wäre ein besserer — oder soll ich das Thema schließen?",
  ],
  avoid: [
    "Das erste Nein übergehen oder umdeuten.",
    "Denselben Pitch wie beim ersten Anruf.",
    "Druck, künstliche Verknappung, erfundene Käufer oder Preise.",
  ],
  questions: [
    "War die Absage endgültig, oder hing sie an einem konkreten Punkt?",
    "Hat sich an der Lage etwas geändert — Objekt, Familie, Zeit?",
    "Wer außer Ihnen müsste einem nächsten Schritt zustimmen?",
  ],
};

const HINGES: HiddenHinge[] = [
  {
    id: "reentry",
    kind: "reentry",
    titleHint: "Noch einmal anrufen",
    sellWill:
      "Hat einmal klar abgelehnt und will nicht verkaufen. Hört sich ein neues, knappes Anliegen an, wenn das erste Nein ernst genommen wird. Sonst legt er auf. Ein Auftrag ist nicht das Ziel.",
    wellbeing: "Knapp in der Zeit, nicht unhöflich, aber allergisch gegen denselben Verkaufston.",
    priorTalk: "Es gab schon ein Gespräch. Damals ein klares Nein. Kein Auftrag, keine Bewertung, keine Zahl.",
    constitution: "Keine relevante gesundheitliche Einschränkung in diesem Fall.",
    disclosure:
      "Dass das Nein ernst gemeint war, darf fallen, wenn danach gefragt wird. Keinen plötzlichen Verkaufswillen erfinden.",
    outcome:
      "Das frühere Nein anerkennen. Nur bei neuem Anlass einen kleinen nächsten Schritt. Kein Auftrag erzwingen.",
    guide: REENTRY_GUIDE,
  },
  {
    id: "clear-no",
    kind: "reentry",
    titleHint: "Absage bleibt",
    sellWill:
      "Will nicht verkaufen. Die frühere Absage gilt. Ein klares Nein ist das erlaubte Ende — kein umgedeuteter Auftrag.",
    wellbeing: "Bestimmt, höflich, wenig Geduld für Wiederholungen.",
    priorTalk: "Bereits abgelehnt. Mit niemandem sonst über einen Verkauf gesprochen.",
    constitution: "Keine relevante gesundheitliche Einschränkung in diesem Fall.",
    disclosure: "Das Nein klar sagen, wenn der Anruf denselben Auftrag sucht. Keine Tirade von selbst.",
    outcome: "Ein klares Nein respektieren und auflegen. Hartnäckigkeit ist kein Erfolg.",
    guide: REENTRY_GUIDE,
  },
  {
    id: "cautious-yes",
    kind: "reentry",
    titleHint: "Lage hat sich verschoben",
    sellWill:
      "Damals Nein. Inzwischen prüft er, weil Aufwand oder Familie drücken. Es ist eine Richtung, kein Auftrag. Zahlen und Käufer kennt er nicht.",
    wellbeing: "Sachlich, etwas müde, nicht in Not. Will Klarheit, keinen Druck.",
    priorTalk: "Früherer Anruf endete mit Absage. Seither kein Makler, keine Bewertung.",
    constitution: "Der Alltag im Haus fällt schwerer. Das bleibt privat, bis jemand behutsam nachfragt.",
    disclosure: "Den Prüfungswillen nur bei konkreter Frage, warum sich etwas geändert haben könnte. Keine Preise.",
    outcome: "Was sich geändert hat klären. Kein Auftrag, solange nur geprüft wird. Keine erfundenen Käufer.",
    guide: REENTRY_GUIDE,
  },
  {
    id: "shared",
    kind: "shared",
    titleHint: "Wer entscheidet",
    sellWill:
      "Allein darf die Person nicht entscheiden. Bei Erbschaft oder Miteigentum müssen andere zustimmen. Interesse am Apparat ist keine Vollmacht.",
    wellbeing: "Sachlich, etwas vorsichtig, nicht abweisend.",
    priorTalk: "In der Familie wurde einmal darüber gesprochen, ohne Einigung. Kein Makler, kein Auftrag.",
    constitution: "Keine relevante gesundheitliche Einschränkung, außer jemand fragt nach dem Alltag im Haus.",
    disclosure:
      "Die fehlende Alleinentscheidung nur bei Frage nach Vollmacht, Geschwistern oder wer unterschreiben müsste.",
    outcome: "Wer mitentscheiden muss klären. Kein Abschluss ohne Vollmacht. Keine erfundenen Käufer.",
    guide: {
      occasion: "Klärung, wer entscheidet. Ziel: die richtige nächste Person oder ein gemeinsamer Termin — kein Alleingang.",
      presumed: "Am Apparat ist Interesse oder Ablehnung möglich, aber vielleicht keine Vollmacht.",
      lines: [
        "Darf ich fragen, ob Sie das allein entscheiden können — oder wer noch zustimmen müsste?",
        "Wenn andere mitreden: Was wäre für die die größte Frage?",
        "Dann ist ein gemeinsames Gespräch oft klarer als ein Auftrag unter uns beiden.",
      ],
      avoid: ["Auftrag mit einer Person, wenn andere mitentscheiden.", "Familienkonstellation im ersten Satz verhören."],
      questions: ["Wer außer Ihnen müsste zustimmen?", "Gab es in der Eigentümergruppe schon eine gemeinsame Haltung?"],
    },
  },
  {
    id: "honor",
    kind: "honor",
    titleHint: "Honorarvergleich",
    sellWill:
      "Vergleicht Angebote. Der Leistungsumfang der anderen Seite ist unbekannt. Kein Auftrag, solange das unklar bleibt.",
    wellbeing: "Skeptisch, höflich, will Zahlen hören, nicht belehrt werden.",
    priorTalk: "Mindestens ein anderes Gespräch. Keine Unterschrift, keine bekannte Leistungsliste.",
    constitution: "Kein relevanter Gesundheitsbezug.",
    disclosure: "Was die andere Seite wirklich umfasst, weiß sie nicht genau — nur bei konkreter Frage.",
    outcome: "Leistungsumfang klären, bevor Honorar fällt. Keine erfundenen Käufer. Kein Unterbieten ohne Diagnose.",
    guide: {
      occasion: "Vergleichsgespräch. Ziel: verstehen, womit verglichen wird — nicht der billigere Preis.",
      presumed: "Ein anderes Angebot steht im Raum. Der Umfang ist oft unklar.",
      lines: [
        "Bevor ich über das Honorar spreche: Was genau umfasst das andere Angebot?",
        "Woran würden Sie am Ende messen, ob sich eine Beauftragung gerechnet hat?",
        "Dann können wir dieselbe Leistung vergleichen — oder feststellen, dass es nicht dieselbe ist.",
      ],
      avoid: ["Sofort nachgeben.", "Leistung erfinden, die der Fall nicht hergibt."],
      questions: ["Was wurde zugesagt?", "Wer muss dem Vergleich noch zustimmen?"],
    },
  },
  {
    id: "rumor",
    kind: "rumor",
    titleHint: "Tipp prüfen",
    sellWill:
      "Unentschlossen. Der Tipp von außen ist übertrieben. Ein Verkauf ist keine beschlossene Sache — das sagt sie nur, wenn man nach dem Willen fragt.",
    wellbeing: "Höflich, knapp in der Zeit, nicht verzweifelt. Das Haus ist ihr Zuhause.",
    priorTalk: "Ein Bekannter hat einmal „mal schauen“ wollen. Kein Makler, kein Auftrag, keine Zahl.",
    constitution: "Sie geht Treppen langsamer. Das soll niemand als Verkaufsargument verwenden.",
    disclosure: "Verdeckt nur bei konkreter, passender Frage. Verfassung nicht ungefragt. Keinen Verkaufswillen erfinden.",
    outcome: "Verkaufswille klären, ohne Druck. Kein Auftrag bei Unentschlossenheit. Keine erfundenen Käufer.",
    guide: {
      occasion: "Erstkontakt nach einem Hinweis. Ziel: Haltung klären, nicht den Tipp als Tatsache verkaufen.",
      presumed: "Ein Tipp ist kein Verkaufswille. Die Person kann überrascht, unentschlossen oder abweisend sein.",
      lines: [
        "Ich rufe an, weil es um das Haus geht — nicht weil ich einen Auftrag voraussetze.",
        "Stimmt es überhaupt, dass ein Verkauf für Sie ein Thema ist — oder soll ich das ruhen lassen?",
        "Wenn ja: Was wäre für Sie der falsche nächste Schritt?",
      ],
      avoid: ["Den Nachbar-Tipp als Tatsache ausspielen.", "Erfundene Käufer."],
      questions: ["Ist ein Verkauf für Sie überhaupt ein Thema?", "Wer müsste mitentscheiden?"],
    },
  },
];

const GENERIC: HiddenHinge = {
  id: "rumor",
  kind: "generic",
  titleHint: "Lage klären",
  sellWill:
    "Haltung zum Anliegen ist unklar. Nichts ist beschlossen. Verdeckte Motive nur bei passender Frage.",
  wellbeing: "Höflich, sachlich, nicht in Not.",
  priorTalk: "Kein Auftrag, keine Zahl, kein zweiter Makler mit bekanntem Umfang.",
  constitution: "Kein relevanter Gesundheitsbezug, außer die Lage legt Alltag im Haus nahe.",
  disclosure: "Verdeckt nur bei konkreter, passender Frage.",
  outcome: "Lage und nächsten angemessenen Schritt klären. Kein Auftrag ohne Willen und Vollmacht. Keine erfundenen Käufer.",
  guide: {
    occasion: "Gespräch vorbereiten. Ziel: eine geklärte Lage und genau ein nächster Schritt.",
    presumed: "Interesse, Einwand oder Absage sind möglich. Nichts davon unterstellen.",
    lines: [
      "Darf ich kurz sagen, warum ich anrufe — und Sie sagen, ob das für Sie jetzt passt?",
      "Was ist für Sie der wichtigste offene Punkt?",
      "Wenn das heute nicht passt: Soll ich das Thema schließen oder später nachfassen?",
    ],
    avoid: ["Produktpitch vor der Lage.", "Erfundene Käufer, Preise oder Zusagen."],
    questions: ["Was wissen Sie sicher?", "Was fehlt noch, bevor ein nächster Schritt Sinn hat?"],
  },
};

export function pickHiddenHinge(seed: ScenarioSeed): HiddenHinge {
  const kind = classifySituation(seed);
  const matching = HINGES.filter((h) => h.kind === kind);
  const pool = matching.length > 0 ? matching : [GENERIC];
  if (!seed.rollHidden) return pool[0]!;
  const index =
    seed.variant != null
      ? ((seed.variant % pool.length) + pool.length) % pool.length
      : hashSeed(seed) % pool.length;
  return pool[index]!;
}

export { GENERIC, HINGES };
