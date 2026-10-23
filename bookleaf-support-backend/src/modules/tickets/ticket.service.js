import { Ticket } from './ticket.model.js';
import { Message } from './message.model.js';
import { Book } from '../books/book.model.js';
import { Author } from '../authors/author.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { parsePagination } from '../../utils/pagination.js';
import { classifyTicket, draftResponse } from '../ai/ai.service.js';

let io;
export function setTicketIO(socketServer) { io = socketServer; }
function emitTicket(ticket, event = 'ticket:updated') {
  if (!io) return;
  io.to(`author:${ticket.authorUserId}`).emit(event, { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, status: ticket.status, updatedAt: ticket.updatedAt });
  io.to('admins').emit(event, { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, status: ticket.status, updatedAt: ticket.updatedAt });
}
function safeTicket(ticket, isAdmin) {
  const obj = ticket.toObject ? ticket.toObject() : ticket;
  if (!isAdmin) delete obj.internalNotes;
  return obj;
}
async function ensureCanRead(ticketId, user) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  if (user.role !== 'admin' && String(ticket.authorUserId) !== String(user.id)) throw new ApiError(403, 'You cannot access this ticket');
  return ticket;
}
export async function createTicket(user, input) {
  if (!user.authorId) throw new ApiError(403, 'This account is not linked to an author profile');
  const author = await Author.findOne({ authorId: user.authorId });
  if (!author) throw new ApiError(404, 'Author profile not found');
  let book = null;
  if (input.bookId) {
    book = await Book.findOne({ bookId: input.bookId, authorId: user.authorId });
    if (!book) throw new ApiError(400, 'Selected book does not belong to your account');
  }
  const ai = await classifyTicket({ subject: input.subject, description: input.description, book });
  const count = await Ticket.countDocuments();
  const ticket = await Ticket.create({ ticketNumber: `BL-${Date.now().toString(36).toUpperCase()}-${String(count + 1).padStart(4, '0')}`, authorId: user.authorId, authorUserId: user.id, bookId: book?.bookId ?? null, bookTitle: book?.title ?? 'General / Account Level', subject: input.subject, description: input.description, attachmentName: input.attachmentName ?? null, category: ai.category, priority: ai.priority, aiClassification: ai.aiGenerated, aiPriority: ai.aiGenerated });
  await Message.create({ ticketId: ticket.id, senderId: user.id, senderName: user.name, senderRole: 'author', body: input.description, isInternal: false });
  emitTicket(ticket, 'ticket:created');
  return { ...safeTicket(ticket, false), ai: { classificationUsedAI: ai.aiGenerated, priorityUsedAI: ai.aiGenerated } };
}
export async function listMyTickets(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { authorUserId: user.id };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([Ticket.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit), Ticket.countDocuments(filter)]);
  return { items: items.map((t) => safeTicket(t, false)), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
export async function getTicket(ticketId, user) {
  const ticket = await ensureCanRead(ticketId, user);
  const messageFilter = { ticketId: ticket.id };
  if (user.role !== 'admin') messageFilter.isInternal = false;
  const messages = await Message.find(messageFilter).sort({ createdAt: 1 }).select(user.role === 'admin' ? '' : '-isInternal');
  return { ticket: safeTicket(ticket, user.role === 'admin'), messages };
}
export async function listAdminTickets(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.priority) filter.priority = query.priority;
  if (query.authorId) filter.authorId = query.authorId;
  if (query.from || query.to) filter.createdAt = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) };
  if (query.search) filter.$or = [{ subject: { $regex: query.search, $options: 'i' } }, { ticketNumber: { $regex: query.search, $options: 'i' } }, { description: { $regex: query.search, $options: 'i' } }];
  const [items, total] = await Promise.all([
    Ticket.aggregate([
      { $match: filter },
      { $addFields: { priorityRank: { $switch: { branches: [
        { case: { $eq: ['$priority', 'Critical'] }, then: 0 },
        { case: { $eq: ['$priority', 'High'] }, then: 1 },
        { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
        { case: { $eq: ['$priority', 'Low'] }, then: 3 }
      ], default: 4 } } } },
      { $sort: { priorityRank: 1, createdAt: 1 } }, { $skip: skip }, { $limit: limit },
      { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'assignedTo' } },
      { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
      { $project: { 'assignedTo.passwordHash': 0, priorityRank: 0 } }
    ]),
    Ticket.countDocuments(filter)
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
export async function updateTicket(ticketId, user, input) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  for (const field of ['status', 'category', 'priority']) if (input[field] !== undefined) ticket[field] = input[field];
  if (input.assignToMe) ticket.assignedTo = user.id;
  await ticket.save();
  emitTicket(ticket);
  return safeTicket(ticket, true);
}
export async function addReply(ticketId, user, body) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  const message = await Message.create({ ticketId: ticket.id, senderId: user.id, senderName: user.name, senderRole: 'admin', body, isInternal: false });
  ticket.lastMessageAt = new Date();
  if (ticket.status === 'Open') ticket.status = 'In Progress';
  await ticket.save();
  emitTicket(ticket, 'ticket:message');
  return { message, ticket: safeTicket(ticket, true) };
}
export async function addInternalNote(ticketId, user, body) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  ticket.internalNotes.push({ authorId: user.id, authorName: user.name, body });
  await ticket.save();
  return safeTicket(ticket, true);
}
export async function getDraft(ticketId) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  const book = ticket.bookId ? await Book.findOne({ bookId: ticket.bookId, authorId: ticket.authorId }) : null;
  return { ...await draftResponse(ticket, book), ticketId: ticket.id };
}
export async function dashboardSummary() {
  const [total, open, progress, resolved, critical, byCategory] = await Promise.all([
    Ticket.countDocuments(), Ticket.countDocuments({ status: 'Open' }), Ticket.countDocuments({ status: 'In Progress' }), Ticket.countDocuments({ status: 'Resolved' }), Ticket.countDocuments({ priority: 'Critical', status: { $in: ['Open', 'In Progress'] } }), Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
  ]);
  return { total, open, inProgress: progress, resolved, criticalUnresolved: critical, byCategory };
}
