import cron from 'node-cron';
import { DateTime } from 'luxon';
import prisma from '../config/prisma';

import { scrapeQueue } from '../queue/scrapeQueue';
import logger from '../utils/logger';

/**
 * תזמון דינאמי לפי אזור זמן לכל קבוצה
 */
export async function scheduleTimezoneBasedScraping() {
  // רץ פעם בחצי שעה כדי לבדוק מי צריך להיכנס לתור עכשיו
  cron.schedule('*/30 * * * *', async () => {
    logger.info('🕐 Checking which groups to schedule based on timezone');

    const nowUtc = DateTime.utc();

    // שליפת קבוצות עם שעת יעד ואזור זמן
    const groups = await prisma.group.findMany({
      where: { status: 'ACTIVE', scheduledHour: { not: null }, timezone: { not: null } },
      select: { id: true, scheduledHour: true, timezone: true },
    });

    for (const group of groups) {
      const localTime = nowUtc.setZone(group.timezone!);
      const hourNow = localTime.hour;

      if (hourNow === group.scheduledHour) {
        logger.info(`📆 Adding group ${group.id} to scraping queue`);

        await scrapeQueue.add('scrape-group', { groupId: group.id });
      }
    }
  });
}
