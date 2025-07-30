import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn:7 * 24 * 60 * 60 }); // Token valid for 7 days
}


const token = generateToken({ userId: 7, role: 'VIEWER' });
console.log('Generated Token:', token);