import app from './app';
import logger from './utils/logger';
import { scheduleTimezoneBasedScraping } from './scheduler/scrapeScheduler';
import { scrapeWorker } from './queue/scrapeWorker'; // טעינה בלבד – לא להריץ ידנית

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables!');
    process.exit(1);
  }

  logger.info(`🚀 Server is running on http://localhost:${PORT}`);

  // ✅ הפעלת תזמון סריקות לפי אזור זמן
  scheduleTimezoneBasedScraping();

  // 🧠 אין צורך לקרוא ל־scrapeWorker – הייבוא עצמו מפעיל אותו
});
