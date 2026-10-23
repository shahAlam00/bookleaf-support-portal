import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['author', 'admin'], required: true, index: true },
  authorId: { type: String, default: null, index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

export const User = mongoose.model('User', userSchema);
