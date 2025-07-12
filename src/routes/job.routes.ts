import { Router } from "express";
import {
  detectJobPosts,
  createJobPost,
  scrapeJobsHandler
} from "../api/jobs/job.controller";

const router = Router();

// detect job posts from according to the provided keywords - for testing purposes
router.post("/detect", detectJobPosts);

// create a new job post by manually entering details - for testing purposes
router.post("/", createJobPost);

// scrape job posts from LinkedIn group and save them to the database
router.post("/scrape-detect", scrapeJobsHandler);

export default router;
