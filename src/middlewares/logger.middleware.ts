import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Middleware שרושם כל בקשה לשרת
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request - Method: ${req.method}, URL: ${req.url}`);
  next(); // ממשיך ל-Middleware הבא או ל-route handler
};

export default loggerMiddleware;
