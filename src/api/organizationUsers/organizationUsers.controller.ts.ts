import { Request, Response } from 'express';
import { updateUserRoleService, createUserByAdminService } from '../../services/organizationUsers.service';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const result = await updateUserRoleService(id, role);
    res.status(200).json({ message: 'User role updated', user: result });
  } catch (err: any) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: err.message });
    }

    if (err.message === 'Invalid role value') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Failed to update user role', error: err.message });
  }
};

export const createUserByAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = (req as Request).body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await createUserByAdminService({
      name,
      email,
      password,
      organizationId: req.user!.organizationId,
    });

    res.status(201).json({ message: 'User created', user: result.user, token: result.token });
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to create user', error: err.message });
  }
};
