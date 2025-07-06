import prisma from '../../config/prisma';
import { JobPosting } from '@prisma/client';

export const createJobPosting = async (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
  return prisma.jobPosting.create({ data });
};
