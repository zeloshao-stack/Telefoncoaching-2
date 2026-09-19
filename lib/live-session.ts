import { randomUUID } from "node:crypto";
import { hydrateAffect } from "@/src/role-engine/affect";
import type { CharacterState, HiddenFact, RoleCharacter } from "@/src/role-engine/types";
import { db } from "@/lib/db";
import { mintRealtimeClientSecret, realtimeSessionConfig } from "@/lib/openai-realtime";

/** Ohne Heartbeat gilt ein gemeldeter Anruf nach dieser Zeit als tot. */
export const LIVE_CALL_STALE_MS = 60_000;

export class LiveCallBusyError extends Error {
  constructor() {
    super(
      "Die Leitung ist für diese Sitzung schon offen (anderer Tab oder Gerät). Dort auflegen oder kurz warten.",
    );
  }
}

type LiveCallRow = { live_call_id?: string | null; live_call_at?: string | null };

export function activeLiveCall(row: LiveCallRow, now = Date.now(), staleMs = LIVE_CALL_STALE_MS) {
  if (!row.live_call_id || !row.live_call_at) return null;
  const at = Date.parse(row.live_call_at);
  if (!Number.isFinite(at) || now - at > staleMs) return null;
  return row.live_call_id;
}

/** Provisorischer Lock vor WebRTC-call_id — verhindert 200-Race zwischen Mint und register. */
export function isLiveCallClaimId(callId: string) {
  return callId.startsWith("claim_");
}

export function nextLiveClaimId(ownCallId?: string | null) {
  if (ownCallId && (isLiveCallClaimId(ownCallId) || ownCallId.startsWith("rtc_"))) return ownCallId;
  return `claim_${randomUUID()}`;
}

/**
 * Darf call_id geschrieben werden? Erlaubt: frei, gleiche id, oder Upgrade claim→rtc
 * wenn `previousCallId` die aktive Claim-ID ist.
 */
export function canRegisterLiveCall(
  active: string | null,
  callId: string,
  previousCallId?: string | null,
) {
  if (!active) return true;
  if (active === callId) return true;
  if (previousCallId && active === previousCallId) return true;
  return false;
}

/**
 * Atomarer Slot-Claim (eine SQL-Zeile), damit parallele Mints nicht beide 200 liefern.
 * `ownCallId` darf den bestehenden Lock erneuern; sonst nur wenn frei/stale.
 */
export function claimLiveSlot(sessionId: string, claimId: string, ownCallId?: string | null) {
  const row = db()
    .prepare("SELECT status, live_call_id, live_call_at FROM sessions WHERE id = ?")
    .get(sessionId) as (LiveCallRow & { status?: string }) | undefined;
  if (!row) throw new Error("Sitzung nicht gefunden");
  if (row.status && row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");

  const nowIso = new Date().toISOString();
  const staleBefore = new Date(Date.now() - LIVE_CALL_STALE_MS).toISOString();
  const own = ownCallId && ownCallId.trim() ? ownCallId.trim() : claimId;

  const result = db()
    .prepare(
      `UPDATE sessions
       SET live_call_id = ?, live_call_at = ?
       WHERE id = ?
         AND status = 'active'
         AND (
           live_call_id IS NULL
           OR live_call_at IS NULL
           OR live_call_id = ?
           OR live_call_id = ?
           OR live_call_at < ?
         )`,
    )
    .run(claimId, nowIso, sessionId, claimId, own, staleBefore);

  if (result.changes > 0) return claimId;

  const again = db()
    .prepare("SELECT live_call_id, live_call_at FROM sessions WHERE id = ?")
    .get(sessionId) as LiveCallRow | undefined;
  const active = again ? activeLiveCall(again) : null;
  if (active === claimId || (ownCallId && active === ownCallId)) return active;
  throw new LiveCallBusyError();
}

export type MintedLiveSecret = { value: string; claim_id: string };

export async function mintLiveClientSecret(
  sessionId: string,
  ownCallId?: string | null,
): Promise<MintedLiveSecret> {
  const row = db().prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId) as
    | ({ status: string; character_json: string; hidden_facts_json: string; state_json: string } & LiveCallRow)
    | undefined;
  if (!row) throw new Error("Sitzung nicht gefunden");
  if (row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");

  const claimId = nextLiveClaimId(ownCallId);
  const priorActive = activeLiveCall(row);
  const ownedAlready = Boolean(
    priorActive && (priorActive === ownCallId || priorActive === claimId),
  );
  // Lock VOR dem OpenAI-Mint — zweiter Tab bekommt 409, nicht zwei Tokens.
  claimLiveSlot(sessionId, claimId, ownCallId);

  try {
    const character = JSON.parse(row.character_json) as RoleCharacter;
    const hiddenFacts = JSON.parse(row.hidden_facts_json) as HiddenFact[];
    const state = JSON.parse(row.state_json) as CharacterState;
    state.affect = hydrateAffect(character, state);
    const prior = db()
      .prepare("SELECT speaker, text FROM turns WHERE session_id = ? ORDER BY seq ASC")
      .all(sessionId) as Array<{ speaker: string; text: string }>;
    const value = await mintRealtimeClientSecret(
      realtimeSessionConfig(character, hiddenFacts, state, prior),
    );
    return { value, claim_id: claimId };
  } catch (error) {
    // Nur neu gesetzten Claim freigeben — laufenden rtc_-Lock nicht bei Remint-Fehler killen.
    if (!ownedAlready) releaseLiveCall(sessionId, claimId);
    throw error;
  }
}

/** Anruf melden bzw. Heartbeat: gleiche call_id verlängert; Claim→rtc mit previous_call_id. */
export function registerLiveCall(
  sessionId: string,
  callId: string,
  previousCallId?: string | null,
) {
  const row = db()
    .prepare("SELECT status, live_call_id, live_call_at FROM sessions WHERE id = ?")
    .get(sessionId) as (LiveCallRow & { status?: string }) | undefined;
  if (!row) throw new Error("Sitzung nicht gefunden");
  if (row.status && row.status !== "active") throw new Error("Diese Sitzung ist bereits beendet.");
  const active = activeLiveCall(row);
  if (!canRegisterLiveCall(active, callId, previousCallId)) throw new LiveCallBusyError();
  db()
    .prepare("UPDATE sessions SET live_call_id = ?, live_call_at = ? WHERE id = ?")
    .run(callId, new Date().toISOString(), sessionId);
}

export function releaseLiveCall(sessionId: string, callId?: string | null) {
  if (callId) {
    db()
      .prepare("UPDATE sessions SET live_call_id = NULL, live_call_at = NULL WHERE id = ? AND live_call_id = ?")
      .run(sessionId, callId);
    return;
  }
  db().prepare("UPDATE sessions SET live_call_id = NULL, live_call_at = NULL WHERE id = ?").run(sessionId);
}
