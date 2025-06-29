// // // import express from 'express';
// // // import { authenticate } from '../middlewares/auth.middleware';
// // // import { authorize } from '../middlewares/authorize.middleware';

// // // const router = express.Router();

// // // // 🔒 גישה בלעדית ל‑SUPER_ADMIN
// // // router.get('/admin-only', authenticate, authorize(['SUPER_ADMIN']), (req, res) => {
// // //   res.json({ secret: '42' });
// // // });

// // // // 🔒 גישה ל‑ORG_ADMIN + SUPER_ADMIN
// // // router.get('/org-dashboard', authenticate, authorize(['ORG_ADMIN', 'SUPER_ADMIN']), (req, res) => {
// // //   res.json({ message: 'Welcome org admin' });
// // // });

// // // export default router;


// // import express, { Response } from 'express';
// // import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
// // import { authorize } from '../middlewares/authorize.middleware';

// // const router = express.Router();

// // // 🔒 גישה בלעדית ל‑SUPER_ADMIN
// // router.get(
// //   '/admin-only',
// //   authenticate,
// //   authorize(['SUPER_ADMIN']),
// //   (req: AuthenticatedRequest, res: Response) => {
// //     // כאן אפשר לגשת ל־req.user בביטחון
// //     res.json({ secret: '42', user: req.user });
// //   }
// // );

// // // 🔒 גישה ל‑ORG_ADMIN + SUPER_ADMIN
// // router.get(
// //   '/org-dashboard',
// //   authenticate,
// //   authorize(['ORG_ADMIN', 'SUPER_ADMIN']),
// //   (req: AuthenticatedRequest, res: Response) => {
// //     res.json({ message: 'Welcome org admin', user: req.user });
// //   }
// // );

// // export default router;


// // routes/protected.router.ts
// import express, { Response } from 'express';
// import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
// import { authorize } from '../middlewares/authorize.middleware';

// const router = express.Router();

// router.get(
//   '/admin-only',
//   authenticate,
//   authorize(['SUPER_ADMIN']),
//   (req: AuthenticatedRequest, res: Response) => {
//     res.json({ secret: '42', user: req.user });
//   }
// );

// router.get(
//   '/org-dashboard',
//   authenticate,
//   authorize(['ORG_ADMIN', 'SUPER_ADMIN']),
//   (req: AuthenticatedRequest, res: Response) => {
//     res.json({ message: 'Welcome org admin', user: req.user });
//   }
// );

// export default router;



// routes/protected.router.ts
import express, { Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = express.Router();

// 🔒 גישה בלעדית ל‑SUPER_ADMIN
router.get(
  '/admin-only',
  authenticate,
  authorize(['SUPER_ADMIN']),
  (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    res.json({ secret: '42', user });
  }
);

// 🔒 גישה ל‑ORG_ADMIN + SUPER_ADMIN
router.get(
  '/org-dashboard',
  authenticate,
  authorize(['ORG_ADMIN', 'SUPER_ADMIN']),
  (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    res.json({ message: 'Welcome org admin', user });
  }
);

export default router;
