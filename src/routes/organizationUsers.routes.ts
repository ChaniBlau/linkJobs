import express from 'express';
import { authenticate, requireAdminRole } from '../middlewares/auth.middleware';
import { createUserByAdmin, updateUserRole } from '../api/userApi/organizationUsers';
const router = express.Router();

router.patch('/:id/role', authenticate, requireAdminRole, updateUserRole);
router.post('/', authenticate, requireAdminRole, createUserByAdmin);

export default router;