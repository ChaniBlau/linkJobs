import { Request, Response, NextFunction } from "express";
import { saveJobPost } from "../../services/job-filter.service";
import { scrapeDetectAndSaveAuto } from "../../services/job-scraper.service";
import { BaseController } from "../base/base.controller";
import { Keyword } from "@prisma/client";
import prisma from "../../config/prisma";
import logger from '../../utils/logger';
import { isJobPost } from "../../services/nlp.service";
/**
 * Identifies which posts include job offers based on user keywords
 */
export const detectJobPosts = async (req: Request, res: Response) => {
  try {
    const rawPosts: string[] = req.body.posts;
    logger.info(`🔍 detectJobPosts called with ${rawPosts?.length || 0} posts`);

    if (!Array.isArray(rawPosts) || !rawPosts.length) {
      logger.warn(`⚠️ Invalid input: 'posts[]' must be a non-empty array`);
      return res.status(400).json(
        BaseController.error("Invalid input: 'posts[]' is required and must be an array.")
      );
    }

    const keywords: Keyword[] = await prisma.keyword.findMany();

    if (!keywords.length) {
      logger.warn(`⚠️ No global keywords found`);
      return res.status(400).json(
        BaseController.error("No global keywords found in the system.")
      );
    }

    const filteredPosts = rawPosts.filter(post => isJobPost(post, keywords));
    logger.info(`✅ Found ${filteredPosts.length} job-related posts (global detection)`);

    return res.status(200).json(
      BaseController.success("Job posts detected successfully", filteredPosts)
    );
  } catch (error) {
    logger.error(`❌ Error detecting job posts: ${error}`);
    return res.status(500).json(
      BaseController.error("Failed to process global job post detection", error)
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
    logger.info(`📝 createJobPost called with title: ${title}, company: ${company}`);

    if (!title || !company || !description || !link || !postingDate || !groupId) {
      logger.warn(`⚠️ Missing required fields in job post request`);
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

    logger.info(`✅ Job post saved successfully: ${jobPost.title} at ${jobPost.company}`);
    return res.status(201).json(
      BaseController.success("Job post created successfully", jobPost)
    );
  } catch (error: any) {
    logger.error(`❌ Error creating job post: ${error.message}`);

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
    const { groupId} = req.body;
    logger.info(`🕸️ scrapeJobsHandler called for group ${groupId}`);

    if (!groupId) {
      return res.status(400).json(
        BaseController.error("Missing 'groupId' in request body")
      );
    }

    const savedPosts = await scrapeDetectAndSaveAuto(groupId);
    logger.info(`✅ Scraping complete – saved ${savedPosts.length} posts for group ${groupId}`);

    return res.status(200).json(
      BaseController.success(`Saved ${savedPosts.length} job posts`, savedPosts)
    );

  } catch (error: any) {
    logger.error(`❌ Failed to scrape job posts: ${error?.message || error}`);
    return res.status(500).json(
      BaseController.error("Failed to scrape and save job posts", error?.message || error)
    );
  }

};
