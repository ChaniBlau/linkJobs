// //פונקציית בדיקת התחברות
// // src/auth/auth.service.ts
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// // דוגמה זמנית: משתמשים "קבועים"
// const users = [
//   { id: 1, email: 'test@example.com', passwordHash: bcrypt.hashSync('123456', 10) },
// ];

// export const loginUser = async (email: string, password: string) => {
//   const user = users.find(u => u.email === email);
//   if (!user) throw new Error('User not found');

//   const isMatch = await bcrypt.compare(password, user.passwordHash);
//   if (!isMatch) throw new Error('Invalid password');

//   const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
//   return token;
// };
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger'; // ⬅️ הוספנו את הלוגר

const users = [
  { id: 1, email: 'test@example.com', passwordHash: bcrypt.hashSync('123456', 10) },
];

export const loginUser = async (email: string, password: string) => {
  logger.info(`Attempting login for email: ${email}`);

  const user = users.find(u => u.email === email);
  if (!user) {
    logger.warn(`Login failed - user not found: ${email}`);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    logger.warn(`Login failed - invalid password for user: ${email}`);
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
  logger.info(`Login successful for user: ${email}`);
  return token;
};
