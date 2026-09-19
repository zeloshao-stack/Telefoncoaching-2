export type LlmPurpose = "roleplay" | "evaluate" | "coach" | "generate";

export type LlmStatus = {
  connected: boolean;
  provider: "openai" | "openrouter" | "mock";
  model: string;
  abortable: true;
};

function openaiKey() {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

function openRouterKey() {
  return process.env.OPENROUTER_API_KEY?.trim() || "";
}

export function hasLlmKey() {
  return Boolean(openaiKey() || openRouterKey());
}

export function llmStatus(): LlmStatus {
  if (openRouterKey()) {
    return {
      connected: true,
      provider: "openrouter",
      model: process.env.LLM_MODEL?.trim() || "openai/gpt-4o",
      abortable: true,
    };
  }
  if (openaiKey()) {
    return {
      connected: true,
      provider: "openai",
      model: process.env.LLM_MODEL?.trim() || "gpt-4o",
      abortable: true,
    };
  }
  return {
    connected: false,
    provider: "mock",
    model: "regel-fallback",
    abortable: true,
  };
}

/** Dokumentierter Chat-Completions-Default 2026, stärker als gpt-4o. Override: LLM_ROLEPLAY_MODEL (z. B. gpt-4o). Nicht Astra, kein Live-Audio. */
export const LLM_ROLEPLAY_DEFAULT_MODEL = "gpt-5";
export const LLM_ROLEPLAY_TEMPERATURE = 0.75;

export function llmRoleplayModel() {
  const override = process.env.LLM_ROLEPLAY_MODEL?.trim();
  if (override) return override;
  return openRouterKey() ? `openai/${LLM_ROLEPLAY_DEFAULT_MODEL}` : LLM_ROLEPLAY_DEFAULT_MODEL;
}

function modelFor(purpose: LlmPurpose): string {
  const status = llmStatus();
  if (purpose === "roleplay") return llmRoleplayModel();
  if (purpose === "generate") {
    return process.env.LLM_ROLEPLAY_MODEL?.trim() || status.model;
  }
  return process.env.LLM_COACH_MODEL?.trim() || status.model;
}

function temperatureFor(purpose: LlmPurpose): number {
  if (purpose === "generate") return 0.7;
  if (purpose === "roleplay") return LLM_ROLEPLAY_TEMPERATURE;
  if (purpose === "evaluate") return 0.1;
  return 0.4;
}

/** JSON-Schema für response_format json_schema (strict). Fällt bei Ablehnung auf json_object zurück. */
export type JsonSchemaSpec = { name: string; schema: Record<string, unknown> };

export type LlmChatTurn = { role: "user" | "assistant"; content: string };

async function completeCompatible(args: {
  url: string;
  key: string;
  model: string;
  system: string;
  user: string;
  conversation?: LlmChatTurn[];
  signal?: AbortSignal;
  temperature?: number;
  extraHeaders?: Record<string, string>;
  schema?: JsonSchemaSpec;
}): Promise<unknown> {
  const responseFormat = args.schema
    ? { type: "json_schema", json_schema: { name: args.schema.name, strict: true, schema: args.schema.schema } }
    : { type: "json_object" };
  const res = await fetch(args.url, {
    method: "POST",
    signal: args.signal,
    headers: {
      Authorization: `Bearer ${args.key}`,
      "Content-Type": "application/json",
      ...args.extraHeaders,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: args.temperature ?? 0.4,
      response_format: responseFormat,
      messages: [
        { role: "system", content: args.system },
        ...(args.conversation ?? []),
        { role: "user", content: args.user },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    // Modelle ohne json_schema-Unterstützung: einmal ohne Schema wiederholen.
    if (args.schema && res.status === 400 && /json_schema|response_format|schema/i.test(err)) {
      return completeCompatible({ ...args, schema: undefined });
    }
    throw new Error(`LLM ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0]?.message?.content || "{}");
}

export async function completeJson(
  system: string,
  user: string,
  opts?: {
    signal?: AbortSignal;
    purpose?: LlmPurpose;
    schema?: JsonSchemaSpec;
    temperature?: number;
    conversation?: LlmChatTurn[];
  },
): Promise<unknown> {
  const status = llmStatus();
  if (!status.connected) throw new Error("no key");
  const purpose = opts?.purpose ?? "coach";
  const model = modelFor(purpose);
  const temperature = opts?.temperature ?? temperatureFor(purpose);
  if (status.provider === "openrouter") {
    return completeCompatible({
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: openRouterKey(),
      model,
      system,
      user,
      conversation: opts?.conversation,
      signal: opts?.signal,
      temperature,
      schema: opts?.schema,
      extraHeaders: {
        "HTTP-Referer": "http://127.0.0.1:43147",
        "X-Title": "Telefoncoaching",
      },
    });
  }
  return completeCompatible({
    url: "https://api.openai.com/v1/chat/completions",
    key: openaiKey(),
    model,
    system,
    user,
    conversation: opts?.conversation,
    signal: opts?.signal,
    temperature,
    schema: opts?.schema,
  });
}
