import { Router } from "express";
import { scrapeQueue } from "../queue/scrapeQueue";
import {
  detectJobPosts,
  createJobPost,
  scrapeJobsHandler
} from "../api/jobs/job.controller";
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// detect job posts from according to the provided keywords - for testing purposes
router.post("/detect",authenticate, detectJobPosts);

// create a new job post by manually entering details - for testing purposes
router.post("/",authenticate, createJobPost);

// scrape job posts from LinkedIn group and save them to the database
router.post("/scrape-detect",authenticate, scrapeJobsHandler);

router.post('/:id/scrape-now', async (req, res) => {
  const groupId = Number(req.params.id);
  await scrapeQueue.add('scrape-group', { groupId });
  res.status(200).json({ message: `Scrape job added for group ${groupId}` });
});


export default router;
