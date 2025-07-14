import { Keyword } from "@prisma/client";

export function isJobPost(
  text: string,
  keywords: Keyword[],
  threshold: number = 2 
): boolean {
  const normalized = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let matches = 0;

  for (const keyword of keywords) {
    const keywordText = keyword.word.toLowerCase().trim();
    if (normalized.includes(keywordText)) {
      matches++;
    }
  }

  return matches >= threshold;
}
