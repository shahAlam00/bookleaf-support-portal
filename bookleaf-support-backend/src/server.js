import http from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { User } from './modules/users/user.model.js';
import { setTicketIO } from './modules/tickets/ticket.service.js';

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: env.CLIENT_URL.split(',').map((item) => item.trim()), credentials: true } });
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id role isActive');
    if (!user || !user.isActive) return next(new Error('Account unavailable'));
    socket.user = { id: String(user._id), role: user.role };
    next();
  } catch { next(new Error('Invalid or expired token')); }
});
io.on('connection', (socket) => {
  if (socket.user.role === 'admin') socket.join('admins');
  else socket.join(`author:${socket.user.id}`);
});
setTicketIO(io);

await connectDB();
httpServer.listen(env.PORT, () => console.log(`BookLeaf API listening on port ${env.PORT}`));

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down gracefully`);
  io.close();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
