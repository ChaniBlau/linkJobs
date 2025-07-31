import { Router } from 'express';
import { authenticate } from '../middlewares/group.middleware';
import {
  createGroup,
  updateGroup,
  deleteGroup,
  listAllGroups,
  joinGroup,
  leaveGroup,
  listUserGroups,
} from '../api/group.controller';

const router = Router();

// כל המסלולים דורשים אימות (JWT)
router.use(authenticate);

// קבוצה חדשה (SUPER_ADMIN בלבד)
router.post('/', createGroup);

// עדכון קבוצה (SUPER_ADMIN בלבד)
router.put('/:id', updateGroup);

// מחיקת קבוצה (SUPER_ADMIN בלבד)
router.delete('/:id', deleteGroup);

// שליפת כל הקבוצות (לכל משתמש רשום)
router.get('/', listAllGroups);

// שליפת הקבוצות של המשתמש המחובר
router.get('/my', listUserGroups);

// הצטרפות לקבוצה
router.post('/:groupId/join', joinGroup);

// עזיבת קבוצה
router.delete('/:groupId/leave', leaveGroup);

export default router;
