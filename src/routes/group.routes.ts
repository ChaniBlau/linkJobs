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
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authenticate, authorize(['SUPER_ADMIN']), createGroup);
router.put('/:id',authenticate, authorize(['SUPER_ADMIN']), updateGroup);
router.delete('/:id',authenticate,authorize(['SUPER_ADMIN']), deleteGroup);
router.get('/', listAllGroups);
router.get('/my', listUserGroups);
router.post('/:groupId/join', joinGroup);
router.delete('/:groupId/leave', leaveGroup);

export default router;
