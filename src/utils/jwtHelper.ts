import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (payload: {
  id: number;
  role: string;
  organizationId: number | null;
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
};
console.log(generateToken({ id: 1, role: 'ORG_ADMIN', organizationId: 1 }));