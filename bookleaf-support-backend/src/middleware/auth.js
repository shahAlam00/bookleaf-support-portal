import jwt from 'jsonwebtoken';
import { User } from '../modules/users/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) throw new ApiError(401, 'Authentication required');
  let payload;
  try { payload = jwt.verify(token, env.JWT_SECRET); }
  catch { throw new ApiError(401, 'Invalid or expired token'); }
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Account is unavailable');
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action'));
  next();
};
