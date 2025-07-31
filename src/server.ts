import app from './app';
import logger from './utils/logger';
import { scheduleTimezoneBasedScraping } from './scheduler/scrapeScheduler';
import { bullBoardRouter } from './dashboard/bullDashboard';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
app.use('/admin/queues', bullBoardRouter);

app.listen(PORT, () => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables!');
    process.exit(1);
  }

  logger.info(`🚀 Server is running on http://localhost:${PORT}`);

  scheduleTimezoneBasedScraping(); 

});




