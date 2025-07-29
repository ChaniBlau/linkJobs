import express from 'express';
import * as organizationController from '../api/organization/organization.controller';
import { authenticate } from '../middlewares/auth.middleware';
import * as joinRequestController from '../api/organization/joinRequest.controller';

const router = express.Router();
router.post('/organizations/:orgId/users/invite',authenticate, organizationController.inviteUserByEmail);

router.put(
  '/organizations/:orgId/users/:userId/role',
  authenticate,
  organizationController.updateUserRole
);

router.delete(
  '/organizations/:orgId/users/:userId',
  authenticate,
  organizationController.removeUserFromOrg
);

router.get(
  '/organizations/:orgId/users',
  authenticate,                       
  organizationController.getOrgUsers    
);

// 📝 1. הגשת בקשה להצטרפות לארגון
// POST /api/organizations/123/join-requests
// Body: { "requestMessage": "אני רוצה להצטרף לארגון..." }
router.post(
  '/organizations/:orgId/join-requests',
  authenticate,                              // בדיקה שהמשתמש מחובר
  joinRequestController.submitJoinRequest    // הפונקציה שמטפלת בהגשת הבקשה
);

router.get(
  '/organizations/:orgId/join-requests',
  authenticate,                                    // בדיקה שהמשתמש מחובר
  joinRequestController.getPendingJoinRequests     // הפונקציה שמחזירה בקשות ממתינות
);

// ✅❌ 3. מענה לבקשת הצטרפות (אישור או דחיה)
// PUT /api/organizations/123/join-requests/456
// Body: { "decision": "APPROVED", "adminResponse": "ברוך הבא!" }
router.put(
  '/organizations/:orgId/join-requests/:requestId',
  authenticate,                                   // בדיקה שהמשתמש מחובר
  joinRequestController.respondToJoinRequest      // הפונקציה שמטפלת באישור/דחיה
);

export default router;
