import { scrapeLinkedInGroupPosts } from '../scrapers/linkedin-group.scraper';
import { isJobPost } from './nlp.service';
import { extractJobDataFromText } from './extract-job-data.service';
import { createJobPosting } from '../repositories/jobs/job.repository';
import prisma from '../config/prisma';
import redis from '../config/redis';
import { JobPosting } from '@prisma/client';
import logger from '../utils/logger';

export async function scrapeDetectAndSaveAuto(groupId: number): Promise<JobPosting[]> {
  logger.info(`🟢 Starting scrapeDetectAndSaveAuto for group ${groupId}`);

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    logger.warn(`⚠️ Group with ID ${groupId} not found`);
    throw new Error(`Group with ID ${groupId} not found`);
  }

  const email = process.env.LINKEDIN_EMAIL || '';
  const password = process.env.LINKEDIN_PASSWORD || '';
  if (!email || !password) {
    logger.error(`❌ Missing LinkedIn credentials`);
    throw new Error(`Missing LinkedIn credentials`);
  }

  const rawPosts = await scrapeLinkedInGroupPosts(group.linkedinUrl, email, password);
  if (!rawPosts.length) {
    logger.warn(`📭 No posts found in group ${groupId}`);
    return [];
  }
  logger.info(`📦 Retrieved ${rawPosts.length} raw posts`);

  const keywords = await prisma.keyword.findMany();
  if (!keywords.length) {
    logger.warn(`⚠️ No keywords found`);
    return [];
  }
  logger.info(`🔑 Loaded ${keywords.length} keywords`);

  // 🔍 check in Redis which links already exist
  const redisLinks = new Set<string>();
  for (const postText of rawPosts) {
    const extracted = extractJobDataFromText(postText);
    if (extracted?.link) {
      const cached = await redis.get(`joblink:${extracted.link}`);
      if (cached) {
        redisLinks.add(extracted.link);
        logger.info(`🛑 Skipped from Redis: ${extracted.link}`);
      }
    }
  }

  // 🔗 check in DB which links already exist
  const allLinks = rawPosts
    .map(post => extractJobDataFromText(post)?.link)
    .filter((link): link is string => Boolean(link));
  const existingFromDb = await prisma.jobPosting.findMany({
    where: { link: { in: allLinks } },
    select: { link: true },
  });

  const existingLinks = new Set([...existingFromDb.map(p => p.link), ...redisLinks]);
  const savedPosts: JobPosting[] = [];

  // loop through raw posts and save it in the DB
  for (const postText of rawPosts) {
    if (!isJobPost(postText, keywords)) {
      logger.info(`⛔ Skipped: not a job post`);
      continue;
    }

    const extracted = extractJobDataFromText(postText);
    if (
      !extracted?.title ||
      !extracted?.company ||
      !extracted?.link ||
      !extracted?.description ||
      !extracted?.postingDate
    ) {
      logger.warn(`⚠️ Skipped: missing fields`);
      continue;
    }

    if (existingLinks.has(extracted.link)) {
      logger.info(`🔁 Skipped duplicate: ${extracted.link}`);
      continue;
    }

    const saved = await createJobPosting({
      title: extracted.title,
      company: extracted.company,
      description: extracted.description,
      link: extracted.link,
      location: extracted.location ?? null,
      postingDate: extracted.postingDate,
      language: extracted.language ?? null,
      groupId,
    });

    logger.info(`✅ Saved: ${saved.title} at ${saved.company}`);
    savedPosts.push(saved);
    existingLinks.add(extracted.link);

    // Save link in Redis with 24 hours expiration
    await redis.set(`joblink:${extracted.link}`, '1', { EX: 60 * 60 * 24 });
  }

  logger.info(`🎯 Finished – total saved: ${savedPosts.length}`);
  return savedPosts;
}
