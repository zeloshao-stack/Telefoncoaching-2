import { NextResponse } from "next/server";
import { llmStatus } from "@/lib/llm";

export async function GET() {
  return NextResponse.json(llmStatus());
}
