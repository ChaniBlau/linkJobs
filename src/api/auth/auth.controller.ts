import { Request, Response } from 'express';
import { loginUser } from '../../services/auth.service';
import logger from '../../utils/logger';

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  try {
    logger.info(`Attempt to login with email: ${email}`);
    const result = await loginUser(email, password);
    logger.info(`Login successful for email: ${email}`);
    
    res.json({ 
      token: result.token,
      user: result.user 
    });
  } catch (err: any) {
    logger.error(`Login failed for email: ${email} - Reason: ${err.message}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
