import mongoose from 'mongoose';
const internalNoteSchema = new mongoose.Schema({ authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, authorName: { type: String, required: true }, body: { type: String, required: true, maxlength: 5000 }, createdAt: { type: Date, default: Date.now } }, { _id: true });
const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true }, authorId: { type: String, required: true, index: true }, authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookId: { type: String, default: null, index: true }, bookTitle: { type: String, default: 'General / Account Level' }, subject: { type: String, required: true, trim: true, maxlength: 180 }, description: { type: String, required: true, trim: true, maxlength: 10000 },
  attachmentName: { type: String, default: null }, category: { type: String, enum: ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'], default: 'General Inquiry', index: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium', index: true }, status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open', index: true },
  aiClassification: { type: Boolean, default: false }, aiPriority: { type: Boolean, default: false }, assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, internalNotes: { type: [internalNoteSchema], default: [] }, lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });
ticketSchema.index({ status: 1, priority: 1, createdAt: 1 });
export const Ticket = mongoose.model('Ticket', ticketSchema);
