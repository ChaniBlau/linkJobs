
import { Request, Response } from 'express';

export const registerOrg = (req: Request, res: Response) => {
  const { name, industry } = req.body;
  res.json({ message: 'Organization registered (stub)', data: { name, industry } });
};
