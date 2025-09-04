import express from 'express';
import { loginController } from '../api/auth/auth.controller';
import { registerNewUser } from '../api/userApi/auth.controller' 

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Auth route: ${req.method} ${req.path}`);
  next();
});

router.post('/login', loginController);
router.post('/register', registerNewUser);

router.get('/test', (req, res) => {
  res.json({ message: 'Auth router works!', timestamp: new Date().toISOString() });
});
export default router;