import { RequestHandler, Express } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
export interface AuthenticatedUser {
  id: number;
  role: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthenticatedUser;
}

export const authenticate: RequestHandler = (req, res, next) => {
  logger.info("🔒 auth.middleware triggered");
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as {
      userId: number;
      role: string;
    };

    (req as AuthenticatedRequest).user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
    return;
  } catch {
    res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
    return;
  }
};
