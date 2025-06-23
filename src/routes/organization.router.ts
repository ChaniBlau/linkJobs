// src/orgs/orgs.router.ts
import { Router } from 'express';
import { registerOrg } from '../api/organizations/organization.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authenticate, registerOrg);

export default router;
