import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jobRoutes from "./routes/job.routes";

dotenv.config();
const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/jobs", jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/organization-users', organizationUsersRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/keywords', authenticate, keywordRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

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
