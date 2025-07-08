import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../src/middlewares/group.middleware';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../src/types/AuthenticatedRequest';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  let mockReq: Partial<Request> & Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 401 if no token provided', () => {
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing token' });
  });

  it('should return 403 if token is invalid', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid.token',
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should decode token and attach user to request', () => {
    const payload = {
      id: 1,
      role: Role.ORG_ADMIN,
      organizationId: 2,
    };

    (jwt.verify as jest.Mock).mockReturnValue(payload);

    mockReq.headers = {
      authorization: 'Bearer valid.token',
    };

    const req = mockReq as AuthenticatedRequest;

    authenticate(req as Request, mockRes as Response, mockNext);

    expect(req.user).toEqual({
      id: 1,
      role: Role.ORG_ADMIN,
      organizationId: 2,
    });

    expect(mockNext).toHaveBeenCalled();
  });
});
