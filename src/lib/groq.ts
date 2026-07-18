export interface GroqAlert {
  offset: number;
  length: number;
  message: string;
  shortMessage: string;
  category: string;
  replacements: string[];
  explanation: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function checkGroq(text: string): Promise<GroqAlert[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const prompt = `You are a grammar expert. Analyze the following text for grammar, spelling, punctuation, and style issues that basic spell-checkers might miss.

Focus on context-aware corrections:
1. Wrong word usage in context (e.g., "their" vs "there" vs "they're", "teh" vs "the")
2. Tense inconsistencies within and between sentences
3. Subject-verb agreement errors in complex sentences
4. Sentence fragments, run-ons, and comma splices
5. Awkward or unclear phrasing
6. Word choice improvements for clarity and tone
7. Article usage errors (a/an, missing articles)
8. Preposition errors
9. Redundancy and wordiness

First, identify ALL issues with their exact character offsets and lengths.
Then for each issue, provide corrections.

CRITICAL: Character offsets are 0-indexed. Calculate them precisely based on the original text.

Return a JSON array of objects. Each object must have:
- offset: number (character offset where the issue starts, 0-indexed)
- length: number (length of the problematic text)
- message: string (brief description of the issue)
- shortMessage: string (one-line summary of the issue)
- category: string (one of: "Grammar", "Spelling", "Punctuation", "Style")
- replacements: string[] (array of suggested fixes, include at least one)
- explanation: string (detailed explanation of why this is an issue and how to fix it)

Only include real issues. If the text is perfect, return an empty array [].

Do NOT return markdown, code fences, or any text outside the JSON array.

Text to analyze:
${text}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a precise grammar analysis assistant. You always respond with valid JSON arrays only, never with markdown or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  let parsed: unknown;
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("Failed to parse Groq response", content);
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter((item): item is Record<string, unknown> => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.offset === "number" &&
        typeof item.length === "number"
      );
    })
    .map((item) => ({
      offset: item.offset as number,
      length: item.length as number,
      message: (item.message as string) || "Grammar issue",
      shortMessage: (item.shortMessage as string) || (item.message as string) || "Issue",
      category: (item.category as string) || "Grammar",
      replacements: Array.isArray(item.replacements)
        ? item.replacements.filter((r): r is string => typeof r === "string")
        : [],
      explanation: (item.explanation as string) || "",
    }));
}
