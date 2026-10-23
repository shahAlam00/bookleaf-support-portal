import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { myBooks } from './book.controller.js';
const router = Router();
router.get('/my-books', authenticate, authorize('author'), myBooks);
export default router;
