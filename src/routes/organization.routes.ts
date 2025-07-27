import express from 'express';
import * as organizationController from '../api/organization/organization.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();
router.post('/organizations/:orgId/users/invite',authenticate, organizationController.inviteUserByEmail);
// router.post(
//   '/:orgId/invite',
//   authenticate,
//   organizationController.inviteUserByEmail
// );

router.put(
  '/:orgId/users/:userId/role',
  authenticate,
  organizationController.updateUserRole
);

router.delete(
  '/:orgId/users/:userId',
  authenticate,
  organizationController.removeUserFromOrg
);

router.get(
  '/:orgId/users',
  authenticate,
  organizationController.getOrgUsers
);

export default router;
