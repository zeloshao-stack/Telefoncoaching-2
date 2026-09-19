import { NextResponse } from "next/server";
import { recallMemory } from "@/lib/semantic-memory";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  const query = body && typeof body === "object" ? (body as { query?: unknown }).query : null;
  const expectedCallerText = body && typeof body === "object" ? (body as { expectedCallerText?: unknown }).expectedCallerText : undefined;
  if (expectedCallerText !== undefined && (typeof expectedCallerText !== "string" || expectedCallerText.length > 20000)) {
    return NextResponse.json({ error: "Ungültiger Gesprächsanker" }, { status: 400 });
  }
  if (typeof query !== "string" || !query.trim() || query.length > 600) {
    return NextResponse.json({ error: "Ungültige Gedächtnisfrage" }, { status: 400 });
  }
  try {
    const { id } = await ctx.params;
    return NextResponse.json(await recallMemory(id, query, req.signal, expectedCallerText as string | undefined));
  } catch {
    // Never expose provider error bodies or the private selection prompt.
    return NextResponse.json({ facts: [], status: "unavailable", error: "Gedächtnisabruf derzeit nicht verfügbar" }, { status: 503 });
  }
}
