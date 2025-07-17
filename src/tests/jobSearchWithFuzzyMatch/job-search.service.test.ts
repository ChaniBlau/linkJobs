import * as jobService from '../../services/job-search.service';
import prisma from '../../config/prisma';

beforeEach(() => {
    // Mock keywords
    (prisma.keyword.findMany as jest.Mock).mockResolvedValue([
        { id: 1, word: 'developer', weight: 1, userId: 123, createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Mock userGroup
    (prisma.userGroup.findMany as jest.Mock).mockResolvedValue([
        { userId: 123, groupId: 999 }
    ]);

    // Mock job postings
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


jest.mock('../../config/prisma', () => ({
    keyword: { findMany: jest.fn() },
    userGroup: { findMany: jest.fn() },
    jobPosting: { findMany: jest.fn() },
}));

describe('searchJobsByKeywords', () => {
    const userId = 123;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return empty array if no keywords', async () => {
        (prisma.keyword.findMany as jest.Mock).mockResolvedValue([]);
        const result = await jobService.searchJobsByKeywords(userId);
        expect(result).toEqual([]);
    });

    it('should return empty array if no groups', async () => {
        (prisma.keyword.findMany as jest.Mock).mockResolvedValue([{ word: 'developer' }]);
        (prisma.userGroup.findMany as jest.Mock).mockResolvedValue([]);
        const result = await jobService.searchJobsByKeywords(userId);
        expect(result).toEqual([]);
    });

    it('should return matched jobs only', async () => {
        const userId = 123;

        const result = await jobService.searchJobsByKeywords(userId, { minScore: 1 });

        expect(result.length).toBe(1);
        expect(result[0].title).toContain('Developer');
    });
});
