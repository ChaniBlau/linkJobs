import prisma from "../config/prisma";
import { isJobPost } from "./nlp.service";
import * as jobRepository from "../repositories/jobs/job.repository";
import { JobPosting } from '@prisma/client';
// import { scrapeLinkedInGroupPosts } from "../scrapers/linkedin-group.scraper";

export async function filterJobPosts(rawPosts: string[], userId: number): Promise<string[]> {
    const keywords = await prisma.keyword.findMany({
        where: { userId }
    });

    return rawPosts.filter(post => isJobPost(post, keywords));
}

export const saveJobPost = async (data: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
  return jobRepository.createJobPosting(data);
};


// (async () => {
//   const posts = await scrapeLinkedInGroupPosts(
//     'https://www.linkedin.com/groups/123456789/', 
//     process.env.LINKEDIN_EMAIL || '',
//     process.env.LINKEDIN_PASSWORD || ''
//   );

//   console.log('Posts found:', posts.length);
//   console.log(posts);
// })();
