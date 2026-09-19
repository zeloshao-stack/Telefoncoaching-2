export type SpeakerGuess = "trainee" | "counterpart" | "unknown";

export type CallSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  suggested: SpeakerGuess;
};

const BROKER =
  /mein name ist|ich rufe|makler|honorar|besichtigung|angebot|dürfte ich|zwei minuten|manzl|qualifizier|käufer/i;
const OWNER =
  /gehört mir|mein haus|kein interesse|nicht verkaufen|warum rufen|lassen sie mich|keine zeit|mit meiner schwester|die fassade/i;

export function suggestSpeaker(text: string): SpeakerGuess {
  const broker = BROKER.test(text);
  const owner = OWNER.test(text);
  if (broker && !owner) return "trainee";
  if (owner && !broker) return "counterpart";
  return "unknown";
}

export type ParsedTurn = { id: string; speaker: "trainee" | "counterpart"; text: string };

const ME = /^(ich|me|makler(in)?|berater(in)?|verkäufer(in)?|agent|vertrieb|mitarbeiter(in)?|coachee|trainee|a)$/i;
const THEM =
  /^(kunde|kundin|gegenseite|eigentümer(in)?|interessent(in)?|anrufer(in)?|partner(in)?|mandant(in)?|b|sie|er|gesprächspartner(in)?)$/i;

/**
 * Textfallback: ein eingefügtes Transkript in Züge zerlegen.
 * Erkennt Zeilen wie „Ich: …“, „Kunde: …“, „Frau Sommer: …“, „[00:12] Berater: …“.
 * Ohne Sprechermarken wird satzweise geraten, sonst abgewechselt.
 */
export function parseTranscriptText(raw: string, counterpartName = ""): ParsedTurn[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?\s*[-–]?\s*/, "").trim())
    .filter(Boolean);
  const turns: ParsedTurn[] = [];
  const nameKey = counterpartName.trim().toLowerCase();
  let sawLabel = false;

  const push = (speaker: ParsedTurn["speaker"], text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return;
    const last = turns[turns.length - 1];
    if (last && last.speaker === speaker) {
      last.text = `${last.text} ${clean}`;
      return;
    }
    turns.push({ id: `r${turns.length + 1}`, speaker, text: clean });
  };

  for (const line of lines) {
    const match = line.match(/^([^:：]{1,40})[:：]\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const labelKey = label.toLowerCase();
      if (ME.test(label)) {
        sawLabel = true;
        push("trainee", match[2]);
        continue;
      }
      if (THEM.test(label) || (nameKey && labelKey.includes(nameKey)) || /^(herr|frau)\s/i.test(label)) {
        sawLabel = true;
        push("counterpart", match[2]);
        continue;
      }
      if (sawLabel) {
        // unbekanntes Label nach bekannten: alles, was nicht „ich“ ist, ist die Gegenseite
        push("counterpart", match[2]);
        continue;
      }
    }
    if (sawLabel) {
      const last = turns[turns.length - 1];
      if (last) last.text = `${last.text} ${line}`;
      continue;
    }
    const guess = suggestSpeaker(line);
    if (guess !== "unknown") {
      push(guess, line);
    } else {
      const last = turns[turns.length - 1];
      push(last?.speaker === "trainee" ? "counterpart" : "trainee", line);
    }
  }
  return turns;
}

export function mergeWhisperSegments(
  raw: { start?: number; end?: number; text?: string }[],
): CallSegment[] {
  return raw
    .map((row, index) => {
      const text = (row.text || "").replace(/\s+/g, " ").trim();
      const start = Number(row.start ?? 0);
      const end = Number(row.end ?? start);
      if (!text || end <= start) return null;
      return {
        id: `seg-${index}`,
        start,
        end,
        text,
        suggested: suggestSpeaker(text),
      };
    })
    .filter((row): row is CallSegment => Boolean(row));
}

export function counterpartDuration(segments: { start: number; end: number }[]) {
  return segments.reduce((sum, row) => sum + Math.max(0, row.end - row.start), 0);
}
