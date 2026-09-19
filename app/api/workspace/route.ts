import { NextResponse } from "next/server";
import { VERTICAL_COOKIE } from "@/lib/workspace";
import { getVertical, isVerticalId, listVerticals } from "@/lib/verticals";

export async function GET() {
  return NextResponse.json({ verticals: listVerticals().map(publicVertical) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { verticalId?: string };
  if (!isVerticalId(body.verticalId)) {
    return NextResponse.json({ error: "Unbekannte Branche." }, { status: 400 });
  }
  const vertical = getVertical(body.verticalId);
  const res = NextResponse.json({ vertical: publicVertical(vertical) });
  res.cookies.set(VERTICAL_COOKIE, vertical.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

function publicVertical(vertical: ReturnType<typeof getVertical>) {
  return {
    id: vertical.id,
    label: vertical.label,
    shortLabel: vertical.shortLabel,
    status: vertical.status,
    audience: vertical.audience,
  };
}
