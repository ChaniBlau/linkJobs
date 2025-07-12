import { scrapeLinkedInGroupPosts } from '../scrapers/linkedin-group.scraper';
import { isJobPost } from './nlp.service';
import { extractJobDataFromText } from './extract-job-data.service';
import { createJobPosting } from '../repositories/jobs/job.repository';
import prisma from '../config/prisma';
import { JobPosting } from '@prisma/client';

/**
 * Scrapes job posts from a LinkedIn group, detects relevant posts using NLP,
 * extracts job data, and saves them to the database.
 */
export async function scrapeDetectAndSaveAuto(
  groupId: number,
  userId: number
): Promise<JobPosting[]> {
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });

  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }

  // שלב 2: קריאת נתוני הסביבה
  const groupUrl = group.linkedinUrl;
  const email = process.env.LINKEDIN_EMAIL || '';
  const password = process.env.LINKEDIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error(`Missing LinkedIn credentials in environment variables`);
  }

  // שלב 3: סקרייפינג של פוסטים גולמיים מהקבוצה
  const rawPosts = await scrapeLinkedInGroupPosts(groupUrl, email, password);

  if (!rawPosts.length) {
    console.warn(`No posts found in group ${groupId}`);
    return [];
  }

  // שלב 4: שליפת מילות מפתח של המשתמש
  const keywords = await prisma.keyword.findMany({
    where: { userId }
  });

  if (!keywords.length) {
    console.warn(`User ${userId} has no keywords defined`);
    return [];
  }

  // שלב 5: שליפת לינקים קיימים מראש למניעת כפילויות
  const existingPosts = await prisma.jobPosting.findMany({
    where: {
      link: {
        in: rawPosts
          .map(post => extractJobDataFromText(post)?.link)
          .filter((link): link is string => Boolean(link))
      }
    },
    select: { link: true }
  });

  const existingLinks = new Set(existingPosts.map(p => p.link));
  const savedPosts: JobPosting[] = [];

  // שלב 6: לולאה על כל הפוסטים
  for (const postText of rawPosts) {
    // שלב 6.1: סינון NLP
    if (!isJobPost(postText, keywords)) continue;

    // שלב 6.2: חילוץ נתונים מהטקסט
    const extracted = extractJobDataFromText(postText);

    if (
      !extracted?.title ||
      !extracted?.company ||
      !extracted?.link ||
      !extracted?.description ||
      !extracted?.postingDate
    ) {
      continue;
    }

    // שלב 6.3: בדיקה אם הפוסט כבר נשמר
    if (existingLinks.has(extracted.link)) continue;

    // שלב 6.4: שמירה למסד הנתונים
    const saved = await createJobPosting({
      title: extracted.title,
      company: extracted.company,
      description: extracted.description,
      link: extracted.link,
      location: extracted.location,
      postingDate: extracted.postingDate,
      language: extracted.language,
      groupId
    });

    savedPosts.push(saved);
    existingLinks.add(extracted.link); // למקרה של כפילות בתוך אותו סשן
  }

  return savedPosts;
}
