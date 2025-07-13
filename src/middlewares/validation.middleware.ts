import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BaseController } from '../api/base/base.controller';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(BaseController.error('Validation failed', result.error.flatten()));
    }
    req.body = result.data; 
    next();
  };
};
