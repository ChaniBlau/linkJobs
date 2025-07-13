import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export function generateToken(userId: number, role: string): string {
  const token = jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET || 'secret_key', // ודאי שהסוד תואם למה שמוגדר ב־auth.middleware.ts
    { expiresIn: '10h' } // טוקן שפג תוקפו אחרי שעה
  );

  return token;
}

const token = generateToken(1, 'ORG_ADMIN');
console.log('Your token:', token);