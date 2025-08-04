import { Router } from 'express';
import {
  createLicense,
  getLicenseByOrgId,
  updateLicense,
  getLicenseUsageStatus,
} from '../api/licenses/license.controller';

import { authenticate, requireAdminRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, requireAdminRole, createLicense);

router.get('/:orgId', authenticate, getLicenseByOrgId);

router.patch('/:id', authenticate, requireAdminRole, updateLicense);

router.get('/:orgId/usage', authenticate, getLicenseUsageStatus);

export default router;
