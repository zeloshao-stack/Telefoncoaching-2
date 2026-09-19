import type { CallOrigin, InnerLife, PersonaAnchors, RoleCharacter } from "./types";

/** Stabiler Hash — dieselbe Figur bekommt immer dieselben Anker. */
export function hashString(text: string) {
  let n = 0;
  for (let i = 0; i < text.length; i += 1) n = (n * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(n);
}

function pick<T>(pool: readonly T[], seed: number, salt = 0): T {
  return pool[(seed + salt) % pool.length]!;
}

function pickMany<T>(pool: readonly T[], seed: number, count: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  for (let i = 0; out.length < Math.min(count, pool.length); i += 1) {
    const idx = (seed + i * 7 + out.length * 3) % pool.length;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(pool[idx]!);
  }
  return out;
}

export function characterSeed(character: Pick<RoleCharacter, "scenarioId" | "identity">) {
  return hashString(`${character.scenarioId}|${character.identity.name}`);
}

const FEMALE_FIRST =
  /^(elisabeth|helene|maria|anna|ingrid|sabine|clara|klara|tanja|leni|eva|christine|christina|brigitte|gerda|renate|monika|ursula|susanne|andrea|petra|barbara|claudia|karin|martina|birgit|silvia|gabriele|johanna|katharina|sophie|lisa|julia|sandra|nicole|elfriede|hildegard|herta|margarete|rosa|theresia|erika|waltraud|ilse|edith|gertrude|hannelore|irmgard|doris|heidi|verena|melanie|bettina|daniela|ruth|elke|anneliese)$/;
const MALE_FIRST =
  /^(franz|andreas|otto|karl|martin|thomas|bernd|klaus|jan|killian|josef|johann|peter|werner|herbert|gerhard|walter|helmut|kurt|rudolf|alois|anton|ernst|friedrich|georg|hans|heinz|leopold|manfred|michael|norbert|robert|stefan|stephan|wolfgang|christian|markus|alexander|daniel|david|florian|lukas|paul|max|felix|jakob|leon|erich|hubert|reinhard|gerald|harald|dieter|siegfried|roland|günter|guenter|richard|ferdinand|matthias|philipp|tobias|sebastian|patrick|simon)$/;

export function inferGender(character: Pick<RoleCharacter, "identity" | "publicBrief">): "female" | "male" {
  if (character.identity.gender) return character.identity.gender;
  const first = character.identity.name.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (FEMALE_FIRST.test(first)) return "female";
  if (MALE_FIRST.test(first)) return "male";
  const prof = character.identity.profession.toLowerCase();
  if (/(in|frau|dame|witwe|tochter|mutter)$/.test(prof) || /^frau\b/.test(character.identity.name.toLowerCase())) {
    return "female";
  }
  if (/(er|herr|mann|sohn|witwer|vater)$/.test(prof) || /^herr\b/.test(character.identity.name.toLowerCase())) {
    return "male";
  }
  const brief = character.publicBrief.toLowerCase();
  if (/eigentümerin|kundin|interessentin|\bfrau\b|witwe|dame/.test(brief)) return "female";
  if (/eigentümer\b|kunde\b|interessent\b|\bherr\b|witwer/.test(brief)) return "male";
  return "female";
}

export type AgeBand = "young" | "mid" | "older";

/** Alter: explizit, aus dem Briefing gelesen, sonst deterministisch aus Erfahrung und Geduld. */
export function inferAge(character: Pick<RoleCharacter, "identity" | "publicBrief" | "traits" | "scenarioId">): number {
  if (typeof character.identity.age === "number" && character.identity.age >= 18) return Math.round(character.identity.age);
  const blob = character.publicBrief;
  const explicit =
    blob.match(/\b(\d{2})\s*(?:jahre|jahr|jare|jährig|j\.)/i) ??
    blob.match(/,\s*(\d{2})\s*[.,]/) ??
    blob.match(/\b(?:ist|alter|alt)\s*(\d{2})\b/i);
  if (explicit) {
    const n = Number(explicit[1]);
    if (n >= 20 && n <= 95) return n;
  }
  const seed = characterSeed(character);
  const lower = blob.toLowerCase();
  if (/pension|rentner|witwe|witwer|älter|senior|\boma\b|\bopa\b|enkel/.test(lower)) return 64 + (seed % 12); // 64–75
  if (/\bjung|jünger|anfang 30|student|azubi|lehrling|berufseinsteig/.test(lower)) return 28 + (seed % 10); // 28–37
  const experience = character.identity.marketExperience;
  const patience = character.traits.patience;
  if (experience === "high" || (experience === "medium" && patience >= 7)) return 58 + (seed % 12); // 58–69
  return 42 + (seed % 16); // 42–57
}

export function ageBandOf(age: number): AgeBand {
  if (age >= 60) return "older";
  if (age <= 38) return "young";
  return "mid";
}

const COLD_MARKERS =
  /kaltkontakt|kaltakquise|cold.?call|ohne vorherigen termin|uns unbekannt|unbekannte[rn]? (?:eigentümer|person|anrufer|kontakt)|grundbuch|vorbeigefahren|nachbar|tipp gegeben|gerücht|warum rufen sie(?: jetzt| noch einmal| nochmal)? an|nicht mehr .{0,40}angerufen|woher haben sie|erstkontakt|inserat|erstanruf|unangemeldet/;
const INBOUND_MARKERS =
  /hat angerufen|haben angerufen|ruft (?:wegen|an\b|bei)|ruft .{0,30}\ban\b|meldet sich|\bkunde\b|\bkundin\b|interessent|anfrage|will wissen|kann ich jetzt|was spare ich|ich brauch|rückruf gewünscht|hat sich gemeldet|hat um .{0,20}gebeten/;
const WARM_MARKERS =
  /schon gesprochen|bereits gesprochen|wir hatten kontakt|empfehlung|empfohlen|bestandskund|vergleiche|anderer makler|auftrag vorstellen|nachfassen|bewertung|hausverwaltung kennt|termin vereinbart|bekannter/;

/**
 * Anrufkontext aus dem Szenario: Kaltakquise legt schnell auf, Bestandskontakt hört zu,
 * wer selbst angerufen hat, will eine Antwort.
 */
export function deriveCallContext(character: Pick<RoleCharacter, "callContext" | "publicBrief" | "opening" | "scenarioId">): CallOrigin {
  if (character.callContext) return character.callContext;
  const blob = `${character.publicBrief} ${character.opening}`.toLowerCase();
  if (COLD_MARKERS.test(blob)) return "cold";
  if (INBOUND_MARKERS.test(blob)) return "inbound";
  if (WARM_MARKERS.test(blob)) return "warm";
  return "warm";
}

export function callContextLabel(context: CallOrigin) {
  if (context === "cold") return "Kaltakquise";
  if (context === "inbound") return "Anruf der Kundin oder des Kunden";
  return "Bestehender Kontakt";
}

const SITUATIONS: Record<AgeBand, readonly string[]> = {
  older: [
    "stehst in der Küche, der Kaffee wird kalt",
    "hast gerade die Post durchgeschaut, eine Rechnung der Hausverwaltung liegt am Tisch",
    "warst gerade am Rausgehen, die Schuhe schon an",
    "sitzt am Küchentisch mit der Zeitung, das Radio läuft leise",
    "bist gerade vom Einkaufen zurück, die Taschen stehen noch im Vorzimmer",
    "hast Besuch von der Enkelin, die im Nebenzimmer spielt",
  ],
  mid: [
    "sitzt im Büro zwischen zwei Terminen, der Laptop ist offen",
    "bist im Auto auf der Freisprechanlage, Stau auf der Tangente",
    "stehst in der Küche, das Kind quengelt im Hintergrund",
    "bist gerade beim Kochen, gleich kocht das Wasser über",
    "hast Homeoffice, in zehn Minuten die nächste Videokonferenz",
    "räumst gerade den Einkauf ein, das Handy zwischen Schulter und Ohr",
  ],
  young: [
    "bist unterwegs zur U-Bahn, Straßenlärm um dich",
    "sitzt im Büro, Kollegen reden nebenan",
    "hast gerade das Baby hingelegt und sprichst leise",
    "stehst im Supermarkt an der Kassa",
    "bist am Rad kurz stehen geblieben, um abzuheben",
  ],
};

const INBOUND_SITUATIONS: readonly string[] = [
  "hast dir die Unterlagen auf den Tisch gelegt und extra Zeit genommen",
  "hast den Vertrag vor dir liegen, Kugelschreiber in der Hand",
  "rufst in der Mittagspause an, hast etwa zehn Minuten",
  "sitzt am Küchentisch mit dem letzten Schreiben, das dich geärgert hat",
];

const AGENDA: Record<CallOrigin, readonly string[]> = {
  cold: [
    "Man ruft DICH an, unbestellt. Du willst wissen, wer das ist und woher die Nummer kommt — sonst bist du in einer Minute wieder weg.",
    "Du hast nicht angerufen. Du willst wissen: Warum ich, warum jetzt? Ohne Antwort darauf ist das Gespräch für dich vorbei.",
  ],
  warm: [
    "Ihr kennt euch oder es gibt einen Anlass. Du willst wissen, ob sich das Gespräch lohnt: Was ist neu, was bringt es dir konkret — kein Verkaufsvortrag.",
    "Du kennst die Lage schon. Du willst hören, was sich geändert hat, nicht noch einmal dieselbe Geschichte.",
  ],
  inbound: [
    "DU hast angerufen. Du willst eine klare Antwort auf deine Frage, ohne dass dir etwas aufgeschwatzt wird.",
    "DU hast angerufen, weil dich etwas drückt. Du willst Klarheit, keine Beratung von oben.",
  ],
};

const IDIOMS = {
  brisk: ["Passen Sie auf,", "Sagen S' einmal,", "Kommen Sie zur Sache.", "Wissen Sie was,", "Also bitte."],
  skeptical: ["Na ja.", "Schauen Sie,", "Das sagt jeder.", "Aha.", "Das glaub ich erst, wenn ich's sehe."],
  warm: ["Ja, eh.", "Wissen Sie,", "Mah, das ist lieb, aber", "Schauen wir einmal.", "Na gut."],
  neutral: ["Also,", "Na ja.", "Ehrlich gesagt,", "Moment,", "Gut."],
} as const;

const REGIONAL_FILLERS: Array<[RegExp, string]> = [
  [/schweiz/i, "„ja nu“, „gäll“ (sparsam, Schweizer Färbung)"],
  [/deutschland|bundes/i, "„ja gut“, „also“ (sparsam)"],
  [/steier|kärnten|oberösterreich|tirol|salzburg/i, "„eh“, „halt“, „na“ (sparsam, ländlich gefärbt)"],
];

export function regionalFillers(region: string) {
  for (const [re, text] of REGIONAL_FILLERS) if (re.test(region)) return text;
  return "„eh“, „halt“, „na“ (sparsam, Wiener Färbung)";
}

/** Assistenten-Sätze — Ausgabe-Tests, nicht Sprechprompt. */
export const ASSISTANT_PHRASES = [
  "„Ich verstehe Ihre Bedenken“",
  "„Was darf ich für Sie tun“",
  "„Wie kann ich Ihnen helfen“",
  "„Vielen Dank für Ihre Frage“",
  "„Haben Sie ein konkretes Anliegen“",
  "„technisches Problem“",
  "„Könnten Sie das wiederholen“ (du sagst „Wie bitte?“)",
];

const BASE_TABOOS: string[] = [];

/** Deterministische Persona-Anker; explizite Werte aus der Figur gewinnen. Inneres bleibt erhalten. */
export type DerivedPersona = PersonaAnchors & { innerLife?: InnerLife };

export function derivePersona(character: RoleCharacter): DerivedPersona {
  const seed = characterSeed(character);
  const age = inferAge(character);
  const band = ageBandOf(age);
  const context = deriveCallContext(character);
  const t = character.traits;

  const pool =
    t.patience <= 3 || t.dominance >= 7
      ? IDIOMS.brisk
      : t.skepticism >= 7
        ? IDIOMS.skeptical
        : t.humor >= 5 || character.behaviour.smalltalkAffinity >= 5
          ? IDIOMS.warm
          : IDIOMS.neutral;
  const idioms = pickMany(pool, seed, 3);

  const taboos = [...BASE_TABOOS];
  const traitTaboos: string[] = [];
  if (character.behaviour.smalltalkAffinity <= 2) traitTaboos.push("Plaudern übers Wetter oder Befinden des Anrufers");
  if (t.skepticism >= 7) traitTaboos.push("„Das klingt interessant“");
  if (t.humor <= 2) traitTaboos.push("Witze, „haha“");
  if (t.dominance >= 7) traitTaboos.push("sich entschuldigen, wenn du im Recht bist");
  taboos.push(...traitTaboos.slice(0, 2));

  const situationNow =
    context === "inbound" ? pick(INBOUND_SITUATIONS, seed) : pick(SITUATIONS[band], seed, 1);

  const derived: PersonaAnchors = {
    situationNow,
    agenda: pick(AGENDA[context], seed, 2),
    idioms,
    taboos,
  };
  const override = character.persona ?? {};
  const anchors: DerivedPersona = {
    situationNow: override.situationNow?.trim() || derived.situationNow,
    agenda: override.agenda?.trim() || derived.agenda,
    idioms: override.idioms?.length ? override.idioms : derived.idioms,
    taboos: override.taboos?.length ? override.taboos : derived.taboos,
  };
  if (character.innerLife) anchors.innerLife = character.innerLife;
  return anchors;
}
