import { Router } from 'express';
import * as ctrl from '../api/keywords/keyword.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { keywordSchema, updateKeywordSchema } from '../validations/keyword.validation';
const router = Router();

router.get('/', authenticate, ctrl.getAllKeywords);
router.post('/', authenticate, validateBody(keywordSchema), ctrl.createKeyword);
router.put('/:id', authenticate, validateBody(updateKeywordSchema), ctrl.updateKeyword);
router.delete('/:id', authenticate, ctrl.deleteKeyword);

export default router;
