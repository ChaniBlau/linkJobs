import { Request, Response } from 'express';
import { registerNewUserService } from '../../services/organizationUsers.service';
import { BaseController } from '../base/base.controller';
import { z, ZodError } from 'zod';
import { HttpError } from '../../errors/HttpError';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerNewUser = async (req: Request, res: Response) => {
  try {

    const validatedData = registerSchema.parse(req.body) as { name: string; email: string; password: string; };

    const result = await registerNewUserService(validatedData);

    return res
      .status(201)
      .json(BaseController.success('User registered', result));
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res
        .status(err.status)
        .json(BaseController.error(err.message));
    }
    if (err instanceof ZodError) {
      return res.status(400).json(BaseController.error('Validation failed', err.issues));
    }
    return res
      .status(500)
      .json(BaseController.error('Failed to register user', err.message));
  }
};
