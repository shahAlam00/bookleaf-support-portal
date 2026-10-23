import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({ ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true }, senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, senderName: { type: String, required: true }, senderRole: { type: String, enum: ['author', 'admin'], required: true }, body: { type: String, required: true, trim: true, maxlength: 10000 }, isInternal: { type: Boolean, default: false } }, { timestamps: true, versionKey: false });
messageSchema.index({ ticketId: 1, createdAt: 1 });
export const Message = mongoose.model('Message', messageSchema);
