export const PRACTICE_LANES = ["offen", "denselben_moment", "ausgewertet", "ruhend"] as const;

export type PracticeLane = (typeof PRACTICE_LANES)[number];

export const PRACTICE_LANE_LABEL: Record<PracticeLane, string> = {
  offen: "Offen",
  denselben_moment: "Denselben Moment",
  ausgewertet: "Ausgewertet",
  ruhend: "Ruhend",
};

export const PRACTICE_LANE_HINT: Record<PracticeLane, string> = {
  offen: "Zurück ins Gespräch.",
  denselben_moment: "Dieselbe Stelle, nicht ein neues Szenario.",
  ausgewertet: "Auswertung öffnen.",
  ruhend: "Kein nächster Übungsschritt.",
};

export type PracticePipelineInput = {
  id: string;
  status: string;
  mode: string;
  parentSessionId: string | null;
  counterpartName: string;
  focusLabel: string;
  scenarioTitle: string;
  createdAt: string;
  evaluation: {
    nextStep?: string | null;
    correction?: string | null;
    repeatPrompt?: string | null;
    calibration?: { maxScore: number | null } | null;
  } | null;
  practiceCue?: { lever?: string; nextStep?: string } | null;
};

export type PracticePipelineCard = {
  lane: PracticeLane;
  laneLabel: string;
  rootId: string;
  sessionIds: string[];
  attemptCount: number;
  counterpartName: string;
  focusLabel: string;
  scenarioTitle: string;
  hebel: string;
  href: string;
  latestId: string;
  latestCreatedAt: string;
};

const THEATER = /win[- ]rate|forecast|abschlussquote|pipeline-euro|\bramp\b/i;

export function practiceFamilyRootId(
  session: Pick<PracticePipelineInput, "id" | "parentSessionId">,
  byId: Map<string, Pick<PracticePipelineInput, "id" | "parentSessionId">>,
): string {
  const seen = new Set<string>();
  let current: Pick<PracticePipelineInput, "id" | "parentSessionId"> = session;
  while (current.parentSessionId && !seen.has(current.id)) {
    seen.add(current.id);
    const parent = byId.get(current.parentSessionId);
    if (!parent) return current.parentSessionId;
    current = parent;
  }
  return current.id;
}

export function isRepeatFamily(members: Pick<PracticePipelineInput, "mode" | "parentSessionId">[]): boolean {
  return members.length >= 2 || members.some((row) => row.mode === "repeat" || Boolean(row.parentSessionId));
}

function latestSession<T extends { createdAt: string; id: string }>(members: T[]): T {
  return members.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))[0];
}

function hasNextPracticeAction(evaluation: PracticePipelineInput["evaluation"]): boolean {
  if (!evaluation) return false;
  return Boolean(evaluation.nextStep?.trim() || evaluation.repeatPrompt?.trim());
}

function isParked(evaluation: PracticePipelineInput["evaluation"]): boolean {
  if (!evaluation) return false;
  const notAssessable = evaluation.calibration?.maxScore === null;
  return notAssessable && !hasNextPracticeAction(evaluation);
}

export function practiceLane(members: PracticePipelineInput[]): PracticeLane {
  const tip = latestSession(members);
  const family = isRepeatFamily(members);
  if (tip.status !== "ended") return family ? "denselben_moment" : "offen";
  if (family) return "denselben_moment";
  if (isParked(tip.evaluation)) return "ruhend";
  return "ausgewertet";
}

export function practiceHref(session: Pick<PracticePipelineInput, "id" | "status">): string {
  return session.status === "ended" ? `/sitzung/${session.id}/auswertung` : `/sitzung/${session.id}`;
}

export function hebelSentence(members: PracticePipelineInput[]): string {
  const tip = latestSession(members);
  const newestFirst = members.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  const candidates = [
    tip.evaluation?.nextStep,
    tip.practiceCue?.nextStep,
    ...newestFirst.flatMap((row) => [row.evaluation?.nextStep, row.practiceCue?.nextStep]),
    tip.evaluation?.correction,
    ...newestFirst.map((row) => row.evaluation?.correction),
  ];
  for (const raw of candidates) {
    const text = raw?.replace(/\s+/g, " ").trim();
    if (text && !THEATER.test(text)) return text;
  }
  if (tip.evaluation?.calibration?.maxScore === null) {
    return "Kein bewertbarer eigener Beitrag — keine Noten.";
  }
  if (tip.status === "ended" && !tip.evaluation) {
    return "Das Gespräch ist beendet, die Auswertung liegt noch nicht vor.";
  }
  if (tip.status !== "ended") {
    return isRepeatFamily(members) ? "Denselben Moment liegt noch in der Leitung." : "Zurück ins Gespräch.";
  }
  return "Auswertung öffnen.";
}

export function buildPracticePipeline(sessions: PracticePipelineInput[]): PracticePipelineCard[] {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const families = new Map<string, PracticePipelineInput[]>();
  for (const session of sessions) {
    const rootId = practiceFamilyRootId(session, byId);
    const bucket = families.get(rootId) ?? [];
    bucket.push(session);
    families.set(rootId, bucket);
  }

  const cards = [...families.entries()].map(([rootId, members]) => {
    const tip = latestSession(members);
    const lane = practiceLane(members);
    return {
      lane,
      laneLabel: PRACTICE_LANE_LABEL[lane],
      rootId,
      sessionIds: members.map((row) => row.id),
      attemptCount: members.length,
      counterpartName: tip.counterpartName,
      focusLabel: tip.focusLabel,
      scenarioTitle: tip.scenarioTitle,
      hebel: hebelSentence(members),
      href: practiceHref(tip),
      latestId: tip.id,
      latestCreatedAt: tip.createdAt,
    };
  });

  const laneRank = new Map(PRACTICE_LANES.map((lane, index) => [lane, index]));
  return cards.sort((a, b) => {
    const laneDelta = (laneRank.get(a.lane) ?? 0) - (laneRank.get(b.lane) ?? 0);
    if (laneDelta !== 0) return laneDelta;
    return b.latestCreatedAt.localeCompare(a.latestCreatedAt) || b.latestId.localeCompare(a.latestId);
  });
}
