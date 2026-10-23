import { asyncHandler } from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';
export const login = asyncHandler(async (req, res) => { const result = await userService.login(req.body); res.json({ success: true, data: result }); });
export const me = asyncHandler(async (req, res) => { const user = await userService.getCurrentUser(req.user.id); res.json({ success: true, data: user }); });
