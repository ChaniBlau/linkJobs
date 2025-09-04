import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authorize } from './middlewares/authorize.middleware';
import { startEmailConsumer } from './queues/consumers/email.consumer';

import organizationRoutes from './routes/organization.routes';
import groupRoutes from './routes/group.routes';
import organizationUsersRoutes from './routes/organizationUsers.routes';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import keywordRoutes from './routes/keyword.routes';
import licenseRoutes from './routes/license.routes';
import analyticsRoutes from './routes/analytics.routes';

import { authenticate } from './middlewares/auth.middleware';
import loggerMiddleware from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();
const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/organization-users', organizationUsersRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/keywords', authenticate, keywordRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted!' });
});

app.get('/api/admin-data', authenticate, authorize(['SUPER_ADMIN', 'ORG_ADMIN']), (req, res) => {
  res.json({ message: 'Admin access granted!' });
});

app.get('/health', (_, res) => res.send('Server is running'));

if (process.env.NODE_ENV === 'development') {
  app.get('/api/error', () => {
    throw new Error('Intentional error');
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use(errorHandler);

startEmailConsumer().catch(err =>
  console.error('❌ Email consumer failed to start', err)
);

export default app;
