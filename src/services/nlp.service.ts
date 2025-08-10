import { Keyword } from "@prisma/client";
import redis from '../config/redis';
import { createHash } from 'crypto';

export async function isJobPost(
  text: string,
  keywords: Keyword[],
  threshold: number = 2
): Promise<boolean> {

  const hash = createHash('sha1').update(text).digest('hex');
  const cacheKey = `nlp-result:${hash}`;
  const cached = await redis.get(cacheKey);
  if (cached !== null) return cached === 'true';

  const normalized = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let matches = 0;

  for (const keyword of keywords) {
    const keywordText = keyword.word
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (normalized.includes(keywordText)) {
      matches++;
    }
  }
  const result = matches >= threshold;
  await redis.set(cacheKey, result ? 'true' : 'false', { EX: 3600 });
  return result;
}
