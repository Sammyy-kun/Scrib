import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert copy editor. Your ONLY task is to fix grammar, spelling, punctuation, and clarity. Do not change the user's core meaning or tone. Make the text flow naturally in standard English. Return STRICTLY the corrected text. Do not include any explanations, conversational filler, or introductory phrases (e.g., \"Sure, here is your corrected text:\").",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
    });

    const correctedText =
      chatCompletion.choices[0]?.message?.content || text;

    return NextResponse.json({ correctedText });
  } catch (error: unknown) {
    console.error("Groq API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to process text";

    if (message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit reached (429 Too Many Requests). Please wait 60 seconds before trying again.", detail: message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
