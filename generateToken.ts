import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn:7 * 24 * 60 * 60 }); // Token valid for 7 days
}


const token = generateToken({ id: 6, role: 'ORG_ADMIN', organizationId: 1 });
console.log('Generated Token:', token);