import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

interface JwtPayload {
  id: number;
  role: string;
  organizationId: number;
}

export const authenticate: RequestHandler = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not defined');
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role as Role,
    };

    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
