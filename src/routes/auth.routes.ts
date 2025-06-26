import express from 'express';
import { registerUser } from '../api/auth/auth.controller';
const router = express.Router();

router.post('/register', registerUser);

export default router;