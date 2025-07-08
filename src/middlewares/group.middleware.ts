import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

interface JwtPayload {
  id: number;
  role: Role;
  organizationId?: number; // ← הוספנו את השדה הזה
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // הצמדת מידע המשתמש המבוסס JWT ל־req.user
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role,
      organizationId: decoded.organizationId ?? null, // ← כדי למנוע undefined
    };

    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
