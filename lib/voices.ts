import { committedSpokenText } from "@/src/role-engine/delivery";

export const MAX_SPOKEN_CHARS = 2000;

export type VoiceGender = "female" | "male";
export type VoiceAge = "young" | "mid" | "older";
export type VoiceLocale = "de-AT" | "de-DE" | "de-CH";
export type VoiceKind = "neural" | "clone" | "library";
export type VoiceMood = "neutral" | "calm" | "skeptical" | "impatient" | "warm" | "sad" | "cheerful";

export type VoiceCard = {
  id: string;
  name: string;
  role: string;
  description: string;
  sample: string;
  gender: VoiceGender;
  ageBand: VoiceAge;
  locale: VoiceLocale;
  region: string;
  kind: VoiceKind;
  rate: number;
};

export type VoiceSpec = VoiceCard & {
  azureVoice: string;
  azureRate: string;
  azurePitch: string;
  openaiVoice: string;
  instructions: string;
  mood?: VoiceMood;
  azureStyle?: "cheerful" | "sad";
  elevenVoiceId?: string;
  cartesiaVoiceId?: string;
  standInId?: string;
};

const PHONE =
  "Speak as a real person on a landline phone: conversational, slight breath, not a narrator, not a call-center script, no English, no singing.";

function at(extra: string) {
  return `${PHONE} Austrian Standard German (de-AT), Vienna-area pronunciation: open vowels, natural Grüß Gott, not northern German, not caricature dialect. ${extra}`;
}

function de(extra: string) {
  return `${PHONE} Standard German (de-DE). ${extra}`;
}

function ch(extra: string) {
  return `${PHONE} Swiss Standard German (de-CH), light Swiss intonation, not Bavarian. ${extra}`;
}

export const SEED_VOICES: VoiceSpec[] = [
  {
    id: "elisabeth",
    name: "Elisabeth Leitner",
    role: "Zinshaus-Eigentümerin",
    description: "Wien, Anfang 60, skeptisch, knapp am Hörer.",
    sample: "Grüß Gott. Ja, das Haus gehört mir. Warum rufen Sie an?",
    gender: "female",
    ageBand: "older",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 0.92,
    azureVoice: "de-AT-IngridNeural",
    azureRate: "-4%",
    azurePitch: "-1%",
    openaiVoice: "sage",
    mood: "skeptical",
    instructions: at("Woman in her sixties, reserved, slightly skeptical, at home."),
  },
  {
    id: "franz",
    name: "Franz Berger",
    role: "Klare Absage",
    description: "Wien, älter, ungeduldig, will auflegen.",
    sample: "Kein Interesse. Ich verkauf nicht. Bitte lassen S' mich in Ruh.",
    gender: "male",
    ageBand: "older",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 1.06,
    azureVoice: "de-AT-JonasNeural",
    azureRate: "+5%",
    azurePitch: "-2%",
    openaiVoice: "onyx",
    mood: "impatient",
    instructions: at("Older man, impatient, clipped, done with the call."),
  },
  {
    id: "andreas",
    name: "Andreas Huber",
    role: "Miteigentümer",
    description: "Wien, Mitte 40, sachlich, entscheidet nicht allein.",
    sample: "Moment, das Haus gehört nicht nur mir. Da muss ich mit meiner Schwester reden.",
    gender: "male",
    ageBand: "mid",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 1,
    azureVoice: "de-DE-ConradNeural",
    azureRate: "-4%",
    azurePitch: "+0%",
    openaiVoice: "echo",
    mood: "calm",
    azureStyle: "cheerful",
    instructions: at("Man in his forties, matter-of-fact, polite, thinks before he answers."),
  },
  {
    id: "helene",
    name: "Helene Sommer",
    role: "Wallnerstraße",
    description: "Wien, 65, höflich, müde, das Haus ist ihr Zuhause.",
    sample:
      "Grüß Gott. Ja, die Wallnerstraße, das Haus gehört mir. Die Fassade haben wir herrichten lassen. Warum rufen Sie an?",
    gender: "female",
    ageBand: "older",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 0.9,
    azureVoice: "de-AT-IngridNeural",
    azureRate: "-4%",
    azurePitch: "-2%",
    openaiVoice: "coral",
    mood: "warm",
    instructions: at("Woman of 65, polite, a little tired, attached to her house."),
  },
  {
    id: "clara",
    name: "Clara Weiss",
    role: "Jüngere Eigentümerin",
    description: "Wien, Anfang 30, klar, etwas distanziert.",
    sample: "Ich hab nur kurz Zeit. Worum geht's konkret?",
    gender: "female",
    ageBand: "young",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 1.04,
    azureVoice: "de-DE-AmalaNeural",
    azureRate: "+4%",
    azurePitch: "+4%",
    openaiVoice: "nova",
    instructions: at("Woman around 30, brisk, urban, not chatty."),
  },
  {
    id: "bernd",
    name: "Bernd Steiner",
    role: "Steiermark",
    description: "Ländlicher, ruhiger Mann, österreichisches Standarddeutsch.",
    sample: "Da muss ich mir das erst anschauen. Rufen S' nächste Woche noch einmal an.",
    gender: "male",
    ageBand: "mid",
    locale: "de-AT",
    region: "Steiermark",
    kind: "neural",
    rate: 0.94,
    azureVoice: "de-DE-BerndNeural",
    azureRate: "-6%",
    azurePitch: "-2%",
    openaiVoice: "ash",
    instructions: at("Rural Styrian man speaking Austrian standard German, calm, unhurried."),
  },
  {
    id: "klaus",
    name: "Klaus Hartmann",
    role: "Deutschland, älter",
    description: "Bundesdeutsch, gravitätisch — Kontrast zu Wien.",
    sample: "Ich habe bereits einen Berater. Schicken Sie Unterlagen, mehr nicht.",
    gender: "male",
    ageBand: "older",
    locale: "de-DE",
    region: "Deutschland",
    kind: "neural",
    rate: 0.93,
    azureVoice: "de-DE-KlausNeural",
    azureRate: "-6%",
    azurePitch: "-4%",
    openaiVoice: "fable",
    instructions: de("Older German man, formal, slightly distant."),
  },
  {
    id: "tanja",
    name: "Tanja Berger",
    role: "Deutschland, sachlich",
    description: "Bundesdeutsch, klare Bürostimme.",
    sample: "Bitte kommen Sie zur Sache. Was genau wollen Sie von mir?",
    gender: "female",
    ageBand: "mid",
    locale: "de-DE",
    region: "Deutschland",
    kind: "neural",
    rate: 1,
    azureVoice: "de-DE-TanjaNeural",
    azureRate: "+0%",
    azurePitch: "+0%",
    openaiVoice: "alloy",
    instructions: de("Mid-aged German woman, office telephone, precise."),
  },
  {
    id: "leni",
    name: "Leni Meier",
    role: "Schweiz",
    description: "Schweizer Hochdeutsch, freundlich, knapp.",
    sample: "Grüezi. Ich schaue, ob das für uns überhaupt ein Thema ist.",
    gender: "female",
    ageBand: "mid",
    locale: "de-CH",
    region: "Schweiz",
    kind: "neural",
    rate: 0.98,
    azureVoice: "de-CH-LeniNeural",
    azureRate: "-2%",
    azurePitch: "+2%",
    openaiVoice: "shimmer",
    instructions: ch("Swiss woman, friendly, concise."),
  },
  {
    id: "jan",
    name: "Jan Keller",
    role: "Schweiz",
    description: "Schweizer Hochdeutsch, männlich, nüchtern.",
    sample: "Das entscheiden wir intern. Schicken Sie die Eckdaten schriftlich.",
    gender: "male",
    ageBand: "mid",
    locale: "de-CH",
    region: "Schweiz",
    kind: "neural",
    rate: 1,
    azureVoice: "de-CH-JanNeural",
    azureRate: "+0%",
    azurePitch: "+0%",
    openaiVoice: "verse",
    instructions: ch("Swiss man, dry, businesslike."),
  },
  {
    id: "killian",
    name: "Killian Graf",
    role: "Jüngerer Miteigentümer",
    description: "Deutschland/Österreich-Mitte, jünger, ungeduldig höflich.",
    sample: "Ich bin unterwegs. In zwei Sätzen, bitte.",
    gender: "male",
    ageBand: "young",
    locale: "de-DE",
    region: "Deutschland",
    kind: "neural",
    rate: 1.08,
    azureVoice: "de-DE-KillianNeural",
    azureRate: "+10%",
    azurePitch: "+3%",
    openaiVoice: "ballad",
    instructions: de("Younger man, walking, short sentences."),
  },
  {
    id: "neutral",
    name: "Klare Ansage",
    role: "Eigene Zeile prüfen",
    description: "Österreichische Neuralstimme, neutral, zum Formulieren.",
    sample: "Grüß Gott, mein Name ist Manzl, ich rufe wegen Ihres Hauses in Wien an. Haben Sie kurz zwei Minuten?",
    gender: "male",
    ageBand: "mid",
    locale: "de-AT",
    region: "Wien",
    kind: "neural",
    rate: 1,
    azureVoice: "de-AT-JonasNeural",
    azureRate: "-2%",
    azurePitch: "+0%",
    openaiVoice: "echo",
    instructions: at("Neutral adult, clear, professional without sounding scripted."),
  },
];

export function publicCard(spec: VoiceSpec): VoiceCard {
  return {
    id: spec.id,
    name: spec.name,
    role: spec.role,
    description: spec.description,
    sample: spec.sample,
    gender: spec.gender,
    ageBand: spec.ageBand,
    locale: spec.locale,
    region: spec.region,
    kind: spec.kind,
    rate: spec.rate,
  };
}

export function voiceCards(): VoiceCard[] {
  return SEED_VOICES.map(publicCard);
}

export function getSeedVoice(id: string): VoiceSpec | undefined {
  return SEED_VOICES.find((item) => item.id === id);
}

export function voiceIdForScenario(scenarioId: string, counterpartName = ""): string {
  if (scenarioId === "S01") return "elisabeth";
  if (scenarioId === "S02") return "franz";
  if (scenarioId === "S03") return "andreas";
  if (scenarioId === "A01" || counterpartName.toLowerCase().includes("helene")) return "helene";
  if (scenarioId === "V01" || counterpartName.toLowerCase().includes("ingrid")) return "tanja";
  if (scenarioId === "V02" || counterpartName.toLowerCase().includes("martin")) return "bernd";
  if (scenarioId === "F01" || counterpartName.toLowerCase().includes("thomas")) return "andreas";
  if (scenarioId === "F02" || counterpartName.toLowerCase().includes("sabine")) return "clara";
  return "helene";
}

export function prepareSpokenText(raw: string): string {
  const compact = committedSpokenText(raw).replace(/\s+/g, " ").trim();
  if (!compact) throw new Error("Kein Text zum Sprechen.");
  const paused = compact
    .replace(/(\s*\.{3,}\s*|\s*…+\s*)/g, ". ")
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  return paused.length > MAX_SPOKEN_CHARS ? paused.slice(0, MAX_SPOKEN_CHARS) : paused;
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Telefonprosodie: leichte Pausen, kein Abhacken. Mood über Rate/Pitch/Style. */
export function toAzureSsml(spec: VoiceSpec, text: string) {
  const mood = spec.mood ?? "neutral";
  let rate = spec.azureRate;
  let pitch = spec.azurePitch;
  if (mood === "impatient") {
    rate = "+6%";
    pitch = "-2%";
  } else if (mood === "skeptical") {
    rate = rate === "+0%" ? "-4%" : rate;
  } else if (mood === "calm") {
    rate = rate === "+0%" ? "-3%" : rate;
  } else if (mood === "warm" || mood === "sad") {
    rate = "-6%";
    pitch = "-2%";
  } else if (mood === "cheerful") {
    rate = "+3%";
    pitch = "+2%";
  }

  const prepared = escapeXml(prepareSpokenText(text));
  // Kurze Pausen nur an Satzenden — lange Breaks klingen abgehackt/robotisch.
  const withBreaks = prepared
    .replace(/\?\s*/g, '?<break time="180ms"/> ')
    .replace(/!\s*/g, '!<break time="140ms"/> ')
    .replace(/\.\s+/g, '.<break time="120ms"/> ')
    .replace(/,\s+/g, ", ")
    .trim();

  const style =
    spec.azureStyle ||
    (mood === "sad"
      ? "sad"
      : mood === "cheerful" || mood === "warm"
        ? "cheerful"
        : mood === "impatient"
          ? "angry"
          : undefined);

  // Styles nur wo Microsoft sie für die Stimme ausweist — sonst wird express-as verworfen.
  const styledVoices = /ConradNeural|SeraphinaNeural|AmalaNeural|BerndNeural|KlarissaNeural|ChristophNeural|FlorianMultilingualNeural|KillianNeural/;
  const canStyle = Boolean(style && styledVoices.test(spec.azureVoice));
  const styleDegree = mood === "impatient" ? "1.4" : mood === "warm" ? "1.1" : "1.15";

  const inner = canStyle
    ? `<mstts:express-as style="${style}" styledegree="${styleDegree}"><prosody rate="${rate}" pitch="${pitch}">${withBreaks}</prosody></mstts:express-as>`
    : `<prosody rate="${rate}" pitch="${pitch}">${withBreaks}</prosody>`;

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${spec.locale}">
  <voice name="${spec.azureVoice}">${inner}</voice>
</speak>`;
}

export function pickBrowserVoice<T extends { name: string; lang: string }>(
  voices: T[],
  spec: { id: string; gender: VoiceGender; ageBand: VoiceAge; locale: string },
): T | null {
  const german = voices.filter((voice) => voice.lang.toLowerCase().startsWith("de"));
  if (!german.length) return null;

  const scored = german.map((voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = 0;
    if (lang.startsWith(spec.locale.toLowerCase())) score += 10;
    else if (spec.locale.startsWith("de-AT") && lang.startsWith("de-at")) score += 10;
    const female = /female|frau|anna|helena|hedda|katja|petra|ingrid|grandma|oma|zira|sandy|shelley|leni/.test(name);
    const male = /male|herr|martin|stefan|jonas|conrad|rainer|grandpa|opa|eddy|reed|albert|klaus|bernd|jan\b/.test(name);
    if (spec.gender === "female" && female) score += 7;
    if (spec.gender === "male" && male) score += 7;
    if (spec.gender === "female" && male) score -= 6;
    if (spec.gender === "male" && female) score -= 6;
    if (spec.ageBand === "older" && /grandma|grandpa|oma|opa|senior/.test(name)) score += 5;
    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.score ?? 0;
  const pool = scored.filter((row) => row.score >= best - 3).map((row) => row.voice);
  const pickFrom = pool.length ? pool : german;
  let hash = 0;
  for (const char of spec.id) hash = (hash + char.charCodeAt(0) * 13) % 997;
  return pickFrom[hash % pickFrom.length] ?? german[0];
}

export function standInSeed(gender: VoiceGender, locale: VoiceLocale, ageBand: VoiceAge): VoiceSpec {
  if (locale === "de-CH") return getSeedVoice(gender === "female" ? "leni" : "jan")!;
  if (locale === "de-DE") {
    if (gender === "female") return getSeedVoice(ageBand === "older" ? "helene" : "tanja")!;
    return getSeedVoice(ageBand === "older" ? "klaus" : "andreas")!;
  }
  if (gender === "female") return getSeedVoice(ageBand === "young" ? "clara" : "elisabeth")!;
  return getSeedVoice(ageBand === "older" ? "franz" : "andreas")!;
}

const CARTESIA_DE = {
  womanConversational: "3f4ade23-6eb4-4279-ab05-6a144947c4d5",
  woman: "b9de4a89-2257-424b-94c2-db18ba68c81a",
  manConversational: "384b625b-da5d-49e8-a76d-a2855d4f31eb",
} as const;

export function cartesiaVoiceFor(spec: Pick<VoiceSpec, "gender" | "ageBand" | "cartesiaVoiceId">) {
  if (spec.cartesiaVoiceId) return spec.cartesiaVoiceId;
  if (spec.gender === "male") return CARTESIA_DE.manConversational;
  return spec.ageBand === "older" ? CARTESIA_DE.woman : CARTESIA_DE.womanConversational;
}

export function moodSpeakHint(mood?: VoiceMood): string {
  if (mood === "impatient") return "Speak shorter and tighter, slightly sharper, not shouting. You were just provoked.";
  if (mood === "skeptical") return "Held, dry, less melody. Someone just cut across you or pushed.";
  if (mood === "calm") return "Quieter, slower, a little warmth. The caller just settled you with a calm voice.";
  if (mood === "warm") return "A faint smile in the voice, as if you heard a friendly laugh or a warm mhm.";
  if (mood === "cheerful") return "Light, a small laugh in the breath, not a jingle.";
  if (mood === "sad") return "Quieter, slower, less energy.";
  return "";
}

export function cartesiaEmotion(mood?: VoiceMood) {
  if (mood === "impatient") return "frustrated";
  if (mood === "skeptical") return "skeptical";
  if (mood === "warm") return "affectionate";
  if (mood === "sad") return "sad";
  if (mood === "cheerful") return "content";
  if (mood === "calm") return "calm";
  return "neutral";
}

/** Premade ElevenLabs-Stimmen, sprechen Deutsch über v3 / multilingual. */
const ELEVEN_LILY = "pFZP5JQG7iQjIQpR1uY5";
const ELEVEN_MATILDA = "XrExE9yKIg1WjnnlVkGX";
const ELEVEN_SARAH = "EXAVITQu4vr4xnSDxMaL";
const ELEVEN_CHARLOTTE = "XB0fDUnXU5powFXDhCwa";
const ELEVEN_ALICE = "Xb7hH8MSUJpSbSDYk0k2";
const ELEVEN_GEORGE = "JBFqnCBsd6RMkjVDRZzb";
const ELEVEN_DANIEL = "onwK4e9ZLuTAKqWW03F9";
const ELEVEN_BRIAN = "nPczCjzI2devNBz1zQrb";
const ELEVEN_BILL = "pqHfZKP75CvOlQylNhV4";
const ELEVEN_CHRIS = "iP95p4xoKVk53GoZ742B";
const ELEVEN_CHARLIE = "IKne3meq5aSn9XLyUdCD";

const ELEVEN_BY_SEED: Record<string, string> = {
  elisabeth: ELEVEN_LILY,
  helene: ELEVEN_MATILDA,
  clara: ELEVEN_SARAH,
  tanja: ELEVEN_CHARLOTTE,
  leni: ELEVEN_ALICE,
  franz: ELEVEN_GEORGE,
  andreas: ELEVEN_DANIEL,
  bernd: ELEVEN_BRIAN,
  klaus: ELEVEN_BILL,
  jan: ELEVEN_CHRIS,
  killian: ELEVEN_CHARLIE,
  neutral: ELEVEN_DANIEL,
};

export type ElevenDelivery = {
  breath?: "held" | "normal" | "sigh";
  warmth?: "flat" | "neutral" | "warm" | "smiling";
  rate?: "slower" | "even" | "faster";
};

export function elevenVoiceFor(spec: Pick<VoiceSpec, "id" | "gender" | "ageBand" | "elevenVoiceId">) {
  if (spec.elevenVoiceId) return spec.elevenVoiceId;
  if (ELEVEN_BY_SEED[spec.id]) return ELEVEN_BY_SEED[spec.id];
  if (spec.gender === "male") return spec.ageBand === "older" ? ELEVEN_GEORGE : ELEVEN_DANIEL;
  return spec.ageBand === "older" ? ELEVEN_LILY : ELEVEN_SARAH;
}

/** Committed Take: Mood steuert Settings, nicht [sighs]/[pause] im Mund. */
export function toElevenSpokenText(text: string, _mood?: VoiceMood, _delivery?: ElevenDelivery) {
  return prepareSpokenText(text);
}

export function elevenVoiceSettings(mood?: VoiceMood) {
  if (mood === "impatient" || mood === "cheerful") {
    return { stability: 0.35, similarity_boost: 0.72, style: 0.62, use_speaker_boost: true };
  }
  if (mood === "calm" || mood === "sad") {
    return { stability: 0.62, similarity_boost: 0.8, style: 0.22, use_speaker_boost: true };
  }
  if (mood === "warm") {
    return { stability: 0.42, similarity_boost: 0.78, style: 0.48, use_speaker_boost: true };
  }
  if (mood === "skeptical") {
    return { stability: 0.55, similarity_boost: 0.8, style: 0.28, use_speaker_boost: true };
  }
  return { stability: 0.45, similarity_boost: 0.78, style: 0.38, use_speaker_boost: true };
}

/** Stimmen-ID in Sitzungen und UI */
export type VoiceId = string;
