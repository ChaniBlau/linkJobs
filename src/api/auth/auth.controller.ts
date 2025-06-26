import { Request, Response } from 'express';
import { registerUserService } from '../../services/auth.service';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await registerUserService(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};