import { Request, Response, NextFunction } from "express";
import { filterJobPosts, saveJobPost } from "../../services/job-filter.service";
import { scrapeDetectAndSaveAuto } from "../../services/job-scraper.service";
import { BaseController } from "../base/base.controller";

/**
 * Identifies which posts include job offers based on user keywords
 */
export const detectJobPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const rawPosts: string[] = req.body.posts;

    if (!userId || !Array.isArray(rawPosts)) {
      return res.status(400).json(
        BaseController.error("Invalid input: 'userId' and 'posts[]' are required.")
      );
    }

    const filteredPosts = await filterJobPosts(rawPosts, userId);

    return res.status(200).json(
      BaseController.success("Job posts detected successfully", filteredPosts)
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      BaseController.error("Failed to process job post detection", error)
    );
  }
};

/**
 * Manually create a job post by entering details
 * This is primarily for testing purposes
 */
export const createJobPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      company,
      description,
      link,
      location,
      postingDate,
      language,
      groupId,
    } = req.body;

    if (!title || !company || !description || !link || !postingDate || !groupId) {
      return res.status(400).json(
        BaseController.error("Missing required fields for job post creation.")
      );
    }

    const jobPost = await saveJobPost({
      title,
      company,
      description,
      link,
      location,
      postingDate: new Date(postingDate),
      language,
      groupId,
    });

    return res.status(201).json(
      BaseController.success("Job post created successfully", jobPost)
    );
  } catch (error: any) {
    console.error("Error creating job post:", error);

    const errorMessage =
      error?.code === 'P2002'
        ? 'Duplicate job link - this job post already exists'
        : error?.message || 'Unknown error';

    return res.status(500).json(
      BaseController.error("Failed to create job post", errorMessage)
    );
  }
};

/**
 * Scrapes job posts from a LinkedIn group and saves them to the database
 * this is the main entry point for scraping jobs
 */
export const scrapeJobsHandler = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json(
        BaseController.error("Missing 'groupId' or 'userId'")
      );
    }

    const savedPosts = await scrapeDetectAndSaveAuto(groupId, userId);

    return res.status(200).json(
      BaseController.success(`Saved ${savedPosts.length} job posts`, savedPosts)
    );
  } catch (error: any) {
    console.error(error);
    return res.status(500).json(
      BaseController.error("Failed to scrape and save job posts", error?.message || error)
    );
  }
};
