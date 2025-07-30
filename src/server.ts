import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables!');
  process.exit(1);
  }
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
