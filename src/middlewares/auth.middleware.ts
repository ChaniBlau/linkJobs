import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// מגדיר את מבנה הנתונים שמצופה מתוך הטוקן
interface AuthPayload {
  userId: string;
  role: string;
}

// Middleware ראשי לאימות
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔥 Running authenticate middleware"); // 🔍

  const authHeader = req.headers.authorization; // שליפת הכותרת Authorization מהבקשה

  // בדיקה שהכותרת קיימת ומתחילה במבנה תקני "Bearer ..."
  if (!authHeader?.startsWith('Bearer ')) {
    console.log("⚠️ Missing or invalid token"); // 🔍
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload; // פענוח הטוקן ובדיקת חוקיותו לפי הסוד
    console.log("✅ Token verified:", decoded); // 🔍

    // לשים לב סילשתי את 2 השורות הבאות בגלל הבעיה שהייתה ב־ROLE
    // req.userId = decoded.userId;
    // req.userRole = decoded.role;

    next();
  } catch (err) {
    console.log("❌ Token verification failed"); // 🔍
     // אם יש שגיאה – מחזירים 401
    res.status(401).json({ error: 'Unauthorized – token invalid or expired' });
  }
};
