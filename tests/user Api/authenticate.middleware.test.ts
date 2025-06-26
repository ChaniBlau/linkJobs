import { authenticate } from '../../src/middlewares/auth.middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  it('should decode token and attach user to request', (done) => {
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

    const mockNext: NextFunction = () => {
      try {
        expect(mockReq.user).toEqual(payload);
        done();
      } catch (err) {
        done(err); 
      }
    };

    (jwt.verify as jest.Mock).mockReturnValue(payload);

    authenticate(mockReq, mockRes as Response, mockNext);
  });
});
