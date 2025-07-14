import prisma from "../config/prisma";
import { isJobPost } from "./nlp.service";
import * as jobRepository from "../repositories/jobs/job.repository";
import { JobPosting } from "@prisma/client";
import logger from '../utils/logger';

// /**
//  * Filters raw LinkedIn posts and returns only those that match job-related keywords
//  * for the given user.
//  *
//  * @param rawPosts - Array of raw post texts (usually scraped from LinkedIn)
//  * @param userId - The user ID whose keywords will be used for filtering
//  * @returns Array of post texts identified as job posts
//  */
// export async function filterJobPosts(rawPosts: string[], userId: number): Promise<string[]> {
//   if (!rawPosts.length) {
//     logger.warn(`⚠️ filterJobPosts: Received empty post list for user ${userId}`);
//     return [];
//   }
//   const keywords = await prisma.keyword.findMany({ where: { userId } });

//   if (!keywords.length) {
//     logger.warn(`⚠️ filterJobPosts: No keywords found for user ${userId}`);
//     return [];
//   }

//   const filtered = rawPosts.filter(post => isJobPost(post, keywords));
//   logger.info(`✅ filterJobPosts: Found ${filtered.length} relevant posts for user ${userId}`);
//   return filtered;
// }

/**
 * Saves a single job post to the database.
 *
 * @param data - Partial job post data, excluding auto-managed fields
 * @returns The created JobPosting object
 */
export const saveJobPost = async (
  data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
): Promise<JobPosting> => {
  const existing = await prisma.jobPosting.findFirst({
    where: { link: data.link }
  });

  if (existing) {
    logger.warn(`🔁 saveJobPost: Duplicate job link detected – ${data.link}`);
    throw new Error(`A job post with this link already exists`);
  }

  const saved = await jobRepository.createJobPosting(data);
  logger.info(`💾 Job saved successfully: ${saved.title} at ${saved.company}`);
  return saved;
};