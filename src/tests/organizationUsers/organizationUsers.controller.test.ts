import { Response } from 'express';
import { createUserByAdmin, updateUserRole } from '../../api/userApi/organizationUsers';
import * as service from '../../services/organizationUsers.service';
import { Role } from '@prisma/client';
import { BaseController } from '../../api/base/base.controller';

jest.mock('../../services/organizationUsers.service');

describe('organizationUsers.controller', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createUserByAdmin', () => {
    it('should return 400 if required fields are missing', async () => {
      const mockReq = {
        body: {},
        user: { organizationId: 1 },
      };

      await createUserByAdmin(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.error('Missing required fields')
      );
    });

    it('should return 201 if user is created', async () => {
      const mockReq = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: '12345678',
        },
        user: { organizationId: 1 },
      };

      const fakeResult = {
        user: { id: 1, name: 'Test User' },
        token: 'fake.jwt.token',
      };

      (service.createUserByAdminService as jest.Mock).mockResolvedValue(fakeResult);

      await createUserByAdmin(mockReq as any, mockRes as Response);

      expect(service.createUserByAdminService).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: '12345678',
        organizationId: 1,
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.success('User created', fakeResult)
      );
    });

    it('should return 400 if email already exists', async () => {
      const mockReq = {
        body: {
          name: 'Test User',
          email: 'exists@example.com',
          password: '12345678',
        },
        user: { organizationId: 1 },
      };

      (service.createUserByAdminService as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists')
      );

      await createUserByAdmin(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.error('Failed to create user', 'User with this email already exists')
      );
    });
  });

  describe('updateUserRole', () => {
    it('should return 200 when user role is updated', async () => {
      const mockReq = {
        params: { id: '5' },
        body: { role: Role.RECRUITER },
      };

      const updatedUser = { id: 5, name: 'User', role: Role.RECRUITER };

      (service.updateUserRoleService as jest.Mock).mockResolvedValue(updatedUser);

      await updateUserRole(mockReq as any, mockRes as Response);

      expect(service.updateUserRoleService).toHaveBeenCalledWith(5, Role.RECRUITER);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.success('User role updated', updatedUser)
      );
    });

    it('should return 404 if user not found', async () => {
      const mockReq = {
        params: { id: '10' },
        body: { role: Role.VIEWER },
      };

      (service.updateUserRoleService as jest.Mock).mockRejectedValue(new Error('User not found'));

      await updateUserRole(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.error('User not found', 'User not found')
      );
    });

    it('should return 400 for invalid role', async () => {
      const mockReq = {
        params: { id: '3' },
        body: { role: 'INVALID_ROLE' },
      };

      (service.updateUserRoleService as jest.Mock).mockRejectedValue(new Error('Invalid role value'));

      await updateUserRole(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.error('Invalid role value', 'Invalid role value')
      );
    });

    it('should return 500 for unexpected errors', async () => {
      const mockReq = {
        params: { id: '2' },
        body: { role: Role.ORG_ADMIN },
      };

      (service.updateUserRoleService as jest.Mock).mockRejectedValue(new Error('Unexpected'));

      await updateUserRole(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        BaseController.error('Failed to update user role', 'Unexpected')
      );
    });
  });
});
