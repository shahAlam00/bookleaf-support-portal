import { Book } from './book.model.js';
import { ApiError } from '../../utils/ApiError.js';
export async function listOwnBooks(user) {
  if (!user.authorId) throw new ApiError(403, 'This account is not linked to an author profile');
  return Book.find({ authorId: user.authorId }).sort({ title: 1 });
}
