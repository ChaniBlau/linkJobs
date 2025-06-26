import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import jwt from 'jsonwebtoken';
import { Role, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
  role: string;
  organizationId: number;
}

export const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (
      user.role !== decoded.role ||
      user.organizationId !== decoded.organizationId
    ) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role as Role,
      organizationId: decoded.organizationId,
    };

    return next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};



export const requireAdminRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    res.status(403).json({ message: 'Insufficient permissions' });
    return;
  }

  next();
};