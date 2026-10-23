import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, _req, res, _next) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err instanceof ApiError ? err.message : 'Internal server error';
  let details = err instanceof ApiError ? err.details : undefined;
  if (err?.name === 'ValidationError') { statusCode = 400; message = 'Database validation failed'; details = Object.values(err.errors).map((item) => item.message); }
  if (err?.code === 11000) { statusCode = 409; message = 'A record with this value already exists'; details = err.keyValue; }
  if (err?.name === 'CastError') { statusCode = 400; message = 'Invalid resource identifier'; }
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({ success: false, message, ...(details ? { details } : {}), ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}) });
}
