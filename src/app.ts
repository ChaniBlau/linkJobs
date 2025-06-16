// src/app.ts
import express from 'express';
import authRoutes from './auth/auth.router';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

export default app;
