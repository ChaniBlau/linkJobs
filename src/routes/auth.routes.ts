import express from 'express';
import { registerNewUser } from '../api/userApi/auth.controller';

const router = express.Router();

router.post('/register', registerNewUser);

export default router;
