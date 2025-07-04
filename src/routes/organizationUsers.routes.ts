import express from 'express';
import { authenticate, requireAdminRole } from '../middlewares/auth.middleware';
import { createUserByAdmin, updateUserRole } from '../api/organizationUsers/organizationUsers.controller.ts';
const router = express.Router();

router.patch('/:id/role', authenticate, requireAdminRole, updateUserRole);
router.post('/', authenticate, requireAdminRole, createUserByAdmin);

export default router;