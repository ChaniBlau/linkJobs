import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const payload = {
  id: 1,
  role: 'ORG_ADMIN',
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in .env");
  process.exit(1);
}

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '9h' });

console.log("🔑 Generated JWT:\n", token);
