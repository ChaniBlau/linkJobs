import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import keywordRoutes from './routes/keyword.routes';
import { authenticate } from './middlewares/auth.middleware';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/keywords',authenticate, keywordRoutes);


app.get('/health', (req, res) => {
  res.send('Server is running');
});

export default app;
