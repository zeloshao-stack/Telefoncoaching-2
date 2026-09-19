import { hydrateAffect } from "@/src/role-engine/affect";
import { buildPersonaInstructions } from "@/src/role-engine/persona-prompt";
import { pickRealtimeVoice } from "@/src/role-engine/voice";
import type { CharacterState, HangupReason, HiddenFact, Observation, RoleCharacter } from "@/src/role-engine/types";
import { LIVE_VAD_PREFIX_MS, LIVE_VAD_SILENCE_MS } from "@/lib/live-text";
import { PLAYER_WORLD_LOCK } from "@/src/role-engine/playerWorldGate";

/** Gründe, die das Werkzeug end_call annimmt — deckungsgleich mit HangupReason. */
export const END_CALL_REASONS: readonly HangupReason[] = [
  "final_no",
  "boundary_ignored",
  "character_choice",
  "time_exhausted",
  "abuse",
  "no_reason_to_continue",
];

export function isHangupReason(value: unknown): value is HangupReason {
  return typeof value === "string" && (END_CALL_REASONS as readonly string[]).includes(value);
}

export function openaiRealtimeKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export function hasRealtimeKey() {
  return Boolean(openaiRealtimeKey());
}

/** Stimme deterministisch aus der Figur (Geschlecht × Alter × Temperament, Override gewinnt). */
export function realtimeVoiceFor(character: RoleCharacter) {
  return pickRealtimeVoice(character);
}

/** Realtime-Verlauf im Prompt kurz halten — das Modell hat den Audio-Kontext selbst. */
const REALTIME_HISTORY_TURNS = 8;
const REALTIME_HISTORY_LINE_CHARS = 110;

/**
 * Sprech-Instructions der Figur für die Live-Leitung. Die Eröffnung steht bewusst nicht
 * drin — sie läuft über response.create (siehe liveGreetingInstructions).
 */
export function realtimeInstructions(
  character: RoleCharacter,
  hiddenFacts: HiddenFact[],
  state: CharacterState,
  prior: Array<{ speaker: string; text: string }> = [],
  opts: { observations?: Observation[]; historyTurns?: number } = {},
): string {
  const persona = buildPersonaInstructions(character, hiddenFacts, state, {
    mode: "realtime",
    prior,
    observations: opts.observations,
    omitOpening: true,
    historyTurns: opts.historyTurns ?? REALTIME_HISTORY_TURNS,
    historyLineChars: REALTIME_HISTORY_LINE_CHARS,
  });
  return `${persona}\nFehlt dir zur Frage persönliches Faktenwissen, nutze vor der Antwort recall_memory. Nur bei Bedarf. Ergebnis ist Wissen, keine Auskunftspflicht. Ohne Ergebnis nichts erfinden.`;
}

/** Volles Realtime (Chat Completions-Analog zu ChatGPT Voice). Mini nur per REALTIME_MODEL. Astra hat kein API-Audio. */
export const REALTIME_DEFAULT_MODEL = "gpt-realtime-2.1";
export const REALTIME_FALLBACK_MODEL = "gpt-realtime";

export function realtimeModel() {
  return process.env.REALTIME_MODEL?.trim() || REALTIME_DEFAULT_MODEL;
}

export function realtimeTurnDetection(vad = process.env.REALTIME_VAD?.trim()) {
  if (vad === "semantic") {
    return {
      type: "semantic_vad" as const,
      eagerness: "high" as const,
      create_response: true,
      interrupt_response: false,
    };
  }
  return {
    type: "server_vad" as const,
    threshold: 0.65,
    prefix_padding_ms: LIVE_VAD_PREFIX_MS,
    silence_duration_ms: LIVE_VAD_SILENCE_MS,
    create_response: true,
    // Client ist Stufe-B-Owner (CHG-009 / 008-H1 / 014-S4): Server darf bei speech_started nicht canceln.
    // Cap ohne Wort ist Client-release_A, nicht Server-Interrupt. Prefix nicht auf semantic-high.
    // create_response bleibt true — silence_intent-Feld existiert nicht, Prefix nicht umlegen.
    interrupt_response: false,
    idle_timeout_ms: 9000,
  };
}

export function realtimeTranscriptionPrompt(character: RoleCharacter) {
  return `Telefongespräch auf Deutsch (Österreich), Immobilien und Vertrieb. Gesprächspartner: ${character.identity.name}, ${character.identity.profession}.`;
}

export function realtimeSessionConfig(
  character: RoleCharacter,
  hiddenFacts: HiddenFact[],
  state: CharacterState,
  prior: Array<{ speaker: string; text: string }> = [],
) {
  hydrateAffect(character, state);
  return {
    type: "realtime" as const,
    model: realtimeModel(),
    instructions: realtimeInstructions(character, hiddenFacts, state, prior),
    output_modalities: ["audio"] as Array<"audio">,
    audio: {
      input: {
        transcription: {
          model: "gpt-4o-mini-transcribe",
          language: "de",
          prompt: realtimeTranscriptionPrompt(character),
        },
        turn_detection: realtimeTurnDetection(),
        noise_reduction: { type: "far_field" as const },
      },
      output: {
        voice: realtimeVoiceFor(character),
      },
    },
    tools: [
      {
        type: "function",
        name: "recall_memory",
        description:
          "Wenn eine konkrete Frage persönliche oder sachliche Hintergrundinformationen betrifft, die in deinem aktuellen Wissen fehlen: vor der Antwort gezielt nachschlagen. Nur bei Bedarf, nicht jeden Gesprächszug. Nutze ausschließlich zurückgegebene Fakten; bei fehlendem Wissen nichts erfinden.",
        parameters: {
          type: "object",
          properties: { query: { type: "string", description: "Die konkrete Frage zum eigenen Hintergrund oder zur eigenen Situation." } },
          required: ["query"],
          additionalProperties: false,
        },
      },
      {
        type: "function",
        name: "end_call",
        description:
          "Auflegen. Erst den Schlusssatz sagen, dann aufrufen — mit dem Grund und dem gesagten Schlusssatz als last_line.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              enum: [...END_CALL_REASONS],
            },
            last_line: { type: "string", description: "Der zuletzt gesagte Schlusssatz, wörtlich." },
          },
          required: ["reason"],
        },
      },
      {
        type: "function",
        name: "wait_for_user",
        description:
          `Aufrufen, wenn nur Hintergrundgeräusch, Fernseher, Nebengespräch oder Stille zu hören ist — dann schweigen und warten, bis der Anrufer wirklich spricht. ${PLAYER_WORLD_LOCK}`,
        parameters: { type: "object", properties: {}, additionalProperties: false },
      },
    ],
    tool_choice: "auto",
  };
}

let modelFallbackActive = false;

class RealtimeModelError extends Error {}

function isModelError(data: { error?: { message?: string; param?: string; code?: string } }) {
  const err = data.error;
  if (!err) return false;
  if (err.param === "session.model" || err.code === "invalid_model" || err.code === "model_not_found") return true;
  return /model/i.test(err.message || "");
}

export async function mintRealtimeClientSecret(session: ReturnType<typeof realtimeSessionConfig>) {
  const key = openaiRealtimeKey();
  if (!key) throw new Error("Live-Stimme braucht OPENAI_API_KEY.");
  const wanted = session.model;
  const first = modelFallbackActive && wanted !== REALTIME_FALLBACK_MODEL ? REALTIME_FALLBACK_MODEL : wanted;
  try {
    return await mintOnce(key, { ...session, model: first });
  } catch (error) {
    if (first !== REALTIME_FALLBACK_MODEL && error instanceof RealtimeModelError) {
      console.warn(`Realtime-Modell "${first}" abgelehnt (${error.message}) — Fallback auf ${REALTIME_FALLBACK_MODEL}.`);
      modelFallbackActive = true;
      return mintOnce(key, { ...session, model: REALTIME_FALLBACK_MODEL });
    }
    throw error;
  }
}

async function mintOnce(key: string, session: ReturnType<typeof realtimeSessionConfig>) {
  const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expires_after: { anchor: "created_at", seconds: 3600 },
      session,
    }),
  });
  const data = (await res.json()) as {
    value?: string;
    client_secret?: { value?: string } | string;
    error?: { message?: string; param?: string; code?: string };
  };
  if (!res.ok) {
    const message = data.error?.message || `Realtime ${res.status}`;
    if (isModelError(data)) throw new RealtimeModelError(message);
    throw new Error(message);
  }
  const value =
    data.value ||
    (typeof data.client_secret === "string" ? data.client_secret : data.client_secret?.value) ||
    "";
  if (!value) throw new Error("Kein Live-Token von OpenAI.");
  return value;
}
