import { NextResponse } from "next/server";
import { createSession } from "@/lib/sessions";
import { activeVerticalId } from "@/lib/workspace";
import { getVertical } from "@/lib/verticals";
import { getAuthored } from "@/lib/authored";
import { defaultFocusForScenario, isFocusId } from "@/lib/focus";
import { hasRealtimeKey } from "@/lib/openai-realtime";
import { hasLlmKey } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    if (!hasRealtimeKey() && !hasLlmKey() && process.env.ALLOW_DEMO_MODE !== "true") {
      return NextResponse.json({ error: "Noch kein KI-Zugang eingerichtet. Öffnen Sie Einstellungen und Werkstatt, um die Verbindung einzurichten." }, { status: 503 });
    }
    const body = (await req.json()) as { scenarioId?: string; focusId?: string };
    if (!body.scenarioId) {
      return NextResponse.json({ error: "Szenario fehlt." }, { status: 400 });
    }
    const verticalId = await activeVerticalId();
    const vertical = getVertical(verticalId);
    const authored = getAuthored(body.scenarioId);
    const allowed =
      vertical.frozenScenarioIds.includes(body.scenarioId) ||
      (authored && (authored.verticalId || "immobilien") === verticalId);
    if (!allowed) {
      return NextResponse.json({ error: "Dieses Szenario gehört nicht zur gewählten Branche." }, { status: 400 });
    }
    const focusId = isFocusId(body.focusId)
      ? body.focusId
      : defaultFocusForScenario(body.scenarioId, verticalId);
    const session = createSession(body.scenarioId, { verticalId, focusId });
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
