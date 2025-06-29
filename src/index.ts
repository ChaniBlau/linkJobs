import app from './app';
import logger from './utils/logger'; // ⬅️ הוספנו את הלוגר
// import './types/express/index';
// const PORT = 3000;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});

