import type { Evaluation, TranscriptTurn } from "@/src/role-engine/types";

export type DebriefMoment = {
  turnId: string | null;
  quote: string;
  isTrainee: boolean;
  whatHappened: string;
  counterfactual: string;
  clickable: boolean;
};

export type DebriefJumpTarget = {
  scrollIntoView: (arg?: ScrollIntoViewOptions) => void;
  focus: (arg?: { preventScroll?: boolean }) => void;
};

/** Stabile, HTML-sichere Anker-ID. UUID-Bindestriche bleiben. */
export function debriefTurnDomId(turnId: string): string {
  const safe = turnId.replace(/[^A-Za-z0-9_-]/g, "");
  return `turn-${safe || "unknown"}`;
}

export function debriefScoreLabel(score: number | null | undefined): string {
  return score == null ? "N/A" : `${score} / 4`;
}

/** Kalibrierung sagt explizit: keine Note. Fehlendes calibration-Feld ist nicht automatisch N/A. */
export function isNotAssessable(evaluation: Pick<Evaluation, "calibration"> | null | undefined): boolean {
  return evaluation?.calibration?.maxScore === null;
}

export function resolveDebriefMoment(
  turns: TranscriptTurn[],
  evaluation: Pick<Evaluation, "keyMoment" | "importantMomentTurnId"> | null | undefined,
): DebriefMoment {
  const spoken = turns.filter((turn) => turn.speaker !== "system");
  const keyMoment = evaluation?.keyMoment ?? null;
  const preferredId = keyMoment?.turnId ?? evaluation?.importantMomentTurnId ?? null;
  const momentTurn = preferredId ? spoken.find((turn) => turn.id === preferredId) : undefined;
  const quote = (keyMoment?.quote || momentTurn?.text || "").trim();
  return {
    turnId: momentTurn?.id ?? null,
    quote,
    isTrainee: momentTurn ? momentTurn.speaker === "trainee" : Boolean(keyMoment),
    whatHappened: keyMoment?.whatHappened?.trim() ?? "",
    counterfactual: keyMoment?.counterfactual?.trim() ?? "",
    clickable: Boolean(momentTurn),
  };
}

export function jumpToDebriefTurn(
  turnId: string,
  host: {
    getElementById: (id: string) => DebriefJumpTarget | null;
    replaceHash?: (hash: string) => void;
  },
): boolean {
  const id = debriefTurnDomId(turnId);
  const el = host.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
  host.replaceHash?.(`#${id}`);
  return true;
}
