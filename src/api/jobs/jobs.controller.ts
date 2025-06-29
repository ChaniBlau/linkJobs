import { Request, Response } from 'express';

export const getAllJobs = (req: Request, res: Response) => {
  res.json({ message: 'Here are all the jobs (stub)' });
};
