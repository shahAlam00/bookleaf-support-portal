import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { myProfile } from './author.controller.js';
import { myBooks } from '../books/book.controller.js';
const router = Router();
router.use(authenticate, authorize('author'));
router.get('/me', myProfile);
router.get('/my-books', myBooks);
export default router;
