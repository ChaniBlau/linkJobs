import prisma from '../../config/prisma';
import { JobPosting } from '@prisma/client';

export const createJobPosting = async (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
  return prisma.jobPosting.create({ data });
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