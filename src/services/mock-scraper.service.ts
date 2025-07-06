import { mockLinkedInPosts } from '../mocks/mock-posts';

/**
 * מחזיר פוסטים מדומים במקום לשלוף מלינקדאין
 */
export async function mockScrapeLinkedInGroupPosts(): Promise<string[]> {
  return mockLinkedInPosts;
}