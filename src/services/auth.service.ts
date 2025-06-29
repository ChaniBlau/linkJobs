// //פונקציית בדיקת התחברות
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import logger from '../utils/logger'; // ⬅️ הוספנו את הלוגר

// const users = [
//   { id: 1, email: 'test@example.com', passwordHash: bcrypt.hashSync('123456', 10) },
// ];

// export const loginUser = async (email: string, password: string) => {
//   logger.info(`Attempting login for email: ${email}`);

//   const user = users.find(u => u.email === email);
//   if (!user) {
//     logger.warn(`Login failed - user not found: ${email}`);
//     throw new Error('User not found');
//   }

//   const isMatch = await bcrypt.compare(password, user.passwordHash);
//   if (!isMatch) {
//     logger.warn(`Login failed - invalid password for user: ${email}`);
//     throw new Error('Invalid password');
//   }

//   const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
//   logger.info(`Login successful for user: ${email}`);
//   // const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
//   return token;

  

// };



import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
// אם את משתמשת בפריזמה – החליפי את רשימת ה‑demo ב‑query אמיתי

type PublicUser = {
  id: number;
  email: string;
  passwordHash: string;
  role: string; // ⇠ הערך מגיע מה‑enum Role בפריזמה
};

// ⚠️ DEMO בלבד
const users: PublicUser[] = [
  {
    id: 1,
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'SUPER_ADMIN',
  },
];

export const loginUser = async (email: string, password: string) => {
  logger.info(`Attempting login for email: ${email}`);

  // ↙️ החליפי בשאילתה למס"ד:
  const user = users.find(u => u.email === email);
  if (!user) {
    logger.warn(`Login failed – user not found: ${email}`);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    logger.warn(`Login failed – invalid password for ${email}`);
    throw new Error('Invalid password');
  }

  // ✨ הטוקן כולל גם ROLE
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1h' },
  );

  logger.info(`Login successful for ${email}`);
  return token;
};






