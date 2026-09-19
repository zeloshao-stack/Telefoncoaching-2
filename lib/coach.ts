import { randomUUID } from "node:crypto";
import {
  handoffPublicContext,
  resolveCoachHandoff,
  spotlightFromHandoff,
  type CoachHandoff,
} from "@/lib/coach-handoff";
import { playbooksForQuestion } from "@/lib/coach-canon";
import { db } from "@/lib/db";
import { getSessionDto } from "@/lib/sessions";
import type { CoachThread, CoachThreadSummary } from "@/lib/coach-types";
import { formatSpotlight } from "@/lib/spotlight";
import { getVertical, type VerticalId } from "@/lib/verticals";
import { salesPropertiesForQuestion } from "@/lib/sales-properties";
import { mockCoachReply } from "@/src/role-engine/coachAnswer";
import { hasOpenAiKey, openaiCoachReply } from "@/src/role-engine/openaiAdapter";

type ThreadRow = {
  id: string;
  title: string;
  session_id: string | null;
  engine_mode: string;
  created_at: string;
  updated_at: string;
  vertical_id?: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  seq: number;
  role: string;
  text: string;
  created_at: string;
};

function messages(threadId: string): MessageRow[] {
  return db()
    .prepare("SELECT * FROM coach_messages WHERE thread_id = ? ORDER BY seq ASC")
    .all(threadId) as MessageRow[];
}

function toThread(row: ThreadRow): CoachThread {
  return {
    id: row.id,
    title: row.title,
    sessionId: row.session_id,
    engineMode: row.engine_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    verticalId: row.vertical_id || "immobilien",
    messages: messages(row.id).map((m) => ({
      id: m.id,
      role: m.role as CoachThread["messages"][number]["role"],
      text: m.text,
      createdAt: m.created_at,
    })),
  };
}

function requireEndedHandoff(sessionId: string, turnId?: string | null): CoachHandoff {
  const session = getSessionDto(sessionId);
  if (session.status !== "ended") {
    throw new Error("Der Coach sieht keine laufende Sitzung. Erst auflegen.");
  }
  return resolveCoachHandoff(session, turnId);
}

function publicContext(sessionId: string | null): string | null {
  if (!sessionId) return null;
  const session = getSessionDto(sessionId);
  const handoff = requireEndedHandoff(sessionId);
  return handoffPublicContext(session, handoff);
}

function sessionSpotlightText(handoff: CoachHandoff): string {
  return formatSpotlight(spotlightFromHandoff(handoff));
}

export function findCoachThreadForSession(sessionId: string): CoachThread | null {
  const row = db()
    .prepare("SELECT * FROM coach_threads WHERE session_id = ? ORDER BY updated_at DESC LIMIT 1")
    .get(sessionId) as ThreadRow | undefined;
  return row ? toThread(row) : null;
}

export function listCoachThreads(verticalId?: string): CoachThreadSummary[] {
  const rows = (
    verticalId
      ? (db()
          .prepare(
            "SELECT id, title, session_id, updated_at, vertical_id FROM coach_threads WHERE vertical_id = ? ORDER BY updated_at DESC LIMIT 30",
          )
          .all(verticalId) as {
          id: string;
          title: string;
          session_id: string | null;
          updated_at: string;
          vertical_id?: string;
        }[])
      : (db()
          .prepare("SELECT id, title, session_id, updated_at, vertical_id FROM coach_threads ORDER BY updated_at DESC LIMIT 30")
          .all() as {
          id: string;
          title: string;
          session_id: string | null;
          updated_at: string;
          vertical_id?: string;
        }[])
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    sessionId: r.session_id,
    updatedAt: r.updated_at,
    verticalId: r.vertical_id || "immobilien",
  }));
}

export function getCoachThread(id: string): CoachThread {
  const row = db().prepare("SELECT * FROM coach_threads WHERE id = ?").get(id) as ThreadRow | undefined;
  if (!row) throw new Error("Chat nicht gefunden");
  return toThread(row);
}

export function createCoachThread(opts?: { sessionId?: string; verticalId?: string; handoff?: CoachHandoff }) {
  const handoff = opts?.handoff ?? (opts?.sessionId ? requireEndedHandoff(opts.sessionId) : null);
  const now = new Date().toISOString();
  const id = randomUUID();
  const title = handoff ? `${handoff.counterpartName} · ${handoff.focusLabel}` : "Neuer Chat";
  const verticalId = opts?.sessionId
    ? getSessionDto(opts.sessionId).verticalId || opts.verticalId || "immobilien"
    : opts?.verticalId || "immobilien";
  db()
    .prepare(
      "INSERT INTO coach_threads (id, title, session_id, engine_mode, created_at, updated_at, vertical_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(id, title, opts?.sessionId ?? null, hasOpenAiKey() ? "openai" : "mock", now, now, verticalId);
  if (opts?.sessionId && handoff) {
    db()
      .prepare(
        "INSERT INTO coach_messages (id, thread_id, seq, role, text, created_at) VALUES (?, ?, 0, 'system', ?, ?)",
      )
      .run(randomUUID(), id, "Gespräch beendet. Wir gehen die Stelle durch.", now);
    db()
      .prepare(
        "INSERT INTO coach_messages (id, thread_id, seq, role, text, created_at) VALUES (?, ?, 1, 'coach', ?, ?)",
      )
      .run(randomUUID(), id, sessionSpotlightText(handoff), now);
  }
  return getCoachThread(id);
}

function replaceSeededOpener(threadId: string, spotlight: string) {
  const rows = messages(threadId);
  const coach = rows.find((row) => row.role === "coach");
  const system = rows.find((row) => row.role === "system");
  if (system) {
    db()
      .prepare("UPDATE coach_messages SET text = ? WHERE id = ?")
      .run("Gespräch beendet. Wir gehen die Stelle durch.", system.id);
  }
  if (coach) {
    db().prepare("UPDATE coach_messages SET text = ? WHERE id = ?").run(spotlight, coach.id);
    return;
  }
  db()
    .prepare(
      "INSERT INTO coach_messages (id, thread_id, seq, role, text, created_at) VALUES (?, ?, ?, 'coach', ?, ?)",
    )
    .run(randomUUID(), threadId, rows.length, spotlight, new Date().toISOString());
}

/** Deep-Link: dieselbe Sitzung öffnet denselben Thread, erster Coach-Satz ohne Scorecard. */
export function openCoachFromHandoff(sessionId: string, turnId?: string | null) {
  const handoff = requireEndedHandoff(sessionId, turnId);
  const spotlight = sessionSpotlightText(handoff);
  const existing = findCoachThreadForSession(sessionId);
  if (existing) {
    const hasUser = existing.messages.some((message) => message.role === "user");
    if (!hasUser) replaceSeededOpener(existing.id, spotlight);
    return { thread: getCoachThread(existing.id), handoff };
  }
  return { thread: createCoachThread({ sessionId, handoff }), handoff };
}

export async function appendCoachTurn(threadId: string, text: string, signal?: AbortSignal) {
  const thread = getCoachThread(threadId);
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Bitte eine Frage schreiben.");
  const now = new Date().toISOString();
  const seq = thread.messages.length;
  const context = publicContext(thread.sessionId);
  const vertical = getVertical(thread.verticalId as VerticalId);
  const properties = salesPropertiesForQuestion(trimmed, vertical.salesProperties);
  const playbooks = playbooksForQuestion(trimmed);
  let reply = mockCoachReply({ question: trimmed, publicContext: context, properties, playbooks });
  if (hasOpenAiKey()) {
    try {
      const openai = await openaiCoachReply({
        question: trimmed,
        history: [...thread.messages, { role: "user", text: trimmed }].map((m) => ({
          role: m.role,
          text: m.text,
        })),
        knowledge: playbooks.map((book) => ({
          id: book.id,
          title: book.title,
          application: book.goal,
          contraindication: book.avoid.join(" "),
        })),
        playbooks: playbooks.map((book) => ({
          id: book.id,
          title: book.title,
          goal: book.goal,
          do: book.do,
          avoid: book.avoid,
          phrase: book.phrase,
        })),
        salesProperties: properties,
        publicContext: context,
        coachIdentity: vertical.coachIdentity,
        signal,
      });
      reply = { engine: "openai", text: openai.text, cardIds: openai.cardIds };
    } catch (e) {
      if (signal?.aborted) throw e;
      reply = mockCoachReply({ question: trimmed, publicContext: context, properties, playbooks });
    }
  }
  if (signal?.aborted) throw new Error("Abgebrochen.");

  db()
    .prepare("INSERT INTO coach_messages (id, thread_id, seq, role, text, created_at) VALUES (?, ?, ?, 'user', ?, ?)")
    .run(randomUUID(), threadId, seq, trimmed, now);
  db()
    .prepare("INSERT INTO coach_messages (id, thread_id, seq, role, text, created_at) VALUES (?, ?, ?, 'coach', ?, ?)")
    .run(randomUUID(), threadId, seq + 1, reply.text, now);
  const title = thread.title === "Neuer Chat" ? trimmed.slice(0, 48) : thread.title;
  db()
    .prepare("UPDATE coach_threads SET title = ?, engine_mode = ?, updated_at = ? WHERE id = ?")
    .run(title, reply.engine, now, threadId);
  return getCoachThread(threadId);
}
