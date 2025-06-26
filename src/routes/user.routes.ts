import express from 'express';
import { updateUserRole } from '../api/users/user.controller';
import { authenticate, requireAdminRole } from '../middlewares/auth.middleware';

const router = express.Router();

router.patch('/:id/role', authenticate, requireAdminRole, updateUserRole);

export default router;
