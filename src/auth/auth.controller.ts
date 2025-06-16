// // // src/auth/auth.controller.ts
// // import { Request, Response } from 'express';
// // import { loginUser } from './auth.service';
// // // const express = require('express');

// // export const loginController = async (req: Request, res: Response) => {
// //   const { email, password } = req.body;

// //   try {
// //     const token = await loginUser(email, password);
// //     res.json({ token });
// //   } catch (err: any) {
// //     res.status(401).json({ error: err.message });
// //   }
// // };



// // src/auth/auth.controller.ts
// import { Request, Response } from 'express';
// import { loginUser } from './auth.service';
// import logger from '../utils/logger'; // ⬅️ ייבוא הלוגר

// export const loginController = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     logger.info(`Attempt to login with email: ${email}`); // ⬅️ רישום ניסיון התחברות
//     const token = await loginUser(email, password);
//     logger.info(`Login successful for email: ${email}`); // ⬅️ רישום הצלחה
//     res.json({ token });
//   } catch (err: any) {
//     logger.error(`Login failed for email: ${email} - Reason: ${err.message}`); // ⬅️ רישום שגיאה
//     res.status(401).json({ error: err.message });
//   }
// };


import { Request, Response } from 'express';
import { loginUser } from './auth.service';
import logger from '../utils/logger'; // ייבוא הלוגר

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
