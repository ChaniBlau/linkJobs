
// // import { Request, Response, NextFunction } from 'express';

// // // מחזיר Middleware שמאשר כניסה רק לתפקידים מוגדרים
// // export const authorize = (roles: string[]) => {
// //   return (req: Request, res: Response, next: NextFunction) => {
// //     console.log("🔐 Authorizing user..."); // 🔍
// //     // לשם בדיקה: אפשר גם להוסיף
// //     // console.log("User role:", req.userRole);

// //     // אם אין תפקיד או שהתפקיד לא נמצא ברשימת המותרים – חסימה
// //     // if (!req.userRole || !roles.includes(req.userRole)) {
// //     //   res.status(403).json({ error: 'Access denied – insufficient permissions' });
// //     //   return;
// //     // }

// //     next(); // אם התפקיד מתאים – ממשיכים
// //   };
// // };



// import { Response, NextFunction } from 'express';
// import { AuthenticatedRequest } from './auth.middleware';

// /**
//  * מחזיר Middleware שמאשר גישה רק אם תפקיד המשתמש נמצא ברשימה
//  */
// export const authorize = (roles: string[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const user = req.user;

//     if (!user || !roles.includes(user.role)) {
//       return res.status(403).json({ error: 'Access denied – insufficient permissions' });
//     }

//     next();
//   };
// };


// authorize.middleware.ts
import { RequestHandler } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const authorize = (roles: string[]): RequestHandler =>
  (req, res, next) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
       res.status(403).json({ error: 'Access denied – insufficient permissions' });
    }
    return;
  };
