// src/tests/keywords/Keyword.service.test.ts
import * as service from '../../services/keyword.service';
import * as repo from '../../repositories/keyword.repository';
import { Keyword } from '@prisma/client';

jest.mock('../../repositories/keyword.repository');
const mockedRepo = repo as jest.Mocked<typeof repo>;

const mockKeyword: Keyword = {
  id: 1,
  userId: 10,
  word: 'frontend',
  weight: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Keyword Service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getKeywords', () => {
    it('should return keywords for a user', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([mockKeyword]);
      const result = await service.getKeywords(10);
      expect(result).toEqual([mockKeyword]);
      expect(mockedRepo.getKeywordsByUser).toHaveBeenCalledWith(10);
    });

    it('should throw error if repository fails', async () => {
      mockedRepo.getKeywordsByUser.mockRejectedValue(new Error('DB error'));
      await expect(service.getKeywords(10)).rejects.toThrow('DB error');
    });
  });

  describe('createKeyword', () => {
    it('should create a keyword', async () => {
      mockedRepo.createKeyword.mockResolvedValue(mockKeyword);
      const result = await service.createKeyword(10, 'frontend', 5);
      expect(result).toEqual(mockKeyword);
      expect(mockedRepo.createKeyword).toHaveBeenCalledWith(10, 'frontend', 5);
    });

    it('should throw error if creation fails', async () => {
      mockedRepo.createKeyword.mockRejectedValue(new Error('DB create failed'));
      await expect(service.createKeyword(10, 'test', 1)).rejects.toThrow('DB create failed');
    });
  });

  describe('updateKeyword', () => {
    it('should update owned keyword', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([mockKeyword]);
      mockedRepo.updateKeyword.mockResolvedValue({ ...mockKeyword, weight: 8 });

      const result = await service.updateKeyword(10, 1, 8);
      expect(result.weight).toBe(8);
    });

    it('should throw error if keyword not owned', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([]);
      await expect(service.updateKeyword(10, 1, 5)).rejects.toThrow('Permission denied');
    });

    it('should throw error if update fails', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([mockKeyword]);
      mockedRepo.updateKeyword.mockRejectedValue(new Error('Update error'));

      await expect(service.updateKeyword(10, 1, 6)).rejects.toThrow('Update error');
    });
  });

  describe('deleteKeyword', () => {
    it('should delete owned keyword', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([mockKeyword]);
      mockedRepo.deleteKeyword.mockResolvedValue(mockKeyword);

      const result = await service.deleteKeyword(10, 1);
      expect(result).toEqual(mockKeyword);
    });

    it('should throw error if keyword not owned', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([]);
      await expect(service.deleteKeyword(10, 1)).rejects.toThrow('Permission denied');
    });

    it('should throw error if deletion fails', async () => {
      mockedRepo.getKeywordsByUser.mockResolvedValue([mockKeyword]);
      mockedRepo.deleteKeyword.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteKeyword(10, 1)).rejects.toThrow('Delete failed');
    });
  });
});
