import mongoose from 'mongoose';
const authorSchema = new mongoose.Schema({
  authorId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: '' }, city: { type: String, default: '' }, joinedDate: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
export const Author = mongoose.model('Author', authorSchema);
