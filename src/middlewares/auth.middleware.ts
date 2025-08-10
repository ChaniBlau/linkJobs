// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// // מגדיר את מבנה הנתונים שמצופה מתוך הטוקן
// interface AuthPayload {
//   userId: string;
//   role: string;
// }

// // Middleware ראשי לאימות
// export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   console.log("🔥 Running authenticate middleware"); // 🔍

//   const authHeader = req.headers.authorization; // שליפת הכותרת Authorization מהבקשה

//   // בדיקה שהכותרת קיימת ומתחילה במבנה תקני "Bearer ..."
//   if (!authHeader?.startsWith('Bearer ')) {
//     console.log("⚠️ Missing or invalid token"); // 🔍
//     res.status(401).json({ error: 'Missing or invalid token' });
//     return;
// import { RequestHandler, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { Role, PrismaClient } from '@prisma/client';
// import dotenv from 'dotenv';
// import { BaseController } from '../api/base/base.controller';
// import logger from '../utils/logger';
// import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

// dotenv.config();
// const prisma = new PrismaClient();

// interface JwtPayload {
//   id: number;
//   role: string;
//   organizationId?: number;
// }

// export const authenticate: RequestHandler = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   logger.info('🔒 auth.middleware triggered');

//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith('Bearer ')) {
//     return res
//       .status(401)
//       .json(BaseController.error('Unauthorized', 'Authorization header is missing or invalid'));
//   }

//   const token = authHeader.split(' ')[1];

//   try {
// <<<<<<< HEAD
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload; // פענוח הטוקן ובדיקת חוקיותו לפי הסוד
//     console.log("✅ Token verified:", decoded); // 🔍

//     // לשים לב סילשתי את 2 השורות הבאות בגלל הבעיה שהייתה ב־ROLE
//     // req.userId = decoded.userId;
//     // req.userRole = decoded.role;

//     next();
//   } catch (err) {
//     console.log("❌ Token verification failed"); // 🔍
//      // אם יש שגיאה – מחזירים 401
//     res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
//   }
// };
// =======
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload;

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//     });

//     if (!user) {
//       return res
//         .status(401)
//         .json(BaseController.error('User not found', 'The user associated with this token does not exist'));
//     }

//     req.user = {
//       id: decoded.id,
//       role: decoded.role as Role,
//       organizationId: decoded.organizationId ?? null,
//     };

//     next();
//   } catch (err) {
//     logger.warn('❌ Invalid token received');
//     return res
//       .status(403)
//       .json(BaseController.error('Invalid token', 'The provided token is invalid or expired'));
//   }
// };

// export const requireAdminRole = (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const user = req.user;

//   if (!user || (user.role !== 'ORG_ADMIN' && user.role !== 'SUPER_ADMIN')) {
//     return res
//       .status(403)
//       .json(BaseController.error('Access denied', 'You do not have permission to perform this action'));
//   }

//   next();
// };
// >>>>>>> origin/developer




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
  logger.info('🔥 auth.middleware triggered');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn("⚠️ Missing or invalid token");
    return res
      .status(401)
      .json(BaseController.error('Unauthorized', 'Authorization header is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as JwtPayload;
    logger.info("✅ Token verified", decoded);

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
      organizationId: decoded.organizationId ?? null,
    };

    next();
  } catch (err) {
    logger.warn('❌ Token verification failed', err);
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

