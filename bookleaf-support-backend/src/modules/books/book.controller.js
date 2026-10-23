import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './book.service.js';
export const myBooks = asyncHandler(async (req, res) => res.json({ success: true, data: await service.listOwnBooks(req.user) }));
