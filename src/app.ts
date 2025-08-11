import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// import * as cors from 'cors';

import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import organizationRoutes from './routes/organization.routes';
import groupRoutes from './routes/group.routes';
import organizationUsersRoutes from './routes/organizationUsers.routes';
import keywordRoutes from './routes/keyword.routes';
import licenseRoutes from './routes/license.routes';
import loggerMiddleware from './middlewares/logger.middleware';
import { authenticate } from './middlewares/auth.middleware';
import { authorize } from './middlewares/authorize.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

import './queues/consumers/email.consumer';
import { startEmailConsumer } from './queues/consumers/email.consumer';

dotenv.config();

const app = express();

// Middleware כללי
app.use(loggerMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// נתיבים - Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/orgs', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/organization-users', organizationUsersRoutes);
app.use('/api/keywords', authenticate, keywordRoutes);
app.use('/api/licenses', licenseRoutes);

// דוגמאות נתיבים עם אימות והרשאה
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted!' });
});

app.get('/api/admin-data', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin access granted!' });
});

// בדיקת בריאות השרת
app.get('/health', (req, res) => {
  res.send('Server is running');
});

// התחל צרכן מייל
startEmailConsumer().catch(err =>
  console.error('❌ Email consumer failed to start', err)
);

// נתיב שמדמה שגיאה לבדיקת errorHandler
app.get('/api/error', () => {
  throw new Error('Intentional error');
});

// Middleware לטיפול בשגיאות
app.use(errorHandler);

export default app;
