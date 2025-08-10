import * as service from '../../services/keyword.service';
import { createKeyword, deleteKeyword, getAllKeywords, updateKeyword } from '../../api/keywords/keyword.controller';
import { BaseController } from '../../api/base/base.controller';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { Response } from 'express';

jest.mock('../../services/keyword.service');

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Keyword Controller', () => {
  const mockUser = { id: 1, role: 'RECRUITER' };

  describe('getAllKeywords', () => {
    it('should return keywords for valid user', async () => {
      const req = { user: mockUser } as AuthenticatedRequest;
      const res = mockRes();
      (service.getKeywords as jest.Mock).mockResolvedValueOnce([{ id: 1, word: 'test', weight: 2 }]);

      await getAllKeywords(req, res);

      expect(service.getKeywords).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(BaseController.success('Successfully fetched keywords', [{ id: 1, word: 'test', weight: 2 }])); 
    });

    it('should return 401 if user is missing', async () => {
      const req = {} as AuthenticatedRequest;
      const res = mockRes();

      await getAllKeywords(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(BaseController.error('Unauthorized'));
    });
  });

  describe('createKeyword', () => {
    it('should create a keyword', async () => {
      const req = { user: mockUser, body: { word: 'test', weight: 3 } } as AuthenticatedRequest;
      const res = mockRes();
      (service.createKeyword as jest.Mock).mockResolvedValueOnce({ id: 1, word: 'test', weight: 3 });

      await createKeyword(req, res);

      expect(service.createKeyword).toHaveBeenCalledWith(mockUser.id, 'test', 3);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(BaseController.success('Keyword created successfully', { id: 1, word: 'test', weight: 3 }));
    });
  });

  describe('updateKeyword', () => {
    it('should update a keyword weight', async () => {
      const req = { user: mockUser, params: { id: '1' }, body: { weight: 5 } } as unknown as AuthenticatedRequest;
      const res = mockRes();
      (service.updateKeyword as jest.Mock).mockResolvedValueOnce({ id: 1, word: 'hello', weight: 5 });

      await updateKeyword(req, res);

      expect(service.updateKeyword).toHaveBeenCalledWith(mockUser.id, 1, 5);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteKeyword', () => {
    it('should delete a keyword', async () => {
      const req = { user: mockUser, params: { id: '2' } } as unknown as AuthenticatedRequest;
      const res = mockRes();
      (service.deleteKeyword as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteKeyword(req, res);

      expect(service.deleteKeyword).toHaveBeenCalledWith(mockUser.id, 2);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
