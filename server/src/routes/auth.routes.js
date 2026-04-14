import { Router } from 'express';
import {
  changePassword,
  login,
  me,
  refresh,
  register,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.post('/register', authenticate, authorizeRoles('admin'), register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);
router.put('/change-password', authenticate, changePassword);

export default router;
