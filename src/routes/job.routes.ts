import { Router } from "express";
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


export default router;
