import { Request, Response } from 'express';
import { updateUserRoleService, createUserByAdminService } from '../../services/organizationUsers.service';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { BaseController } from '../base/base.controller';

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const result = await updateUserRoleService(id, role);
    return res.status(200).json(BaseController.success('User role updated', result));
  } catch (err: any) {
    if (err.message === 'User not found') {
      return res.status(404).json(BaseController.error('User not found', err.message));
    }

    if (err.message === 'Invalid role value') {
      return res.status(400).json(BaseController.error('Invalid role value', err.message));
    }

    return res.status(500).json(BaseController.error('Failed to update user role', err.message));
  }
};

export const createUserByAdmin = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(BaseController.error('Missing required fields'));
    }
    
    const result = await createUserByAdminService({
      name,
      email,
      password,
      organizationId: authReq.user!.organizationId,
    });

    return res.status(201).json(BaseController.success('User created', result));
  } catch (err: any) {
    return res.status(400).json(BaseController.error('Failed to create user', err.message));
  }
};
