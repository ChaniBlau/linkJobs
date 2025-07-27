import { Worker } from 'bullmq';
import { redisConnection } from '../utils/redisConnection';
import { scrapeDetectAndSaveAuto } from '../services/job-scraper.service';
import logger from '../utils/logger';

export const scrapeWorker = new Worker(
  'scrape-jobs',
  async (job) => {
    const { groupId } = job.data;
    logger.info(`🔧 Worker: scraping group ${groupId}`);
    await scrapeDetectAndSaveAuto(groupId);
  },
  { connection: redisConnection }
);
