import { NextResponse } from "next/server";
import { deleteRealCall, getRealCall, updateRealCallTurns } from "@/lib/real-calls";
import type { TranscriptTurn } from "@/src/role-engine/types";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    return NextResponse.json(getRealCall(id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 404 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { turns?: TranscriptTurn[] };
    if (!Array.isArray(body.turns)) {
      return NextResponse.json({ error: "Züge fehlen." }, { status: 400 });
    }
    return NextResponse.json(updateRealCallTurns(id, body.turns));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    deleteRealCall(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
