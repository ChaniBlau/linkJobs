import { mockLinkedInPosts } from '../mocks/mock-posts';

/**
 * Returns mock LinkedIn group posts for testing and development.
 * Use this function instead of real scraping in test environments.
 *
 * @returns Promise<string[]> - Array of mock post texts
 */
export async function mockScrapeLinkedInGroupPosts(): Promise<string[]> {
  return mockLinkedInPosts;
}
