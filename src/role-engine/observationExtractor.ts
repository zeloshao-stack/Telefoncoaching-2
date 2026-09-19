import type { Observation, ObservationType, RoleCharacter, TranscriptTurn } from "./types";
import { detectUnverifiableClaim } from "./unverifiableClaims";

function has(text: string, re: RegExp) {
  return re.test(text);
}

const OVERLAP_STOP = new Set(["warum", "wie", "was", "bitte", "nein", "guten", "tag"]);

/** Inhaltswörter der letzten Gegenseite: ≥5 Buchstaben oder Zahl, ohne Stoppwörter. */
function contentTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !OVERLAP_STOP.has(w) && (w.length >= 5 || /^\d+$/.test(w)));
}

function hasContentOverlap(traineeLower: string, counterpartText: string): boolean {
  const priorTokens = contentTokens(counterpartText);
  if (!priorTokens.length) return false;
  const now = new Set(contentTokens(traineeLower));
  return priorTokens.some((w) => now.has(w));
}

export function extractObservations(
  character: RoleCharacter,
  traineeTurn: TranscriptTurn,
  prior: TranscriptTurn[],
  opts?: { interrupted?: boolean },
): Observation[] {
  const text = traineeTurn.text.trim();
  const lower = text.toLowerCase();
  const lastCounterpart = [...prior].reverse().find((t) => t.speaker === "counterpart");
  const found: Observation[] = [];

  const push = (type: ObservationType, confidence: Observation["confidence"] = "high") => {
    if (!found.some((o) => o.type === type)) {
      found.push({ type, turnId: traineeTurn.id, evidence: text, confidence });
    }
  };

  if (opts?.interrupted) push("interrupted_character");

  if (has(lower, /\b(ich bin|mein name|heiße|makler)\b/)) push("introduced_self", "medium");
  if (
    has(lower, /\?/) &&
    /(leistung|umfang|angebot|schwester|entscheid|vollmacht|bindungs|bindung|vergleich|worin|welche|wie geht|fühlen|verkaufen|gesprochen|makler|verfassung|gesundheit|treppe|müde|wollen sie|partner|bedarf|prämie|deckung|kündig|tragbar|einkommen|unterschrift|rate|lasten|schaden|wechseln|sondertilgung|beirat|eigentümername|namensliste|mehrheit|versammlung|sonderumlage|blockiert|anwalt|nachbarin|erlaubnis|\bwer\b)/.test(
      lower,
    )
  ) {
    push("asked_specific_question");
  } else if (text.includes("?")) {
    push("asked_generic_question", "medium");
  }

  if (has(lower, /\b(verstanden|respektier|zur kenntnis|auf wiederhören|nicht mehr anrufen|vermerke)\b/)) {
    push("acknowledged_concern");
  }

  if (character.scenarioId === "S02") {
    if (has(lower, /\b(verstanden|vermerke|auf wiederhören|keine weiteren|nicht mehr)\b/) && !has(lower, /\b(zwei minuten|anbieten|zurückrufen|in sechs)\b/)) {
      push("respected_no");
    }
    if (has(lower, /\b(zwei minuten|anbieten kann|hören, was|einfach in sechs|wieder anrufen)\b/)) {
      push("ignored_boundary");
      push("continued_after_final_no");
      push("created_pressure", "medium");
    }
  }

  if (character.scenarioId === "S04") {
    const emptyWarmth =
      /ich verstehe( ihre bedenken)?|was darf ich für sie tun|wie kann ich ihnen helfen|darf ich mich (kurz )?vorstellen/;
    const firmShow =
      /wir sind (eine |der |die )?(führend|spezialisiert|marktführer)|wir vermarkten|unsere (kanzlei|erfolge)|hunderte zinshäuser|seit \d+ jahren/;
    const hasOccasion = /weil|ich rufe an|es geht um|nachbar|ihr haus|konkret|in einem satz/;
    if ((emptyWarmth.test(lower) || firmShow.test(lower)) && !hasOccasion.test(lower)) {
      push("ignored_boundary");
      push("created_pressure", "medium");
      push("generic_pitch", "medium");
    }
  }

  if (character.scenarioId === "S05") {
    if (
      has(
        lower,
        /\b(dann haben wir den auftrag|ich schicke ihnen die vollmacht|ich schick ihnen die vollmacht|sie können das allein|die anderen ziehen mit|mehrheit haben wir|beschluss haben wir|ich setz(e|t)? das für|auftrag da)\b/,
      )
    ) {
      push("ignored_boundary");
      push("created_pressure", "medium");
      push("premature_close", "medium");
    }
  }

  if (character.scenarioId === "S06") {
    if (
      has(
        lower,
        /\b(sie können (ihm )?(einfach |ruhig |sicher )?kündigen|kündigen sie (ihn|ihm)|kündigung (ist |geht )?(sicher|wirksam|kein problem|kein thema)|völlig unproblematisch|geht locker|das erlaubt das mietrecht|rechtlich ist das klar|als anwalt sage)\b/,
      )
    ) {
      push("ignored_boundary");
      push("created_pressure", "medium");
      push("made_false_or_unverifiable_claim", "medium");
    }
    if (
      has(lower, /\b(wollen sie das haus verkaufen|was ist das haus wert|käufer fürs haus|bringen wir das (haus|objekt) auf den markt|ich hätte käufer)\b/)
    ) {
      push("ignored_boundary");
      push("created_pressure");
    }
  }

  if (character.scenarioId === "S07") {
    if (
      has(
        lower,
        /\b(das ist (doch )?kein problem|da müssen sie sich keine sorgen|das bindet sie|binden tut sie|unterschreiben sie (einfach|jetzt)|machen wir die vollmacht|das regeln wir später)\b/,
      ) ||
      (/haha|lacht/.test(lower) && /vollmacht|bindung|fest/.test(lower))
    ) {
      push("ignored_boundary");
      push("created_pressure", "medium");
    }
  }

  if (character.scenarioId === "S08") {
    if (
      has(
        lower,
        /\b(noch ein objekt|verkaufen sie (noch|wieder|auch)|ihr nächstes haus|noch etwas verkaufen|auch (noch )?verkaufen|ich geh(e)? (einfach )?rüber|ich ruf(e)? die nachbarin|adresse der nachbar)\b/,
      )
    ) {
      push("ignored_boundary");
      push("created_pressure", "medium");
    }
  }

  if (has(lower, /\b(36\.?000|auch um)\b/) && character.scenarioId === "S01") {
    push("premature_concession");
  }

  const claimKind = detectUnverifiableClaim(lower);
  if (claimKind === "invented_fact" || claimKind === "superlative_or_market" || claimKind === "marketing_hype") {
    push("made_false_or_unverifiable_claim");
    push("unsupported_claim");
  } else if (claimKind === "pressure_scarcity") {
    push("unsupported_claim");
    push("created_pressure", "medium");
  }

  if (has(lower, /\b(auftrag\.|haben den auftrag|schicke ihnen die bestätigung|dann ist das fix|wir schließen ab|police ist durch|kredit ist durch)\b/)) {
    push("premature_close");
  }

  if (
    text.includes("?") &&
    /(schwester|beide|gemeinsam|entscheid|vollmacht|was müsste|partner|unterschreib|wer muss mit|am vertrag|wer zeichnet)/.test(lower)
  ) {
    push("clarified_decision_authority");
  }

  if (has(lower, /\b(kontrolle behalten|sich durchsetzen|offenbar)\b/)) {
    push("unsupported_claim");
  }

  if (lastCounterpart && hasContentOverlap(lower, lastCounterpart.text)) {
    push("referenced_previous_statement");
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount > 40 && !text.includes("?")) push("generic_pitch", "medium");

  if (lastCounterpart?.text.includes("?") && !text.includes("?") && wordCount > 3) {
    push("answered_direct_question", "medium");
  }

  return found;
}
