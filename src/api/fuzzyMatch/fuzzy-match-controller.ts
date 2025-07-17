import { Request, Response } from 'express';
import { searchJobsByKeywords } from '../../services/job-search.service';
import logger from '../../utils/logger';

/**
 * Controller to search job posts based on user keywords
 */
export const searchJobsByKeywordsController = async (req: Request, res: Response) => {
  const userId = parseInt(req.query.userId as string);  // Assuming userId comes as query parameter
  const { daysRange, minScore } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const jobs = await searchJobsByKeywords(userId, {
      daysRange: daysRange ? parseInt(daysRange as string) : 7,
      minScore: minScore ? parseInt(minScore as string) : 2,
    });

    return res.status(200).json({ jobs });
  } catch (error) {
    logger.error('Error while searching jobs:', error);
    return res.status(500).json({ message: 'Failed to search jobs', error });
  }
};
