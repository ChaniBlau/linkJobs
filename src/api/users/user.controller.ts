import { Request, Response } from 'express';
import { updateUserRoleService } from '../../services/user.service';

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
