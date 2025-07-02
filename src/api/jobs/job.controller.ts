import { Request, Response } from "express";
import { filterJobPosts } from "../../services/job-filter.service";
import { BaseController } from "../base/base.controller";

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
