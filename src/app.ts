import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import organizationRoutes from './routes/organization.routes';
import './queues/consumers/email.consumer';
import { startEmailConsumer } from './queues/consumers/email.consumer';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', organizationRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

startEmailConsumer().catch(err =>
  console.error('❌ Email consumer failed to start', err)
);

export default app;
