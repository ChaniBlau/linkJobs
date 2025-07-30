import prisma from "../config/prisma";
import { isJobPost } from "./nlp.service";
import * as jobRepository from "../repositories/jobs/job.repository";
import { JobPosting } from "@prisma/client";
import logger from '../utils/logger';
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