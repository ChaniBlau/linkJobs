import { Request, Response, NextFunction } from "express";
import { filterJobPosts } from "../../services/job-filter.service";
import { BaseController } from "../base/base.controller";
import * as jobService from "../../services/job-filter.service";
import { scrapeDetectAndSaveAuto } from "../../services/job-scraper.service";

export const detectJobPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const posts: string[] = req.body.posts;

    if (!userId || !Array.isArray(posts)) {
      return res.status(400).json(
        BaseController.error("Invalid input: 'userId' and 'posts[]' are required.")
      );
    }

    const result = await filterJobPosts(posts, userId);

    return res.status(200).json(
      BaseController.success("Job posts detected successfully", result)
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      BaseController.error("Failed to process job post detection", error)
    );
  }
};

export const createJobPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, company, description, link, location, postingDate, language, organizationId, groupId } = req.body;

    const jobPost = await jobService.saveJobPost({
      title,
      company,
      description,
      link,
      location,
      postingDate: new Date(postingDate),
      language,
      organizationId,
      groupId,
    });

    res.status(201).json(
      BaseController.success("Job post created successfully", jobPost)
    );
  } catch (error) {
    next(error);
  }
};

export const scrapeJobsHandler = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;

    const result = await scrapeDetectAndSaveAuto(groupId, userId);

    res.status(200).json({
      message: `Saved ${result.length} job posts`,
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json(
      BaseController.error("Failed to scrape and save job posts", err.message)
    );
  }
};
