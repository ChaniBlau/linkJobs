import prisma from "../config/prisma";
import { isJobPost } from "./nlp.service";
import * as jobRepository from "../repositories/jobs/job.repository";
import { JobPosting } from "@prisma/client";
import logger from '../utils/logger';
import redis from "../config/redis";
/**
 * Saves a single job post to the database.
 *
 * @param data - Partial job post data, excluding auto-managed fields
 * @returns The created JobPosting object
 */
export const saveJobPost = async (
  data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
): Promise<JobPosting> => {
  const alreadySaved = await redis.get(`joblink:${data.link}`);
  if (alreadySaved) {
    logger.warn(`🛑 Detected in Redis: ${data.link}`);
    throw new Error(`Duplicate job post (from Redis)`);
  }

  const existing = await prisma.jobPosting.findFirst({
    where: { link: data.link }
  });

  if (existing) {
    logger.warn(`🔁 saveJobPost: Duplicate job link detected – ${data.link}`);
    throw new Error(`A job post with this link already exists`);
  }

  const saved = await jobRepository.createJobPosting(data);
  logger.info(`💾 Job saved successfully: ${saved.title} at ${saved.company}`);

  await redis.set(`joblink:${data.link}`, '1', { EX: 60 * 60 * 24 });
 
  return saved;
};