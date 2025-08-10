const mockPrisma = {
  keyword: { findMany: jest.fn() },
  userGroup: { findMany: jest.fn() },
  jobPosting: { findMany: jest.fn() },
  user: { findUnique: jest.fn() },
};

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../../utils/fuzzy-match.util', () => ({
  getSimilarityScore: jest.fn(() => 3),
}));

jest.mock('../../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => null),
    set: jest.fn(),
  },
}));

import * as jobService from '../../services/job-search.service';
import { getSimilarityScore } from '../../utils/fuzzy-match.util';

describe('searchJobsByKeywords', () => {
  const userId = 123;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.user.findUnique.mockResolvedValue({ id: userId });

    mockPrisma.keyword.findMany.mockResolvedValue([
      {
        id: 1,
        word: 'developer',
        weight: 1,
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mockPrisma.userGroup.findMany.mockResolvedValue([
      { userId: 123, groupId: 999 },
    ]);

    mockPrisma.jobPosting.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Fullstack Developer',
        description: 'Looking for a skilled developer to join our team',
        groupId: 999,
        company: 'Google',
        location: 'Tel Aviv',
        link: 'https://linkedin.com/jobs/1',
        postingDate: new Date(),
        language: 'English',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  it('should return empty array if user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const result = await jobService.searchJobsByKeywords(userId);
    expect(result).toEqual([]);
  });

  it('should return empty array if no keywords', async () => {
    mockPrisma.keyword.findMany.mockResolvedValue([]);
    const result = await jobService.searchJobsByKeywords(userId);
    expect(result).toEqual([]);
  });

  it('should return empty array if no groups', async () => {
    mockPrisma.userGroup.findMany.mockResolvedValue([]);
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
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Fullstack Developer'),
      ['developer']
    );
  });
});
