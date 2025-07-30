import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
dotenv.config(); 
const token = jwt.sign(
  { id: 3, role: 'VIEWER' }, 
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

console.log('JWT:', token);