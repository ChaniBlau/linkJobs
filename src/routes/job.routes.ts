import { Router } from "express";
import { detectJobPosts } from "../api/jobs/job.controller";

const router = Router();

router.post("/detect", detectJobPosts);

export default router;
