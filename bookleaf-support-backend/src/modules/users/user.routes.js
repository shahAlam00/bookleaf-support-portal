import { Router } from 'express';
import { login, me } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from './user.validation.js';
const router = Router();
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);
export default router;
