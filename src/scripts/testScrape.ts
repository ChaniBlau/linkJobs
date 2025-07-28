import { scrapeDetectAndSaveAuto } from '../services/job-scraper.service';
import prisma from '../config/prisma';
import logger from '../utils/logger';

async function test() {
  const testGroup = await prisma.group.findFirst({ where: { status: 'ACTIVE' } });

  if (!testGroup) {
    console.log('❌ No active groups found');
    return;
  }

  const result = await scrapeDetectAndSaveAuto(testGroup.id);

  logger.info(`🧪 Test scrape finished. Saved ${result.length} job(s)`);
}

test();
