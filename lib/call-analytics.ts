import type { TranscriptTurn } from "@/src/role-engine/types";

export type SkillState = "sichtbar" | "luecke" | "keine_gelegenheit";

export type AnalyzedSkill = {
  id: "B1" | "B2" | "B3" | "B4";
  label: string;
  state: SkillState;
  evidence: string;
};

export type FillerCount = { word: string; count: number };

export type CallAnalytics = {
  traineeWords: number;
  counterpartWords: number;
  traineeShare: number;
  traineeTurns: number;
  counterpartTurns: number;
  openQuestions: number;
  closedQuestions: number;
  longestTraineeWords: number;
  fillers: FillerCount[];
  shareReading: string;
  skills: AnalyzedSkill[];
  gapSkill: AnalyzedSkill | null;
  drillQuestion: string;
  suggestedLine: string;
};

export type AttemptDelta = {
  shareBefore: number;
  shareAfter: number;
  skills: { id: AnalyzedSkill["id"]; label: string; before: SkillState; after: SkillState }[];
  improved: string[];
  stillOpen: string[];
  reading: string;
};

const SUGGESTED_LINE: Record<AnalyzedSkill["id"], string> = {
  B1: "Guten Tag, mein Name ist … Ich rufe an, weil … — und Sie entscheiden, ob das Gespräch sinnvoll ist.",
  B2: "Sie sagten … Was bedeutet das für Sie konkret?",
  B3: "Das kann ich nachvollziehen. Was wäre für Sie tragfähig — ein nächster Schritt oder ein klares Nein?",
  B4: "Was wäre der konkrete nächste Schritt: Termin, Aufgabe, oder ich vermerke Ihre Absage?",
};

const PERSON_FLIP: [RegExp, string][] = [
  [/\bwir haben\b/gi, "Sie haben"],
  [/\bich habe\b/gi, "Sie haben"],
  [/\bwir sind\b/gi, "Sie sind"],
  [/\bich bin\b/gi, "Sie sind"],
  [/\bwir wollen\b/gi, "Sie wollen"],
  [/\bich will\b/gi, "Sie wollen"],
  [/\bich überlege mir\b/gi, "Sie überlegen sich"],
  [/\bich muss\b/gi, "Sie müssen"],
  [/\bwir müssen\b/gi, "Sie müssen"],
  [/\bmir\b/g, "Ihnen"],
  [/\bmich\b/g, "Sie"],
  [/\bmeine\b/g, "Ihre"],
  [/\bmeinem\b/g, "Ihrem"],
  [/\bmeinen\b/g, "Ihren"],
  [/\bmein\b/g, "Ihr"],
  [/\bunser(e|em|en|er)?\b/gi, "Ihr$1"],
  [/\bwir\b/g, "Sie"],
  [/\bich\b/g, "Sie"],
  [/\buns\b/g, "Ihnen"],
];

/** „wir haben schon einen Makler“ → „Sie haben schon einen Makler“ — zum Spiegeln in der eigenen Antwort. */
export function mirrorPerson(text: string): string {
  let out = text;
  for (const [pattern, replacement] of PERSON_FLIP) out = out.replace(pattern, replacement);
  return out.charAt(0).toUpperCase() + out.slice(1);
}

const ASIDE = /^(wenn sie schon so fragen|kein interesse|nein danke|nein|ach|na gut|also|ja|tja|hören sie|schauen sie)[,:\s]+/i;

export function counterpartHook(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const euro = cleaned.match(/(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*Euro/i);
  if (euro) return euro[0].replace(/\s+/g, " ");
  let afterAside = cleaned;
  for (let i = 0; i < 3; i += 1) afterAside = afterAside.replace(ASIDE, "");
  if (!afterAside.trim()) afterAside = cleaned;
  const clause = (afterAside.split(/[.!?]/)[0] || afterAside).trim();
  const tokens = clause.split(/\s+/).filter(Boolean);
  const short = tokens.length <= 8 ? clause : tokens.slice(0, 8).join(" ");
  return mirrorPerson(short);
}

function pickGap(skills: AnalyzedSkill[], spoken: TranscriptTurn[]): AnalyzedSkill | null {
  const open = skills.filter((skill) => skill.state === "luecke");
  if (open.length === 0) return null;
  const last = [...spoken].reverse().find((turn) => turn.speaker === "counterpart")?.text ?? "";
  const listened = skills.find((skill) => skill.id === "B2")?.state === "sichtbar";
  const relevant = listened ? open.filter((skill) => skill.id !== "B1") : open;
  const pool = relevant.length ? relevant : open;
  if (/[?]|zu teuer|euro|kein interesse|nicht verkaufen|schon einen|kündig/i.test(last)) {
    return pool.find((skill) => skill.id === "B2" || skill.id === "B3") ?? pool[0];
  }
  return pool[0];
}

export function suggestNextLine(turns: TranscriptTurn[], gapId: AnalyzedSkill["id"] | null): string {
  const last = [...turns].reverse().find((turn) => turn.speaker === "counterpart")?.text ?? "";
  const hook = counterpartHook(last);
  if (gapId === "B1") return SUGGESTED_LINE.B1;
  if (gapId === "B4") return SUGGESTED_LINE.B4;
  if (gapId === "B3") {
    return hook
      ? `Das kann ich nachvollziehen. ${hook} — was wäre für Sie tragfähig: ein nächster Schritt oder ein klares Nein?`
      : SUGGESTED_LINE.B3;
  }
  if (hook && /Euro|Honorar|Preis|Prämie|Rate|Angebot/i.test(last)) {
    return `Was genau umfasst das Angebot zu ${hook}?`;
  }
  if (hook) return `${hook}. Was bedeutet das für Sie konkret?`;
  return SUGGESTED_LINE.B2;
}

const STATE_RANK: Record<SkillState, number> = {
  luecke: 0,
  keine_gelegenheit: 1,
  sichtbar: 2,
};

const FILLERS = ["ähm", "äh", "also", "quasi", "irgendwie", "halt", "sozusagen", "genau"] as const;

const OPEN_START =
  /^(wie|was|wer|wen|wem|wo|woran|wozu|warum|weshalb|welche|welcher|welches|inwiefern|womit)\b/i;

function words(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}0-9äöüß]+/u)
    .filter((w) => w.length > 0);
}

function questionKind(text: string): "open" | "closed" | null {
  const trimmed = text.trim();
  if (!trimmed.includes("?")) return null;
  const first = trimmed.replace(/^["«»„“]+/, "");
  if (OPEN_START.test(first) || /\b(wie|was|woran|wer muss|welche)\b/i.test(trimmed)) return "open";
  return "closed";
}

function fillerCounts(texts: string[]): FillerCount[] {
  const blob = texts.join(" ").toLowerCase();
  return FILLERS.map((word) => ({
    word,
    count: (blob.match(new RegExp(`\\b${word}\\b`, "g")) || []).length,
  })).filter((row) => row.count > 0);
}

function mirrored(turns: TranscriptTurn[]): boolean {
  for (let i = 1; i < turns.length; i += 1) {
    const turn = turns[i];
    if (turn.speaker !== "trainee") continue;
    const prev = [...turns.slice(0, i)].reverse().find((t) => t.speaker === "counterpart");
    if (!prev) continue;
    const prevWords = words(prev.text).filter((w) => w.length > 5);
    const now = words(turn.text);
    if (prevWords.some((w) => now.includes(w))) return true;
  }
  return false;
}

function counterpartObjection(turns: TranscriptTurn[]): boolean {
  return turns.some(
    (t) =>
      t.speaker === "counterpart" &&
      /nicht verkaufen|kein interesse|zu teuer|privat|schon einen|überlege|kündigen|keine anrufe|schicken sie/i.test(
        t.text,
      ),
  );
}

function traineeAcknowledged(turns: TranscriptTurn[]): boolean {
  return turns.some(
    (t) =>
      t.speaker === "trainee" &&
      /verstehe|nachvollzieh|vermerkt|respektier|verstanden|das kann ich/i.test(t.text),
  );
}

function nextStepOrEnd(turns: TranscriptTurn[]): boolean {
  return turns.some(
    (t) =>
      t.speaker === "trainee" &&
      /auf wiederhören|vermerke|dienstag|donnerstag|nächste woche|termin|bis wann|wer macht|keine weiteren/i.test(
        t.text,
      ),
  );
}

function introduced(turns: TranscriptTurn[]): boolean {
  const first = turns.find((t) => t.speaker === "trainee");
  if (!first) return false;
  return /mein name|ich bin|rufe an|darf ich|weshalb ich|von \w+/i.test(first.text);
}

export function analyzeCall(turns: TranscriptTurn[]): CallAnalytics {
  const spoken = turns.filter((t) => t.speaker === "trainee" || t.speaker === "counterpart");
  const trainee = spoken.filter((t) => t.speaker === "trainee");
  const counterpart = spoken.filter((t) => t.speaker === "counterpart");
  const traineeWords = trainee.reduce((n, t) => n + words(t.text).length, 0);
  const counterpartWords = counterpart.reduce((n, t) => n + words(t.text).length, 0);
  const total = traineeWords + counterpartWords;
  const traineeShare = total === 0 ? 0 : Math.round((traineeWords / total) * 100);
  const openQuestions = trainee.filter((t) => questionKind(t.text) === "open").length;
  const closedQuestions = trainee.filter((t) => questionKind(t.text) === "closed").length;
  const longestTraineeWords = trainee.reduce((n, t) => Math.max(n, words(t.text).length), 0);

  let shareReading =
    "Redeanteil ist Kontext, kein Zielwert. Erstkontakt braucht oft mehr Orientierung als ein späteres Klärungsgespräch.";
  if (total > 0 && traineeShare >= 70) {
    shareReading =
      "Sie haben den deutlich größeren Redeanteil. Bevor Leistung kommt, sollte die Gegenseite ihre Lage sagen können.";
  } else if (total > 0 && traineeShare <= 35 && openQuestions > 0) {
    shareReading = "Die Gegenseite spricht mehr, und Sie fragen. Das passt zu Verstehen vor Argument.";
  } else if (total > 0 && traineeShare <= 35) {
    shareReading = "Die Gegenseite spricht mehr. Prüfen Sie, ob Sie geführt oder nur reagiert haben.";
  }

  const didMirror = mirrored(spoken);
  const objection = counterpartObjection(spoken);
  const ack = traineeAcknowledged(spoken);
  const closed = nextStepOrEnd(spoken);
  const intro = introduced(spoken);

  const noTalk = trainee.length === 0;
  const skills: AnalyzedSkill[] = [
    {
      id: "B1",
      label: "Klarheit",
      state: noTalk ? "keine_gelegenheit" : intro ? "sichtbar" : "luecke",
      evidence: noTalk
        ? "Kein eigener Beitrag im Transkript."
        : intro
          ? "Einstieg oder knappe Aussage ist erkennbar."
          : "Rolle, Anlass oder Wahlfreiheit sind im ersten Beitrag nicht klar.",
    },
    {
      id: "B2",
      label: "Zuhören",
      state: noTalk ? "keine_gelegenheit" : openQuestions > 0 || didMirror ? "sichtbar" : "luecke",
      evidence: noTalk
        ? "Kein eigener Beitrag im Transkript."
        : openQuestions > 0
          ? `${openQuestions} offene Frage${openQuestions === 1 ? "" : "n"}.`
          : didMirror
            ? "Sie nehmen ein Wort der Gegenseite auf."
            : "Keine offene Frage und kein Bezug auf das Gesagte.",
    },
    {
      id: "B3",
      label: "Widerstand",
      state: noTalk || !objection ? "keine_gelegenheit" : ack ? "sichtbar" : "luecke",
      evidence:
        noTalk || !objection
          ? "Kein klarer Widerstand im Transkript."
          : ack
            ? "Widerstand wird aufgenommen, bevor weiter argumentiert wird."
            : "Widerstand ist hörbar, wird aber nicht erst gespiegelt oder geklärt.",
    },
    {
      id: "B4",
      label: "Verbindlichkeit",
      state: noTalk ? "keine_gelegenheit" : closed ? "sichtbar" : "luecke",
      evidence: noTalk
        ? "Kein eigener Beitrag im Transkript."
        : closed
          ? "Es gibt einen konkreten nächsten Schritt oder ein klares Ende."
          : "Kein Termin, keine Aufgabe, keine respektvolle Absage.",
    },
  ];

  const gapSkill = pickGap(skills, spoken);
  const drillQuestion = gapSkill
    ? `Im letzten Gespräch war die Lücke: ${gapSkill.label}. ${gapSkill.evidence} Die Gegenseite sagte: „${counterpartHook(counterpart.at(-1)?.text || "")}“. Wie formuliere ich den nächsten Satz, ohne zu drücken?`
    : "Was war in diesem Gespräch der eine nächste Satz, den ich beim nächsten Mal zuerst sagen sollte?";
  const suggestedLine = suggestNextLine(spoken, noTalk ? "B2" : (gapSkill?.id ?? null));

  return {
    traineeWords,
    counterpartWords,
    traineeShare,
    traineeTurns: trainee.length,
    counterpartTurns: counterpart.length,
    openQuestions,
    closedQuestions,
    longestTraineeWords,
    fillers: fillerCounts(trainee.map((t) => t.text)),
    shareReading,
    skills,
    gapSkill,
    drillQuestion,
    suggestedLine,
  };
}

export function compareAttempts(before: CallAnalytics, after: CallAnalytics): AttemptDelta {
  const skills = before.skills.map((prior) => {
    const next = after.skills.find((skill) => skill.id === prior.id) ?? prior;
    return { id: prior.id, label: prior.label, before: prior.state, after: next.state };
  });
  const improved = skills
    .filter((row) => STATE_RANK[row.after] > STATE_RANK[row.before])
    .map((row) => row.label);
  const stillOpen = skills.filter((row) => row.after === "luecke").map((row) => row.label);
  let reading = "Zweiter Versuch liegt vor. Vergleichen Sie den einen Hebel, nicht die Note.";
  if (after.traineeTurns === 0) {
    reading = "Im zweiten Versuch fehlt noch ein eigener Satz. Dieselbe Stelle noch einmal.";
  } else if (improved.length && stillOpen.length === 0) {
    reading = `Hörbar besser: ${improved.join(", ")}.`;
  } else if (improved.length) {
    reading = `Besser bei ${improved.join(", ")}. Offen bleibt ${stillOpen.join(", ")}.`;
  } else if (stillOpen.length) {
    reading = `Dieselbe Lücke: ${stillOpen.join(", ")}. Dieselbe Stelle noch einmal.`;
  }
  return {
    shareBefore: before.traineeShare,
    shareAfter: after.traineeShare,
    skills,
    improved,
    stillOpen,
    reading,
  };
}
