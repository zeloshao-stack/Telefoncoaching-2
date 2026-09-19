"use client";

const secrets = new Map<string, Promise<string>>();
const ownCalls = new Map<string, string>();

export class LiveBusyError extends Error {}

/** Eigene call_id überlebt einen Reload im selben Tab, damit der Server-Lock nicht 60 s blockiert. */
function ownCallKey(sessionId: string) {
  return `tc-live-call-${sessionId}`;
}

function rememberOwnCall(sessionId: string, callId: string) {
  ownCalls.set(sessionId, callId);
  try {
    sessionStorage.setItem(ownCallKey(sessionId), callId);
  } catch {
    /* sessionStorage kann fehlen */
  }
}

function ownCallFor(sessionId: string) {
  const inMemory = ownCalls.get(sessionId);
  if (inMemory) return inMemory;
  try {
    return sessionStorage.getItem(ownCallKey(sessionId)) || undefined;
  } catch {
    return undefined;
  }
}

function mint(sessionId: string) {
  const ownCallId = ownCallFor(sessionId);
  return fetch(`/api/sessions/${sessionId}/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ownCallId ? { own_call_id: ownCallId } : {}),
  })
    .then(async (res) => {
      const data = (await res.json()) as { value?: string; claim_id?: string; error?: string };
      if (res.status === 409) {
        throw new LiveBusyError(
          data.error ||
            "Die Leitung ist schon offen (anderer Tab). Dort auflegen oder kurz warten.",
        );
      }
      if (!res.ok || !data.value) throw new Error(data.error || "Live-Token fehlt");
      // Mint setzt den Claim-Lock — sofort merken, sonst race mit zweitem Tab.
      if (data.claim_id) rememberOwnCall(sessionId, data.claim_id);
      return data.value;
    })
    .catch((error) => {
      secrets.delete(sessionId);
      throw error;
    });
}

export function prefetchLiveSecret(sessionId: string) {
  if (!sessionId) return Promise.reject(new Error("Keine Sitzung"));
  const existing = secrets.get(sessionId);
  if (existing) return existing;
  const pending = mint(sessionId);
  secrets.set(sessionId, pending);
  return pending;
}

/** Ein Token nur für genau einen WebRTC-Anruf. */
export function takeLiveSecret(sessionId: string) {
  const pending = secrets.get(sessionId);
  secrets.delete(sessionId);
  return pending ?? mint(sessionId);
}

export function dropLiveSecret(sessionId: string) {
  secrets.delete(sessionId);
}

/** Anruf (rtc_…) beim Server anmelden; dieselbe Funktion dient als Heartbeat. */
export async function registerLiveCall(sessionId: string, callId: string) {
  const previous = ownCallFor(sessionId);
  rememberOwnCall(sessionId, callId);
  const res = await fetch(`/api/sessions/${sessionId}/live/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      call_id: callId,
      ...(previous && previous !== callId ? { previous_call_id: previous } : {}),
    }),
  });
  if (res.status === 409) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new LiveBusyError(
      data.error || "Die Leitung ist schon offen (anderer Tab). Dort auflegen oder kurz warten.",
    );
  }
  return res.ok;
}

/** Beim Auflegen: call_id freigeben, auch wenn der Tab gerade zugeht. */
export function releaseLiveCall(sessionId: string, callId: string) {
  // ownCalls bewusst behalten: ein Reconnect darf die eigene, evtl. noch nicht gelöschte call_id ablösen.
  try {
    void fetch(`/api/sessions/${sessionId}/live/call`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ call_id: callId }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* best effort */
  }
}
