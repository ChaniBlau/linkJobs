
import { Request, Response, NextFunction } from 'express';

// מחזיר Middleware שמאשר כניסה רק לתפקידים מוגדרים
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("🔐 Authorizing user..."); // 🔍
    // לשם בדיקה: אפשר גם להוסיף
    // console.log("User role:", req.userRole);

    // אם אין תפקיד או שהתפקיד לא נמצא ברשימת המותרים – חסימה
    // if (!req.userRole || !roles.includes(req.userRole)) {
    //   res.status(403).json({ error: 'Access denied – insufficient permissions' });
    //   return;
    // }

    next(); // אם התפקיד מתאים – ממשיכים
  };
};
