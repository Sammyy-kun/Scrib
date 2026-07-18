import { checkLanguageTool, type LanguageToolAlert } from "./language-tool";
import { checkGroq, type GroqAlert } from "./groq";

export interface Alert extends LanguageToolAlert {
  explanation?: string;
}

export interface GrammarCheckResult {
  alerts: Alert[];
  score: string;
}

export async function checkGrammar(text: string): Promise<GrammarCheckResult> {
  if (!text.trim()) {
    return { alerts: [], score: "Ready" };
  }

  // Step 1: LanguageTool for spelling, punctuation, simple grammar
  let ltAlerts: LanguageToolAlert[] = [];
  try {
    ltAlerts = await checkLanguageTool(text);
  } catch (err) {
    console.error("LanguageTool failed:", err);
  }

  // Step 2: Groq AI for context-aware analysis (analyze first, then provide fixes)
  let groqAlerts: GroqAlert[] = [];
  try {
    groqAlerts = await checkGroq(text);
  } catch (err) {
    console.error("Groq failed:", err);
  }

  // Merge: Groq takes precedence for overlapping issues (richer context)
  const merged = new Map<number, Alert>();

  for (const alert of ltAlerts) {
    merged.set(alert.offset, { ...alert });
  }

  for (const alert of groqAlerts) {
    merged.set(alert.offset, {
      ...alert,
      explanation: alert.explanation,
    });
  }

  // Sort descending by offset for front-end text replacement
  const sortedAlerts = Array.from(merged.values()).sort((a, b) => b.offset - a.offset);

  const nonStyleCount = sortedAlerts.filter((a) => a.category !== "Style").length;
  const score = nonStyleCount === 0 ? "Perfect Score" : `${nonStyleCount} issue(s)`;

  return {
    alerts: sortedAlerts,
    score,
  };
}
