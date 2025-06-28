import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../src/middlewares/group.middleware';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  const mockReq = {
    headers: {},
  } as unknown as Request;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token provided', () => {
    mockReq.headers = {};
    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
  });

  it('should return 403 if token is invalid', () => {
    mockReq.headers = { authorization: 'Bearer invalid.token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should decode token and attach user to request', () => {
    const payload = { id: 1, role: 'ORG_ADMIN', organizationId: 2 };
    (jwt.verify as jest.Mock).mockReturnValue(payload);

    mockReq.headers = { authorization: 'Bearer valid.token' };

    const reqWithUser = mockReq as any;
    authenticate(reqWithUser, mockRes, mockNext);

    expect(reqWithUser.user).toEqual({
      id: 1,
      role: Role.ORG_ADMIN,
      organizationId: 2,
    });
    expect(mockNext).toHaveBeenCalled();
  });
});
