import { requireAdminRole } from '../../src/middlewares/auth.middleware';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types/AuthenticatedRequest';
import { Role } from '@prisma/client';

describe('requireAdminRole middleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should allow ORG_ADMIN', () => {
    const mockReq = {
      user: {
        id: 1,
        role: Role.ORG_ADMIN,
        organizationId: 1,
      },
    } as AuthenticatedRequest;

    requireAdminRole(mockReq, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow SUPER_ADMIN', () => {
    const mockReq = {
      user: {
        id: 2,
        role: Role.SUPER_ADMIN,
        organizationId: 1,
      },
    } as AuthenticatedRequest;

    requireAdminRole(mockReq, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should block RECRUITER with 403', () => {
    const mockReq = {
      user: {
        id: 3,
        role: Role.RECRUITER,
        organizationId: 1,
      },
    } as AuthenticatedRequest;

    requireAdminRole(mockReq, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should block if user is missing', () => {
    const mockReq = {} as AuthenticatedRequest;

    requireAdminRole(mockReq, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
