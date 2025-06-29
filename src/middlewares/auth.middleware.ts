// // // import { Request, Response, NextFunction } from 'express';
// // // import jwt from 'jsonwebtoken';

// // // // מגדיר את מבנה הנתונים שמצופה מתוך הטוקן
// // // interface AuthPayload {
// // //   userId: string;
// // //   role: string;
// // // }

// // // // Middleware ראשי לאימות
// // // export const authenticate = (req: Request, res: Response, next: NextFunction) => {
// // //   console.log("🔥 Running authenticate middleware"); // 🔍

// // //   const authHeader = req.headers.authorization; // שליפת הכותרת Authorization מהבקשה

// // //   // בדיקה שהכותרת קיימת ומתחילה במבנה תקני "Bearer ..."
// // //   if (!authHeader?.startsWith('Bearer ')) {
// // //     console.log("⚠️ Missing or invalid token"); // 🔍
// // //     res.status(401).json({ error: 'Missing or invalid token' });
// // //     return;
// // //   }

// // //   const token = authHeader.split(' ')[1];

// // //   try {
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload; // פענוח הטוקן ובדיקת חוקיותו לפי הסוד
// // //     console.log("✅ Token verified:", decoded); // 🔍

// // //     // לשים לב סילשתי את 2 השורות הבאות בגלל הבעיה שהייתה ב־ROLE
// // //     // req.userId = decoded.userId;
// // //     // req.userRole = decoded.role;

// // //     next();
// // //   } catch (err) {
// // //     console.log("❌ Token verification failed"); // 🔍
// // //      // אם יש שגיאה – מחזירים 401
// // //     res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
// // //   }
// // // };






// // import { Request, Response, NextFunction } from 'express';
// // import jwt from 'jsonwebtoken';

// // export interface AuthenticatedUser {
// //   id: number;
// //   role: string;
// // }

// // export interface AuthenticatedRequest extends Request {
// //   user?: AuthenticatedUser;
// // }

// // export const authenticate = (req: Request, res: Response, next: NextFunction) => {
// //   const authHeader = req.headers.authorization;

// //   if (!authHeader?.startsWith('Bearer ')) {
// //     return res.status(401).json({ error: 'Missing or invalid token' });
// //   }

// //   const token = authHeader.split(' ')[1];

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as {
// //       userId: number;
// //       role: string;
// //     };

// //     (req as AuthenticatedRequest).user = {
// //       id: decoded.userId,
// //       role: decoded.role,
// //     };

// //     next();
// //   } catch {
// //     return res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
// //   }
// // };





// // auth.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export interface AuthenticatedUser {
//   id: number;
//   role: string;
// }

// export interface AuthenticatedRequest extends Request {
//   user?: AuthenticatedUser;
// }
// export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

// // export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader?.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Missing or invalid token' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as {
//       userId: number;
//       role: string;
//     };

//     (req as AuthenticatedRequest).user = {
//       id: decoded.userId,
//       role: decoded.role,
//     };

//     next();
//   } catch {
//     return res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
//   }
// };

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: number;
  role: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthenticatedUser;
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;                     // ← מחזיר void
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
    return;                     // ← גם כאן מחזיר void
  } catch {
    res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
    return;                     // ← שוב, מחזיר void
  }
};
