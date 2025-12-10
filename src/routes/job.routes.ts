import { Router } from "express";
import { detectJobPosts } from "../api/jobs/job.controller";

const router = Router();

router.post("/detect", detectJobPosts);
import { Router } from 'express';
import { getAllJobs } from '../api/jobs/jobs.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { scrapeQueue } from "../queues/scrapeQueue";
import {
  detectJobPosts,
  createJobPost,
  scrapeJobsHandler
} from "../api/jobs/job.controller";
import { searchJobsByKeywordsController } from "../api/fuzzyMatch/fuzzy-match-controller";

const router = Router();

// מהצד הראשון - קריאת כל המשרות
router.get('/', authenticate, getAllJobs);

// מהצד השני - קריאת נתיבים חדשים:
router.post("/detect", authenticate, detectJobPosts);
router.post("/", authenticate, createJobPost);
router.post("/scrape-detect", authenticate, scrapeJobsHandler);

router.post('/:id/scrape-now', async (req, res) => {
  const groupId = Number(req.params.id);
  await scrapeQueue.add('scrape-group', { groupId });
  res.status(200).json({ message: `Scrape job added for group ${groupId}` });
});

router.get('/search', authenticate, searchJobsByKeywordsController);

export default router;
