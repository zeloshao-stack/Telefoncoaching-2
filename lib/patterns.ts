import type { TranscriptTurn } from "@/src/role-engine/types";
import { analyzeCall, type AnalyzedSkill } from "@/lib/call-analytics";
import { findMoments, type MomentKind } from "@/lib/moments";

export type PatternInput = {
  id: string;
  title: string;
  kind: "echt" | "uebung";
  turns: TranscriptTurn[];
};

export type ObjectionFamily = {
  id: string;
  label: string;
  count: number;
  calls: string[];
  example: string;
};

export type RecurringGap = {
  id: AnalyzedSkill["id"];
  label: string;
  luecke: number;
  gelegenheit: number;
  calls: string[];
};

export type CallPatterns = {
  calls: number;
  echt: number;
  gaps: RecurringGap[];
  objections: ObjectionFamily[];
  momentKinds: { kind: MomentKind; label: string; count: number }[];
  /** Ein Satz, was sich durch die Gespräche zieht */
  reading: string;
};

const FAMILIES: { id: string; label: string; test: RegExp }[] = [
  { id: "preis", label: "Preis / Kosten", test: /zu teuer|zu hoch|euro|kosten|prämie|honorar|provision|rate/i },
  { id: "zeit", label: "Keine Zeit / später", test: /keine zeit|nicht jetzt|später|rufen sie .*an|melde mich|überleg/i },
  { id: "bestand", label: "Schon versorgt", test: /schon einen|schon eine|haben schon|bereits|bestehend/i },
  { id: "dritte", label: "Muss jemand mitentscheiden", test: /meine frau|mein mann|partner|schwester|bruder|besprechen|gemeinsam/i },
  { id: "nein", label: "Klares Nein", test: /kein interesse|nicht verkaufen|kein bedarf|brauche ich nicht|keine anrufe/i },
  { id: "misstrauen", label: "Woher / Warum", test: /woher haben sie|warum rufen|wer sind sie|wie kommen sie/i },
];

const KIND_LABEL: Record<MomentKind, string> = {
  einwand: "Einwand nicht aufgenommen",
  frage: "Frage unbeantwortet",
  abschluss: "Offenes Ende",
};

/**
 * Was sich über Gespräche wiederholt: dieselbe Lücke, derselbe Einwand.
 * Zählt Gespräche, nicht Wörter. Kein Score, keine Rangliste.
 */
export function recurringPatterns(inputs: PatternInput[]): CallPatterns {
  const gapMap = new Map<AnalyzedSkill["id"], RecurringGap>();
  const familyMap = new Map<string, ObjectionFamily>();
  const kindMap = new Map<MomentKind, number>();

  for (const input of inputs) {
    const analytics = analyzeCall(input.turns);
    for (const skill of analytics.skills) {
      const row = gapMap.get(skill.id) ?? { id: skill.id, label: skill.label, luecke: 0, gelegenheit: 0, calls: [] };
      if (skill.state !== "keine_gelegenheit") row.gelegenheit += 1;
      if (skill.state === "luecke") {
        row.luecke += 1;
        row.calls.push(input.id);
      }
      gapMap.set(skill.id, row);
    }
    const seenFamilies = new Set<string>();
    for (const turn of input.turns) {
      if (turn.speaker !== "counterpart") continue;
      for (const family of FAMILIES) {
        if (seenFamilies.has(family.id) || !family.test.test(turn.text)) continue;
        seenFamilies.add(family.id);
        const row = familyMap.get(family.id) ?? { id: family.id, label: family.label, count: 0, calls: [], example: turn.text };
        row.count += 1;
        row.calls.push(input.id);
        familyMap.set(family.id, row);
      }
    }
    for (const moment of findMoments(input.turns)) {
      kindMap.set(moment.kind, (kindMap.get(moment.kind) ?? 0) + 1);
    }
  }

  const gaps = [...gapMap.values()].sort((a, b) => b.luecke - a.luecke);
  const objections = [...familyMap.values()].sort((a, b) => b.count - a.count);
  const momentKinds = [...kindMap.entries()]
    .map(([kind, count]) => ({ kind, label: KIND_LABEL[kind], count }))
    .sort((a, b) => b.count - a.count);

  const topGap = gaps.find((gap) => gap.luecke >= 2 && gap.luecke * 2 >= gap.gelegenheit);
  const topObjection = objections[0];
  let reading = "Noch zu wenig Gespräche für ein Muster. Ab drei wird es belastbar.";
  if (inputs.length >= 2 && topGap) {
    reading = `${topGap.label} fehlt in ${topGap.luecke} von ${topGap.gelegenheit} Gesprächen mit Gelegenheit`;
    if (topObjection && topObjection.count >= 2) reading += ` — meist rund um „${topObjection.label}“`;
    reading += ".";
  } else if (inputs.length >= 2 && topObjection && topObjection.count >= 2) {
    reading = `„${topObjection.label}“ kommt in ${topObjection.count} von ${inputs.length} Gesprächen. Das ist die Stelle zum Üben.`;
  } else if (inputs.length >= 3) {
    reading = "Keine wiederkehrende Lücke. Die Momente unten zeigen, wo einzelne Gespräche kippten.";
  }

  return {
    calls: inputs.length,
    echt: inputs.filter((input) => input.kind === "echt").length,
    gaps,
    objections,
    momentKinds,
    reading,
  };
}
