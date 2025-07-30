import prisma from '../../config/prisma';
import { JobPosting } from '@prisma/client';
/**
 * Creates a new job posting in the database.
 * @param data - Job posting data (excluding system-managed fields)
 * @returns The created JobPosting
 */
export const createJobPosting= async (
  data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
): Promise<JobPosting> => {
  try {
    return await prisma.jobPosting.create({ data });
  } catch (error) {
    throw new Error(`❌ Failed to create job posting: ${(error as Error).message}`);
  }
};
/**
 * Finds job postings based on given filters
 * @param groupIds List of group IDs to filter by
 * @param fromDate Date range filter
 * @returns List of job postings matching filters
 */
export async function findJobPostings(groupIds: number[], fromDate: Date): Promise<JobPosting[]> {
  return prisma.jobPosting.findMany({
    where: {
      groupId: { in: groupIds },
      postingDate: { gte: fromDate },
      isArchived: false,
    },
    orderBy: { postingDate: 'desc' }
  });
}

export async function findJobPostingsByDateRange(
  groupIds: number[],
  fromDate: Date,
  toDate: Date
): Promise<JobPosting[]> {
  return prisma.jobPosting.findMany({
    where: {
      groupId: { in: groupIds },
      postingDate: { gte: fromDate, lte: toDate },
      isArchived: false,
    },
    orderBy: { postingDate: 'desc' }
  });
}