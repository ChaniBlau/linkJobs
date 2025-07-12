import { scrapeLinkedInGroupPosts } from '../scrapers/linkedin-group.scraper';
import { isJobPost } from './nlp.service';
import { extractJobDataFromText } from './extract-job-data.service';
import { createJobPosting } from '../repositories/jobs/job.repository';
import prisma from '../config/prisma';
import { JobPosting } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Scrapes job posts from a LinkedIn group, detects relevant posts using NLP,
 * extracts job data, and saves them to the database.
 */
export async function scrapeDetectAndSaveAuto(
  groupId: number,
  userId: number
): Promise<JobPosting[]> {
  logger.info(`🟢 Starting scrapeDetectAndSaveAuto for group ${groupId}, user ${userId}`);
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) {
    logger.warn(`⚠️ Group with ID ${groupId} not found`);
    throw new Error(`Group with ID ${groupId} not found`);
  }
  logger.info(`🔗 Found group URL: ${group.linkedinUrl}`);

  const groupUrl = group.linkedinUrl;
  const email = process.env.LINKEDIN_EMAIL || '';
  const password = process.env.LINKEDIN_PASSWORD || '';

  if (!email || !password) {
    logger.error(`❌ Missing LinkedIn credentials`);
    throw new Error(`Missing LinkedIn credentials in environment variables`);
  }

  //Scrape posts from LinkedIn group
  logger.info(`🌐 Scraping posts from LinkedIn group ${groupId}`);
  const rawPosts = await scrapeLinkedInGroupPosts(groupUrl, email, password);

  if (!rawPosts.length) {
    logger.warn(`📭 No posts found in group ${groupId}`);
    return [];
  }
  logger.info(`📦 Retrieved ${rawPosts.length} raw posts`);

  //Load user keywords for filtering
  const keywords = await prisma.keyword.findMany({
    where: { userId }
  });

  if (!keywords.length) {
    logger.warn(`⚠️ User ${userId} has no keywords`);
    return [];
  }
  logger.info(`🔑 Loaded ${keywords.length} keywords for user ${userId}`);
  // select existing posts to avoid duplicates
  const existingPosts = await prisma.jobPosting.findMany({
    where: {
      link: {
        in: rawPosts
          .map(post => extractJobDataFromText(post)?.link)
          .filter((link): link is string => Boolean(link))
      }
    },
    select: { link: true }
  });

  const existingLinks = new Set(existingPosts.map(p => p.link));
  const savedPosts: JobPosting[] = [];

  // start processing each post
  for (const postText of rawPosts) {
    // filter job posts using NLP
    if (!isJobPost(postText, keywords)) {
      logger.info(`⛔ Post skipped – did not match keywords`);
      continue;
    }


    // extract job data from the post text
    const extracted = extractJobDataFromText(postText);

    if (
      !extracted?.title ||
      !extracted?.company ||
      !extracted?.link ||
      !extracted?.description ||
      !extracted?.postingDate
    ) {
      logger.warn(`⚠️ Post matched keywords but missing required fields – skipping`);
      continue;
    }

    // check if the post already saved
    if (existingLinks.has(extracted.link)) {
      logger.info(`🔁 Duplicate post detected – skipping: ${extracted.link}`);
      continue;
    }

    // save the job post to the database
    const saved = await createJobPosting({
      title: extracted.title,
      company: extracted.company,
      description: extracted.description,
      link: extracted.link,
      location: extracted.location ?? null,
      postingDate: extracted.postingDate,
      language: extracted.language ?? null,
      groupId
    });
    logger.info(`✅ Saved job: ${saved.title} at ${saved.company}`);

    savedPosts.push(saved);
    existingLinks.add(extracted.link);
  }
  logger.info(`🎯 Finished saving ${savedPosts.length} job posts`);
  return savedPosts;
}
