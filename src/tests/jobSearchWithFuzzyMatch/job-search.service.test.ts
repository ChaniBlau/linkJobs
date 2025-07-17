import * as jobService from '../../services/job-search.service';
import prisma from '../../config/prisma';
import { getSimilarityScore } from '../../utils/fuzzy-match.util';

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    keyword: { findMany: jest.fn() },
    userGroup: { findMany: jest.fn() },
    jobPosting: { findMany: jest.fn() },
    user: { findUnique: jest.fn() },
  }
}));

jest.mock('../../utils/fuzzy-match.util', () => ({
  getSimilarityScore: jest.fn(() => 3), // תמיד עובר minScore 2
}));

describe('searchJobsByKeywords', () => {
  const userId = 123;

  beforeEach(() => {
    jest.clearAllMocks();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });

    (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
      { id: 1, word: 'developer', weight: 1, userId: 123, createdAt: new Date(), updatedAt: new Date() }
    ]);

    (prisma.userGroup.findMany as jest.Mock).mockResolvedValue([
      { userId: 123, groupId: 999 }
    ]);

    (prisma.jobPosting.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        title: 'Fullstack Developer',
        description: 'We are looking for a skilled developer to join our team',
        groupId: 999,
        company: 'Google',
        location: 'Tel Aviv',
        link: 'https://linkedin.com/jobs/1',
        postingDate: new Date(),
        language: 'English',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  it('should return empty array if user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await jobService.searchJobsByKeywords(userId);
    expect(result).toEqual([]);
  });

  it('should return empty array if no keywords', async () => {
    (prisma.keyword.findMany as jest.Mock).mockResolvedValue([]);
    const result = await jobService.searchJobsByKeywords(userId);
    expect(result).toEqual([]);
  });

  it('should return empty array if no groups', async () => {
    (prisma.userGroup.findMany as jest.Mock).mockResolvedValue([]);
    const result = await jobService.searchJobsByKeywords(userId);
    expect(result).toEqual([]);
  });

  it('should return matched jobs only', async () => {
    const result = await jobService.searchJobsByKeywords(userId, { minScore: 2 });
    expect(result.length).toBe(1);
    expect(result[0].title).toContain('Developer');
  });

  it('should call getSimilarityScore with title and description', async () => {
    const spy = jest.spyOn(require('../../utils/fuzzy-match.util'), 'getSimilarityScore');
    await jobService.searchJobsByKeywords(userId, { minScore: 2 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Fullstack Developer'), ['developer']);
  });
});
