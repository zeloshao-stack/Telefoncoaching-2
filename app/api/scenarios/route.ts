import { NextResponse } from "next/server";
import { createAuthored, listAuthored } from "@/lib/authored";
import { activeVerticalId } from "@/lib/workspace";

export async function GET() {
  const verticalId = await activeVerticalId();
  return NextResponse.json(listAuthored(verticalId));
}

export async function POST() {
  try {
    const created = createAuthored(await activeVerticalId());
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
