/**
 * Produktnahe Drill-Labels für Katalog und Briefing.
 * Keine Engine-Logik — nur ehrliche Trainings-Signale für den Nutzer.
 */

export type CallKind = "cold" | "warm" | "inbound";

export type DrillHonesty = {
  callKind: CallKind;
  callLabel: string;
  honesty: string;
  /** Kurz: was der Trainee übt, nicht Feature-Liste */
  practiceFocus: string;
};

const FROZEN: Record<string, DrillHonesty> = {
  S01: {
    callKind: "warm",
    callLabel: "Bestand / Vergleich",
    honesty: "Bleibt im Gespräch, solange Sie konkret und belegbar bleiben.",
    practiceFocus: "Leistungsumfang klären, bevor Sie den Preis verteidigen.",
  },
  S02: {
    callKind: "cold",
    callLabel: "Kaltakquise",
    honesty: "Legt schnell auf — nach klarem Nein oder Verkaufsdruck ohne Grund.",
    practiceFocus: "Absage respektieren und sauber beenden.",
  },
  S03: {
    callKind: "warm",
    callLabel: "Bestand / Vollmacht",
    honesty: "Interesse einer Person ist noch kein Auftrag.",
    practiceFocus: "Wer mitentscheidet, bevor Sie drängen.",
  },
  S04: {
    callKind: "cold",
    callLabel: "Kaltakquise",
    honesty: "Legt nach einer Floskel oder einem Firmenmonolog auf.",
    practiceFocus: "Einen konkreten Anlass nennen, bevor die Verwaltung auflegt.",
  },
  S05: {
    callKind: "warm",
    callLabel: "Bestand / Mehrheit",
    honesty: "Ein Ja am Apparat ist keine Mehrheit der Eigentümergemeinschaft.",
    practiceFocus: "Die fehlende Mehrheit klären, bevor Sie einen Auftrag andenken.",
  },
  S06: {
    callKind: "inbound",
    callLabel: "Eingehend",
    honesty: "Will eine Antwort auf die Mietfrage — keine Rechtszusage und keinen Hausverkauf.",
    practiceFocus: "Die Mietfrage aufnehmen, ohne eine Rechtszusage zu geben.",
  },
  S07: {
    callKind: "warm",
    callLabel: "Abschlussnähe",
    honesty: "Das Ja steht im Raum; die letzte Sorge vor der Vollmacht auch.",
    practiceFocus: "Die letzte Sorge klären, bevor Sie die Vollmacht verlangen.",
  },
  S08: {
    callKind: "warm",
    callLabel: "Bestand / Empfehlung",
    honesty: "Empfiehlt weiter, verkauft selbst nichts.",
    practiceFocus: "Die Empfehlung annehmen, ohne einen Neuverkauf aufzumachen.",
  },
};

const PACK_HINTS: Record<string, Partial<DrillHonesty> & { callKind: CallKind }> = {
  A01: {
    callKind: "warm",
    callLabel: "Bestand",
    honesty: "Entwurf — noch kein freigegebener Drill.",
    practiceFocus: "Lage und Anlass, bevor Leistung kommt.",
  },
  V01: {
    callKind: "warm",
    callLabel: "Bestand",
    honesty: "Partnerfall — Ton und Fachsprache der Branche.",
    practiceFocus: "Eine Sache klären, nicht alles verkaufen.",
  },
  V02: {
    callKind: "warm",
    callLabel: "Wechsel",
    honesty: "Wechselmotive sind heikel — kein Druck.",
    practiceFocus: "Grund und Timing erfragen.",
  },
  F01: {
    callKind: "warm",
    callLabel: "Abschlussnähe",
    honesty: "Unterschrift braucht Klarheit, nicht Tempo.",
    practiceFocus: "Offene Punkte vor dem Ja.",
  },
  F02: {
    callKind: "warm",
    callLabel: "Bestand",
    honesty: "Bestandskunde — Vertrauen nicht verspielen.",
    practiceFocus: "Anlass nennen, Ausstieg lassen.",
  },
};

function labelFor(kind: CallKind): string {
  if (kind === "cold") return "Kaltakquise";
  if (kind === "inbound") return "Eingehend";
  return "Bestand";
}

/** Katalog-/Briefing-Metadaten für ein Szenario. Unbekannte IDs: ehrlicher Fallback. */
export function drillHonesty(scenarioId: string, draft?: boolean): DrillHonesty {
  const frozen = FROZEN[scenarioId];
  if (frozen) return frozen;

  const pack = PACK_HINTS[scenarioId];
  if (pack) {
    return {
      callKind: pack.callKind,
      callLabel: pack.callLabel ?? labelFor(pack.callKind),
      honesty: pack.honesty ?? (draft ? "Entwurf — noch nicht als Drill freigegeben." : "Üben Sie eine Sache."),
      practiceFocus: pack.practiceFocus ?? "Eine Sache klären, dann auflegen und auswerten.",
    };
  }

  return {
    callKind: "warm",
    callLabel: draft ? "Entwurf" : "Fall",
    honesty: draft
      ? "Entwurf — noch nicht als Drill freigegeben."
      : "Kein freigegebener Pack-Drill — Briefing lesen, dann sprechen.",
    practiceFocus: "Eine Sache klären, dann auflegen und auswerten.",
  };
}

export function isColdDrill(scenarioId: string): boolean {
  return drillHonesty(scenarioId).callKind === "cold";
}

export type TrainingBeat = {
  title: string;
  action: string;
  why: string;
};

function normalizeCopy(text: string): string {
  return text
    .toLowerCase()
    .replace(/[—–−]/g, "-")
    .replace(/[^\wäöüß-]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function capSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^[\s]*([a-zäöü])/, (match) => match.toUpperCase());
}

function stripEndPunct(text: string): string {
  return text.trim().replace(/[.,;:]+$/, "");
}

/** Titel und Satz aus vorhandenem Pack-Text — nichts erfinden. */
export function splitTitleSentence(text: string): { title: string; sentence: string } {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return { title: "", sentence: "" };
  const dash = trimmed.match(/^(.{8,56}?)\s+[—–-]\s+(.+)$/);
  if (dash?.[1] && dash[2]) {
    return { title: stripEndPunct(dash[1]), sentence: capSentence(dash[2]) };
  }
  const comma = trimmed.match(/^(.{8,56}?), (.+)$/);
  if (comma?.[1] && comma[2]) {
    return { title: stripEndPunct(comma[1]), sentence: capSentence(comma[2]) };
  }
  const period = trimmed.match(/^(.{8,56}?)\. (.+)$/);
  if (period?.[1] && period[2]) {
    return { title: stripEndPunct(period[1]), sentence: capSentence(period[2]) };
  }
  const words = trimmed.split(" ");
  if (words.length > 5) {
    return {
      title: stripEndPunct(words.slice(0, 4).join(" ")),
      sentence: capSentence(words.slice(4).join(" ")),
    };
  }
  return { title: stripEndPunct(trimmed), sentence: trimmed };
}

function tooSimilar(a: string, b: string): boolean {
  const left = normalizeCopy(a);
  const right = normalizeCopy(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

function distinctWhy(action: string, candidate: string): string {
  const why = candidate.trim();
  if (!why) return "";
  if (tooSimilar(action, why)) return "";
  return why;
}

/**
 * Ein Drill, ein Fokus, in drei Beats. Quellen: practiceFocus, honesty, Fokus-Hint, Blurb.
 * Keine Rubrik-Dimensionen, keine 70/30, keine erfundenen Kompetenzen.
 */
export function trainingBeats(input: {
  practiceFocus: string;
  honesty: string;
  focusHint?: string;
  focusNext?: string;
  blurb?: string;
}): TrainingBeat[] {
  const leads = [input.practiceFocus, input.honesty, input.focusHint, input.blurb, input.focusNext];
  const whys = [input.honesty, input.blurb, input.focusNext, input.focusHint, input.practiceFocus];
  const beats: TrainingBeat[] = [];
  for (let i = 0; i < leads.length && beats.length < 3; i += 1) {
    const lead = leads[i]?.trim() ?? "";
    if (!lead) continue;
    if (beats.some((beat) => tooSimilar(beat.action, lead) || tooSimilar(beat.title, lead))) continue;
    const { title, sentence } = splitTitleSentence(lead);
    if (!title || !sentence) continue;
    const why = distinctWhy(sentence, whys[i] ?? "");
    beats.push({ title, action: sentence, why });
  }
  return beats;
}

/** Eine Challenge-Zeile für den zugeklappten Kartenzustand. */
export function drillChallenge(honesty: DrillHonesty, blurb?: string): string {
  const line = (blurb?.trim() || honesty.honesty).trim();
  return line;
}
