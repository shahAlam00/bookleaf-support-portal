import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password');
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, authorId: user.authorId } };
}
export async function getCurrentUser(id) {
  const user = await User.findById(id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
