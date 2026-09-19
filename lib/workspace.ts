import { cookies } from "next/headers";
import { DEFAULT_VERTICAL, getVertical, isVerticalId, type Vertical, type VerticalId } from "@/lib/verticals";

export const VERTICAL_COOKIE = "tc_vertical";

export async function activeVerticalId(): Promise<VerticalId> {
  const jar = await cookies();
  const raw = jar.get(VERTICAL_COOKIE)?.value;
  return isVerticalId(raw) ? raw : DEFAULT_VERTICAL;
}

export async function activeVertical(): Promise<Vertical> {
  return getVertical(await activeVerticalId());
}
