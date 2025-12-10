import prisma from '../config/prisma';
import { JobPosting, Keyword } from '@prisma/client';
import logger from '../utils/logger';
import { getSimilarityScore } from '../utils/fuzzy-match.util';
import { findJobPostings } from '../repositories/jobs/job.repository';
import { findJobPostings, findJobPostingsByDateRange } from '../repositories/jobs/job.repository';
import redis from '../config/redis';

interface SearchOptions {
  daysRange?: number;
  fromDate?: Date;
  toDate?: Date;
  minScore?: number;
}

function isMatch(post: JobPosting, keywords: string[], minScore: number): boolean {
  const content = `${post.title} ${post.description}`;
  const score = getSimilarityScore(content, keywords);
  const fullText = `${post.title} ${post.description}`;
  const score = getSimilarityScore(fullText, keywords);
  logger.debug(`🔍 [${post.title}] score: ${score}`);
  return score >= minScore;
}

async function getCachedOrFresh<T>(key: string, fetchFn: () => Promise<T>, ttlSec = 600): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.info(`♻️ Redis hit for key: ${key}`);
      return JSON.parse(cached);
    }

    const fresh = await fetchFn();
    await redis.set(key, JSON.stringify(fresh), { EX: ttlSec });
    logger.info(`📦 Redis miss – caching key: ${key}`);
    return fresh;
  } catch (err) {
    logger.warn(`⚠️ Redis error with key "${key}":`, err);
    return await fetchFn(); 
  }
}

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
  const cacheKey = options.fromDate && options.toDate
    ? `jobsearch:${userId}:range:${options.fromDate.toISOString()}-${options.toDate.toISOString()}:score:${minScore}`
    : `jobsearch:${userId}:days:${daysRange}:score:${minScore}`;

  return await getCachedOrFresh(cacheKey, async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.warn(`⚠️ User ${userId} not found`);
      return [];
    }

    // Keywords
    const keywordKey = `keywords:user:${userId}`;
    const keywords = await getCachedOrFresh(keywordKey, async () =>
      prisma.keyword.findMany({ where: { userId } }), 3600
    );
    if (!keywords.length) {
      logger.warn(`⚠️ No keywords found for user ${userId}`);
      return [];
    }
    const terms = keywords.map(k => k.word);

    // Groups
    const groupKey = `groups:user:${userId}`;
    const userGroups = await getCachedOrFresh(groupKey, async () =>
      prisma.userGroup.findMany({ where: { userId }, select: { groupId: true } }), 3600
    );
    const groupIds = userGroups.map(g => g.groupId);
    if (!groupIds.length) {
      logger.warn(`⚠️ User ${userId} has no group associations`);
      return [];
    }

    // Posts
    let posts: JobPosting[] = [];
    if (options.fromDate && options.toDate) {
      posts = await findJobPostingsByDateRange(groupIds, options.fromDate, options.toDate);
      logger.info(`📅 Searching with date range: ${options.fromDate.toISOString()} - ${options.toDate.toISOString()}`);
    } else {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysRange);
      posts = await findJobPostings(groupIds, fromDate);
      logger.info(`📆 Searching with daysRange: Last ${daysRange} days`);
    }

    logger.info(`📄 Retrieved ${posts.length} posts for user ${userId}`);

    // Filter by similarity
    const matched = posts.filter(post => isMatch(post, terms, minScore));
    logger.info(`🎯 Found ${matched.length} relevant jobs (minScore: ${minScore})`);
    await redis.set(cacheKey, JSON.stringify(matched), { EX: 60 * 10 });
    return matched;
  });
}
