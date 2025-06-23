import { Router } from 'express';
import { getAllJobs } from '../api/jobs/jobs.controller'
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllJobs);

export default router;
