import { NextResponse } from "next/server";
import { appendTraineeTurn } from "@/lib/sessions";
import type { AcousticSample } from "@/src/role-engine/types";

function readAcoustic(raw: unknown): AcousticSample | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const durationMs = Number(a.durationMs);
  const meanEnergy = Number(a.meanEnergy);
  const peakEnergy = Number(a.peakEnergy);
  if (!Number.isFinite(durationMs) || durationMs < 80) return null;
  if (!Number.isFinite(meanEnergy) || !Number.isFinite(peakEnergy)) return null;
  const voicedMs = Number(a.voicedMs);
  return {
    durationMs: Math.min(60_000, Math.max(80, durationMs)),
    meanEnergy: Math.min(1, Math.max(0, meanEnergy)),
    peakEnergy: Math.min(1, Math.max(0, peakEnergy)),
    voicedMs: Number.isFinite(voicedMs) ? Math.min(60_000, Math.max(0, voicedMs)) : undefined,
  };
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { text?: string; interrupted?: boolean; acoustic?: unknown };
    const session = await appendTraineeTurn(id, body.text ?? "", req.signal, {
      interrupted: body.interrupted === true,
      acoustic: readAcoustic(body.acoustic),
    });
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
