import type { TranscriptTurn } from "@/src/role-engine/types";
import { analyzeCall, counterpartHook, suggestNextLine, type AnalyzedSkill } from "@/lib/call-analytics";

export type MomentKind = "einwand" | "frage" | "abschluss";

export type CallMoment = {
  id: string;
  kind: MomentKind;
  kindLabel: string;
  /** Zug der Gegenseite, an dem es kippte */
  turnId: string;
  quote: string;
  /** Ihre Antwort darauf (leer, wenn das Gespräch hier endete) */
  replyTurnId: string | null;
  reply: string;
  /** Warum die Stelle zählt, in einem Satz */
  reason: string;
  skillId: AnalyzedSkill["id"];
  skillLabel: string;
  /** Der eine Satz, den Sie an dieser Stelle probieren */
  suggestedLine: string;
  weight: number;
};

const OBJECTION =
  /nicht verkaufen|kein interesse|zu teuer|zu hoch|privat|schon einen|schon eine|überleg|kündig|keine anrufe|schicken sie|keine zeit|nicht jetzt|später|rufen sie .*an|brauche ich nicht|kein bedarf|woher haben sie|warum rufen|lassen sie mich|melde mich|muss ich .*besprechen|meine frau|mein mann|mein partner|meine schwester|mein bruder/i;

const DIRECT_QUESTION = /\?\s*$|\bwas kostet|\bwie viel|\bwie hoch|\bwarum\b|\bwieso\b|\bwas genau\b|\bwas wollen sie\b/i;

const ACKNOWLEDGE = /verstehe|nachvollzieh|vermerkt|respektier|verstanden|das kann ich|guter punkt|stimmt|ja, das/i;

const PITCH = /wir bieten|unser (produkt|angebot|service|paket)|vorteil|kostenlos|unverbindlich|exklusiv|marktführer|erfahrung|top|beste/i;

const COMMITMENT =
  /termin|dienstag|mittwoch|donnerstag|freitag|montag|nächste woche|bis wann|wer macht|ich schicke|ich melde mich am|vermerke|auf wiederhören|dann bleibt es bei nein|kein weiterer anruf/i;

const SKILL_LABEL: Record<AnalyzedSkill["id"], string> = {
  B1: "Klarheit",
  B2: "Zuhören",
  B3: "Widerstand",
  B4: "Verbindlichkeit",
};

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Auf eine direkte Frage gehört zuerst eine Antwort — dann die Rückfrage. */
function lineForQuestion(question: string): string {
  if (/kostet|kosten|preis|honorar|provision|prämie|prozent|euro|rate|gebühr/i.test(question)) {
    return "Konkret: [Zahl] — und was dafür drin ist, in einem Satz. Woran würden Sie messen, ob sich das für Sie rechnet?";
  }
  if (/woher|wie kommen sie|warum rufen|wer sind sie/i.test(question)) {
    return "Offen gesagt: [Quelle]. Wenn das für Sie nicht passt, sagen Sie es — dann streiche ich Sie. Passt es, darf ich eine Frage stellen?";
  }
  return "Kurz geantwortet: [Antwort in einem Satz]. Und damit ich richtig liege — was ist Ihnen dabei am wichtigsten?";
}

function answersQuestion(question: string, reply: string) {
  if (!DIRECT_QUESTION.test(question)) return true;
  if (/euro|prozent|%|\d/.test(reply)) return true;
  const hook = counterpartHook(question).toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  return hook.some((w) => reply.toLowerCase().includes(w));
}

/**
 * Findet die Stellen eines Gesprächs, an denen es kippte: Einwand, direkte Frage, offenes Ende.
 * Keine Kennzahl, sondern Zitat + Ihre Antwort + ein Hebel. Sortiert nach Gewicht, höchstens fünf.
 */
export function findMoments(turns: TranscriptTurn[]): CallMoment[] {
  const spoken = turns.filter((turn) => turn.speaker === "trainee" || turn.speaker === "counterpart");
  const moments: CallMoment[] = [];

  spoken.forEach((turn, index) => {
    if (turn.speaker !== "counterpart") return;
    const isObjection = OBJECTION.test(turn.text);
    const isQuestion = DIRECT_QUESTION.test(turn.text);
    if (!isObjection && !isQuestion) return;

    const replyTurn = spoken.slice(index + 1).find((t) => t.speaker === "trainee") ?? null;
    const reply = replyTurn?.text ?? "";
    const problems: string[] = [];
    let skillId: AnalyzedSkill["id"] = isObjection ? "B3" : "B2";
    let weight = isObjection ? 3 : 2;

    if (!replyTurn) {
      problems.push("Das Gespräch endete hier ohne Ihre Antwort.");
      weight += 1;
    } else {
      if (isObjection && !ACKNOWLEDGE.test(reply)) {
        problems.push("Der Einwand wurde nicht aufgenommen, bevor Sie weitergingen.");
        weight += 1;
      }
      if (isQuestion && !answersQuestion(turn.text, reply)) {
        problems.push("Die direkte Frage blieb unbeantwortet.");
        skillId = "B2";
        weight += 1;
      }
      if (!reply.includes("?")) {
        problems.push("Keine Rückfrage — die Gegenseite musste nichts mehr sagen.");
        weight += 1;
      }
      if (PITCH.test(reply)) {
        problems.push("Nach dem Einwand kam ein Pitch statt einer Frage.");
        weight += 1;
      }
      if (wordCount(reply) > 45) {
        problems.push(`Ihre Antwort hatte ${wordCount(reply)} Wörter — am Telefon zu lang.`);
        weight += 1;
      }
    }
    if (problems.length === 0) return;

    const context = spoken.slice(0, index + 1);
    const asQuestion = isQuestion && !isObjection;
    moments.push({
      id: `m-${turn.id}`,
      kind: asQuestion ? "frage" : "einwand",
      kindLabel: asQuestion ? "Direkte Frage" : "Einwand",
      turnId: turn.id,
      quote: turn.text,
      replyTurnId: replyTurn?.id ?? null,
      reply,
      reason: problems[0],
      skillId,
      skillLabel: SKILL_LABEL[skillId],
      suggestedLine: asQuestion ? lineForQuestion(turn.text) : suggestNextLine(context, skillId),
      weight,
    });
  });

  // Offenes Ende: letzter eigener Zug ohne Verbindlichkeit
  const lastTrainee = [...spoken].reverse().find((t) => t.speaker === "trainee");
  const lastCounterpart = [...spoken].reverse().find((t) => t.speaker === "counterpart");
  if (lastTrainee && lastCounterpart && spoken.length >= 4 && !COMMITMENT.test(lastTrainee.text)) {
    const analytics = analyzeCall(turns);
    const b4 = analytics.skills.find((skill) => skill.id === "B4");
    const existing = moments.find((m) => m.turnId === lastCounterpart.id);
    if (b4?.state !== "sichtbar" && existing) {
      // Dieselbe Stelle nicht doppelt zeigen: der Einwand war zugleich das Ende
      existing.kindLabel = `${existing.kindLabel} · Offenes Ende`;
      existing.reason = `${existing.reason} Und das Gespräch endete hier ohne Termin, Aufgabe oder klares Nein.`;
      existing.weight += 1;
    } else if (b4?.state !== "sichtbar") {
      moments.push({
        id: `m-end-${lastCounterpart.id}`,
        kind: "abschluss",
        kindLabel: "Offenes Ende",
        turnId: lastCounterpart.id,
        quote: lastCounterpart.text,
        replyTurnId: lastTrainee.id,
        reply: lastTrainee.text,
        reason: "Das Gespräch endete ohne Termin, Aufgabe oder klares Nein.",
        skillId: "B4",
        skillLabel: SKILL_LABEL.B4,
        suggestedLine: suggestNextLine(spoken, "B4"),
        weight: 2,
      });
    }
  }

  return moments.sort((a, b) => b.weight - a.weight).slice(0, 5);
}
