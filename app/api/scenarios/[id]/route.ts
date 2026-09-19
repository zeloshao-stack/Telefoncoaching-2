import { NextResponse } from "next/server";
import { getAuthored, saveAuthored } from "@/lib/authored";
import type { AuthoredScenario } from "@/lib/authored-types";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const scenario = getAuthored(id);
  if (!scenario) {
    return NextResponse.json({ error: "Szenario nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json(scenario);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as AuthoredScenario;
    const saved = saveAuthored({ ...body, id });
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
