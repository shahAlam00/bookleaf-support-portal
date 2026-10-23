import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { Author } from '../modules/authors/author.model.js';
import { Book } from '../modules/books/book.model.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const datasetPath = path.resolve(here, '../data/bookleaf_sample_data.json');
const toDateOrNull = (value) => value ? new Date(value) : null;

async function seed() {
  await connectDB();
  const dataset = JSON.parse(await fs.readFile(datasetPath, 'utf8'));
  const authorPasswordHash = await bcrypt.hash(env.AUTHOR_DEFAULT_PASSWORD, env.BCRYPT_ROUNDS);
  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
  await User.findOneAndUpdate({ email: env.ADMIN_EMAIL.toLowerCase() }, { $set: { name: env.ADMIN_NAME, email: env.ADMIN_EMAIL.toLowerCase(), passwordHash: adminPasswordHash, role: 'admin', authorId: null, isActive: true } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  let authorCount = 0, bookCount = 0;
  for (const rawAuthor of dataset.authors) {
    await Author.findOneAndUpdate({ authorId: rawAuthor.author_id }, { $set: { authorId: rawAuthor.author_id, name: rawAuthor.name, email: rawAuthor.email.toLowerCase(), phone: rawAuthor.phone, city: rawAuthor.city, joinedDate: toDateOrNull(rawAuthor.joined_date) } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await User.findOneAndUpdate({ email: rawAuthor.email.toLowerCase() }, { $set: { name: rawAuthor.name, email: rawAuthor.email.toLowerCase(), passwordHash: authorPasswordHash, role: 'author', authorId: rawAuthor.author_id, isActive: true } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    authorCount++;
    for (const b of rawAuthor.books ?? []) {
      await Book.findOneAndUpdate({ bookId: b.book_id }, { $set: {
        bookId: b.book_id, authorId: rawAuthor.author_id, title: b.title, isbn: b.isbn, genre: b.genre,
        publicationDate: toDateOrNull(b.publication_date), status: b.status, mrp: b.mrp, authorRoyaltyPerCopy: b.author_royalty_per_copy,
        totalCopiesSold: b.total_copies_sold, totalRoyaltyEarned: b.total_royalty_earned, royaltyPaid: b.royalty_paid,
        royaltyPending: b.royalty_pending, lastRoyaltyPayoutDate: toDateOrNull(b.last_royalty_payout_date), printPartner: b.print_partner, availableOn: b.available_on ?? []
      } }, { upsert: true, new: true, setDefaultsOnInsert: true });
      bookCount++;
    }
  }
  console.log(`Seed complete: ${authorCount} authors, ${bookCount} books, 1 admin.`);
  console.log(`Admin login: ${env.ADMIN_EMAIL} / [ADMIN_PASSWORD from .env]`);
  console.log(`Author logins: each JSON author email / [AUTHOR_DEFAULT_PASSWORD from .env]`);
  process.exit(0);
}
seed().catch((error) => { console.error('Seed failed:', error); process.exit(1); });
