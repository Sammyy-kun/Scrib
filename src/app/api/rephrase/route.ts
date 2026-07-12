import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const prompt = `You are an expert paraphraser. Paraphrase the following text in 3 different ways to improve clarity, flow, and impact. Return a JSON array of strings, where each string is a paraphrased version. Respond ONLY with the JSON array.\n\nText to paraphrase: ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    let results = [];
    try {
      results = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse Gemini response", resultText);
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reach Gemini API" }, { status: 502 });
  }
}
