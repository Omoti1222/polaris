import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const TITLE_PROMPT = `
You are an assistant that generates short conversation titles.

Rules:
- Return only the title
- Do not include quotes
- Do not include markdown
- Keep it concise
- Prefer the same language as the input
- Prefer under 30 characters when possible

Conversation:
{titleSourceText}
`;

function normalizeTitle(text: string): string {
  return text
    .trim()
    .replace(/^["'「『]+/, "")
    .replace(/["'」』]+$/, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 60)
    .trim();
}

function fallbackTitle(titleSourceText: string): string {
  const cleaned = titleSourceText
    .trim()
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return "New Coversation";
  }

  return cleaned.slice(0, 30);
}

export async function generateConversationTitle(
  titleSourceText: string,
): Promise<string> {
  const source = titleSourceText.trim();

  if (!source) {
    return "New Conversation";
  }

  const prompt = TITLE_PROMPT.replace("{titleSourceText}", source);

  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    const title = normalizeTitle(result.text);

    if (!title) {
      return fallbackTitle(source);
    }

    return title;
  } catch (error) {
    console.error("generateConversationTitle failed", error);
    return fallbackTitle(source);
  }
}
