export function stripMarkdownFences(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(stripMarkdownFences(text));
  } catch {
    return fallback;
  }
}
