import express from 'express';
import { loginController } from '../api/auth/auth.controller';

const router = express.Router();

router.post('/login', loginController);
router.get('/test', (req, res) => {
    res.send('auth router works');
  });
  
export default router;


