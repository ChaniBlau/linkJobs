import { Queue } from 'bullmq';
import { redisConnection } from '../utils/redisConnection';

export const scrapeQueue = new Queue('scrape-jobs', {
  connection: redisConnection,
});
