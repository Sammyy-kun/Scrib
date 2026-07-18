import { NextRequest, NextResponse } from "next/server";
import { checkGrammar } from "@/lib/grammar-checker";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const result = await checkGrammar(text);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Grammar check error:", err);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 502 }
    );
  }
}
