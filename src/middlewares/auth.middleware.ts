import { RequestHandler, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { BaseController } from '../api/base/base.controller';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

dotenv.config();
const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
  role: string;
  organizationId?: number;
}

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info('🔒 auth.middleware triggered');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json(BaseController.error('Unauthorized', 'Authorization header is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res
        .status(401)
        .json(BaseController.error('User not found', 'The user associated with this token does not exist'));
    }

    req.user = {
      id: decoded.id,
      role: decoded.role as Role,
      organizationId: decoded.organizationId?? null,
    };

    next();
  } catch (err) {
    logger.warn('❌ Invalid token received');
    return res
      .status(403)
      .json(BaseController.error('Invalid token', 'The provided token is invalid or expired'));
  }
};

export const requireAdminRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return res
      .status(403)
      .json(BaseController.error('Access denied', 'You do not have permission to perform this action'));
  }

  next();
};
