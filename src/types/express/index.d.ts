import 'express-serve-static-core';
import 'express';

// declare global {
//   namespace Express {
//     interface Request {
//       userId?: string;
//       userRole?: string;
//     }
//   }
// }


declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    userRole?: string;
  }
}

export {};
