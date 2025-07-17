import fuzzysort from 'fuzzysort';
import logger from './logger';

/**
 * Computes similarity score between a job description and keyword list using fuzzy match.
 * Each keyword with score > -1000 is considered a match.
 */
export function getSimilarityScore(text: string, keywords: string[]): number {
  if (!text?.trim() || !keywords.length) {
    logger.warn(`⚠️ Missing input for similarity score`);
    return 0;
  }

  const cleanedText = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\u0590-\u05FF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return keywords.reduce((score, keyword) => {
    const result = fuzzysort.single(keyword, cleanedText);
    return result && result.score > -1000 ? score + 1 : score;
  }, 0);
}
