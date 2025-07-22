import prisma from '../config/prisma';
import { JobPosting, Keyword } from '@prisma/client';
import logger from '../utils/logger';
import { getSimilarityScore } from '../utils/fuzzy-match.util';
import { findJobPostings } from '../repositories/jobs/job.repository';
import redis from '../config/redis';

interface SearchOptions {
  daysRange?: number;
  minScore?: number;
}

/**
 * Checks whether a job post matches given keywords based on similarity score.
 */
function isMatch(post: JobPosting, keywords: string[], minScore: number): boolean {
  const content = `${post.title} ${post.description}`;
  const score = getSimilarityScore(content, keywords);
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
    const keywordCacheKey = `keywords:user:${userId}`;
    const cachedKeywords = await redis.get(keywordCacheKey);

    let keywords;
    if (cachedKeywords) {
      keywords = JSON.parse(cachedKeywords);
      logger.info(`♻️ Loaded keywords from Redis for user ${userId}`);
    } else {
      keywords = await prisma.keyword.findMany({ where: { userId } });
      if (!keywords.length) {
        logger.warn(`⚠️ No keywords found for user ${userId}`);
        return [];
      }
      await redis.set(keywordCacheKey, JSON.stringify(keywords), { EX: 60 * 10 });
      logger.info(`🗃️ Fetched keywords from DB and cached for user ${userId}`);
    }
    const terms = keywords.map((k: Keyword) => k.word);

    // Load user groups
    const groupCacheKey = `userGroups:user:${userId}`;
    const cachedGroups = await redis.get(groupCacheKey);

    let groupIds: number[];
    if (cachedGroups) {
      groupIds = JSON.parse(cachedGroups);
      logger.info(`♻️ Loaded user groups from Redis for user ${userId}`);
    } else {
      const userGroups = await prisma.userGroup.findMany({
        where: { userId },
        select: { groupId: true }
      });
      groupIds = userGroups.map(g => g.groupId);
      if (!groupIds.length) {
        logger.warn(`⚠️ User ${userId} has no group associations`);
        return [];
      }
      await redis.set(groupCacheKey, JSON.stringify(groupIds), { EX: 60 * 10 });
      logger.info(`🗃️ Fetched user groups from DB and cached for user ${userId}`);
    }
    const cacheKey = `jobsearch:${userId}:${daysRange}:${minScore}:${groupIds.join(',')}:${terms.join(',')}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info(`♻️ Returning cached job search results for user ${userId}`);
      return JSON.parse(cached);
    }

    // Filter jobs by group and time window
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysRange);

    const posts = await findJobPostings(groupIds, fromDate);

    logger.info(`📄 Retrieved ${posts.length} posts for user ${userId}`);

    // Filter matched jobs
    const matched = posts.filter(post => isMatch(post, terms, minScore));
    logger.info(`🎯 Found ${matched.length} relevant jobs (minScore: ${minScore})`);
    await redis.set(cacheKey, JSON.stringify(matched), { EX: 60 * 10 });
    return matched;
  } catch (err) {
    logger.error(`❌ Failed to search jobs for user ${userId}:`, err);
    throw err;
  }
}
