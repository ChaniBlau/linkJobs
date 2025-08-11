
import { Request, Response } from 'express';
import { loginUser } from '../../services/auth.service';
import logger from '../../utils/logger';

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    logger.info(`Attempt to login with email: ${email}`);
    const token = await loginUser(email, password);
    logger.info(`Login successful for email: ${email}`);
    res.json({ token });
  } catch (err: any) {
    logger.error(`Login failed for email: ${email} - Reason: ${err.message}`);
    res.status(401).json({ error: err.message });
  }
};
