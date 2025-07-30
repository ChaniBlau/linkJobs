import { authenticate } from '../../middlewares/auth.middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

jest.mock('jsonwebtoken');

jest.mock('@prisma/client', () => {
  const mockUser = {
    id: 1,
    role: 'ORG_ADMIN',
    organizationId: 1,
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
    })),
  };
});

describe('authenticate middleware', () => {
  it('should decode token and attach user to request', async () => {
    const payload = {
      id: 1,
      role: 'ORG_ADMIN',
      organizationId: 1,
    };

    const mockReq: any = {
      headers: {
        authorization: 'Bearer fake.token',
      },
    };

    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockNext: NextFunction = jest.fn();

    (jwt.verify as jest.Mock).mockReturnValue(payload);

    await authenticate(mockReq, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });
});
