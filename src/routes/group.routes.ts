import { Router } from 'express';
import { authenticate } from '../middlewares/group.middleware';
import {
  createGroup,
  updateGroup,
  deleteGroup,
  listGroupsByOrganization
} from '../api/group.controller';

const router = Router();

router.use(authenticate); ;

router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id',deleteGroup);
router.get('/organization/:organizationId', listGroupsByOrganization);

export default router;
