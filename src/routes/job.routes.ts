import { Router } from "express";
import { detectJobPosts } from "../api/jobs/job.controller";
import * as jobController from "../api/jobs/job.controller";

const router = Router();

router.post("/detect", detectJobPosts);
router.post('/', jobController.createJobPost);
router.post('/scrape-detect', jobController.scrapeJobsHandler);

export default router;
