import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request - Method: ${req.method}, URL: ${req.url}`);
  next(); 
};

export default loggerMiddleware;
