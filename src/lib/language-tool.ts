const LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check";

export interface LanguageToolAlert {
  offset: number;
  length: number;
  category: string;
  shortMessage: string;
  message: string;
  replacements: string[];
}

function categorize(ruleId = "", issueType = "", categoryName = ""): string {
  const combined = `${ruleId} ${issueType} ${categoryName}`.toLowerCase();
  if (combined.includes("spell") || combined.includes("misspell") || issueType === "misspelling") return "Spelling";
  if (combined.includes("punct") || combined.includes("punctuation")) return "Punctuation";
  if (combined.includes("style") || combined.includes("typography") || issueType === "style") return "Style";
  if (combined.includes("grammar")) return "Grammar";
  return "Grammar";
}

export async function checkLanguageTool(text: string, language = "en-US"): Promise<LanguageToolAlert[]> {
  const form = new URLSearchParams();
  form.set("text", text);
  form.set("language", language);
  form.set("enabledOnly", "false");
  form.set("level", "default");

  const res = await fetch(LANGUAGETOOL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LanguageTool request failed: ${res.status} ${errorText}`);
  }

  const data = (await res.json()) as {
    matches: Array<{
      message: string;
      shortMessage?: string;
      offset: number;
      length: number;
      replacements?: Array<{ value: string }>;
      rule: {
        id?: string;
        description?: string;
        issueType?: string;
        category?: { id?: string; name?: string };
      };
    }>;
  };

  return data.matches.map((match) => {
    const categoryName = match.rule?.category?.name || "";
    const issueType = match.rule?.issueType || "";
    const ruleId = match.rule?.id || "";

    return {
      offset: match.offset,
      length: match.length,
      category: categorize(ruleId, issueType, categoryName),
      shortMessage: match.shortMessage || match.message,
      message: match.message,
      replacements: match.replacements?.map((r) => r.value) || [],
    };
  });
}
