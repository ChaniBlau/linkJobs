import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log("💥 Error caught by errorHandler middleware:", err.message); // 🔍

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(err); 

  res.status(status).json({ error: message });
};
