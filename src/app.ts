import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import organizationRoutes from './routes/organization.routes';
import './queues/consumers/email.consumer';
import { startEmailConsumer } from './queues/consumers/email.consumer';
import keywordRoutes from './routes/keyword.routes';
import { authenticate } from './middlewares/auth.middleware';
import groupRoutes from './routes/group.routes';
import organizationUsersRoutes from './routes/organizationUsers.routes';
import authRoutes from './routes/auth.routes';
import jobRoutes from '../src/routes/job.routes';
import loggerMiddleware from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';



dotenv.config();
const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/organization-users', organizationUsersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/keywords',authenticate, keywordRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

startEmailConsumer().catch(err =>
  console.error('❌ Email consumer failed to start', err)
);

app.get('/api/error', () => {
  throw new Error('Intentional error');
});

app.use(errorHandler);

export default app;

