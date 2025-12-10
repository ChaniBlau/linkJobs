import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const loginUser = async (email: string, password: string) => {
  logger.info(`Attempting login for email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    logger.warn(`Login failed - user not found: ${email}`);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) {
    logger.warn(`Login failed - invalid password for user: ${email}`);
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      organizationId: user.organizationId 
    }, 
    process.env.JWT_SECRET || 'secret_key', 
    { expiresIn: '7d' }
  );
  
  logger.info(`Login successful for user: ${email}`);
  return { token, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
};
