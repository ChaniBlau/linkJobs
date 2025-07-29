import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

app.use('/api/organization-users', organizationUsersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

app.get('/api/error', () => {
  throw new Error('Intentional error');
});

app.use(errorHandler);

export default app;

