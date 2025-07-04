import { Response } from 'express';
import { createUserByAdmin, updateUserRole } from '../../src/api/organizationUsers/organizationUsers.controller.ts';
import * as service from '../../src/services/organizationUsers.service';
import { Role } from '@prisma/client';

jest.mock('../../src/services/organizationUsers.service');

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
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
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
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User created',
                user: fakeResult.user,
                token: fakeResult.token,
            });
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
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User role updated',
                user: updatedUser,
            });
        });

        it('should return 404 if user not found', async () => {
            const mockReq = {
                params: { id: '10' },
                body: { role: Role.VIEWER },
            };

            (service.updateUserRoleService as jest.Mock).mockRejectedValue(new Error('User not found'));

            await updateUserRole(mockReq as any, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return 400 for invalid role', async () => {
            const mockReq = {
                params: { id: '3' },
                body: { role: 'INVALID_ROLE' },
            };

            (service.updateUserRoleService as jest.Mock).mockRejectedValue(new Error('Invalid role value'));

            await updateUserRole(mockReq as any, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid role value' });
        });
    });
});
