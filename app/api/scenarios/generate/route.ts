import { NextResponse } from "next/server";
import { generateAuthoredScenario } from "@/lib/scenario-generator";
import { activeVerticalId } from "@/lib/workspace";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      situation?: string;
      counterpart?: string;
      objekt?: string;
      happened?: string;
      rollHidden?: boolean;
    };
    const scenario = await generateAuthoredScenario(
      { ...body, verticalId: await activeVerticalId() },
      { signal: req.signal },
    );
    return NextResponse.json(scenario);
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    if (aborted) return NextResponse.json({ error: "Abgebrochen." }, { status: 499 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
