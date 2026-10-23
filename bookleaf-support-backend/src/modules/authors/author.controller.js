import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './author.service.js';
export const myProfile = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getOwnProfile(req.user) }));
 