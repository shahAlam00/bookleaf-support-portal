import { Author } from './author.model.js';
import { Book } from '../books/book.model.js';
import { ApiError } from '../../utils/ApiError.js';
export async function getOwnProfile(user) {
  if (!user.authorId) throw new ApiError(403, 'This account is not linked to an author profile');
  const author = await Author.findOne({ authorId: user.authorId });
  if (!author) throw new ApiError(404, 'Author profile not found');
  return author;
}
export async function getOwnBooks(user) {
  if (!user.authorId) throw new ApiError(403, 'This account is not linked to an author profile');
  return Book.find({ authorId: user.authorId }).sort({ title: 1 });
}
