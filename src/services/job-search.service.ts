import prisma from '../config/prisma';
import { JobPosting } from '@prisma/client';
import logger from '../utils/logger';
import { getSimilarityScore } from '../utils/fuzzy-match.util';
import { findJobPostings } from '../repositories/jobs/job.repository';

interface SearchOptions {
  daysRange?: number;
  minScore?: number;
}

/**
 * Checks whether a job post matches given keywords based on similarity score.
 */
function isMatch(post: JobPosting, keywords: string[], minScore: number): boolean {
  const score = getSimilarityScore(post.description, keywords);
  logger.debug(`🔍 [${post.title}] score: ${score}`);
  return score >= minScore;
}

/**
 * Searches job posts relevant to a user by matching keywords with post descriptions using fuzzy logic.
 * Filters only posts from the user's groups and recent days.
 */
export async function searchJobsByKeywords(userId: number, options: SearchOptions = {}): Promise<JobPosting[]> {
  const { daysRange = 7, minScore = 2 } = options;

  try {
    // Load keywords
    const keywords = await prisma.keyword.findMany({ where: { userId } });
    if (!keywords.length) {
      logger.warn(`⚠️ No keywords found for user ${userId}`);
      return [];
    }
    const terms = keywords.map(k => k.word);
    logger.info(`🔑 Loaded ${terms.length} keywords for user ${userId}`);

    // Load groups
    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      select: { groupId: true }
    });
    const groupIds = userGroups.map(g => g.groupId);
    if (!groupIds.length) {
      logger.warn(`⚠️ User ${userId} has no group associations`);
      return [];
    }

    // Filter jobs by group and time window
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysRange);

    const posts = await findJobPostings(groupIds, fromDate);

    logger.info(`📄 Retrieved ${posts.length} posts for user ${userId}`);

    // Filter matched jobs
    const matched = posts.filter(post => isMatch(post, terms, minScore));
    logger.info(`🎯 Found ${matched.length} relevant jobs (minScore: ${minScore})`);

    return matched;
  } catch (err) {
    logger.error(`❌ Failed to search jobs for user ${userId}:`, err);
    throw err;
  }
}
