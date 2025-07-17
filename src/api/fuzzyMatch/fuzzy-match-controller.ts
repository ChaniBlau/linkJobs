import { Request, Response } from 'express';
import { searchJobsByKeywords } from '../../services/job-search.service';
import logger from '../../utils/logger';
import prisma from '../../config/prisma';
import { BaseController } from '../base/base.controller';

/**
 * Controller to search job posts based on user keywords and optional filters
 */
export const searchJobsByKeywordsController = async (req: Request, res: Response) => {


  const userId = parseInt(req.query.userId as string);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    logger.warn(`❌ User ID ${userId} not found`);
    return res.status(404).json(BaseController.error("User not found"));
  }
  const { daysRange, minScore, fromDate: fromDateRaw, toDate: toDateRaw } = req.query;

  if (!userId) {
    logger.error('❌ User ID is required for job search');
    return res.status(400).json(BaseController.error("User ID is required"));
  }

  const fromDate = fromDateRaw ? new Date(fromDateRaw as string) : undefined;
  const toDate = toDateRaw ? new Date(toDateRaw as string) : undefined;

  // Validate date formats
  if ((fromDateRaw && fromDate instanceof Date && isNaN(fromDate.getTime())) ||
    (toDateRaw && toDate instanceof Date && isNaN(toDate.getTime()))) {
    logger.error(`❌ Invalid date format: fromDate=${fromDateRaw}, toDate=${toDateRaw}`);
    return res.status(400).json(BaseController.error("Invalid date format. Please use YYYY-MM-DD."));
  }

  try {
    const searchOptions = {
      daysRange: daysRange ? parseInt(daysRange as string) : undefined,
      minScore: minScore ? parseInt(minScore as string) : undefined,
      fromDate,
      toDate,
    };

    const jobs = await searchJobsByKeywords(userId, searchOptions);

    logger.info(`✅ Jobs fetched for user ${userId}`, {
      ...searchOptions,
      resultCount: jobs.length,
    });

    return res.status(200).json(BaseController.success("Jobs fetched successfully", jobs));
  } catch (error) {
    logger.error('❌ Error while searching jobs:', error);
    return res.status(500).json(BaseController.error("Failed to search jobs", error));
  }
};
