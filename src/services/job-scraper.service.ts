import { scrapeLinkedInGroupPosts } from '../scrapers/linkedin-group.scraper';
import { isJobPost } from './nlp.service';
import { extractJobDataFromText } from './extract-job-data.service';
import { createJobPosting } from '../repositories/jobs/job.repository';
import prisma from '../config/prisma';
import { JobPosting } from '@prisma/client';

export async function scrapeDetectAndSaveAuto(groupId: number, userId: number): Promise<JobPosting[]> {

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { Organization: true }
  });

  if (!group) throw new Error(`Group ${groupId} not found`);

  const groupUrl = group.linkedinUrl;
  const organizationId = group.organizationId;

  const email = process.env.LINKEDIN_EMAIL || '';
  const password = process.env.LINKEDIN_PASSWORD || '';
  if (!email || !password) throw new Error(`Missing LinkedIn credentials`);

  const rawPosts = await scrapeLinkedInGroupPosts(groupUrl, email, password);
  const keywords = await prisma.keyword.findMany({ where: { userId } });

  const savedPosts: JobPosting[] = [];

  for (const postText of rawPosts) {
    if (isJobPost(postText, keywords)) {
      const extracted = extractJobDataFromText(postText);

      if (
        extracted?.title &&
        extracted?.company &&
        extracted?.description &&
        extracted?.link &&
        extracted?.postingDate
      ) {
        const exists = await prisma.jobPosting.findFirst({
          where: {
            link: extracted.link,
          },
        });


        if (exists) continue;

        const saved = await createJobPosting({
          title: extracted.title,
          company: extracted.company,
          description: extracted.description,
          link: extracted.link,
          location: extracted.location,
          postingDate: extracted.postingDate,
          language: extracted.language,
          organizationId,
          groupId,
        });

        savedPosts.push(saved);
      }
    }
  }

  return savedPosts;
}
