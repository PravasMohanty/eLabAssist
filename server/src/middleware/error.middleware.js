import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) =>
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  return sendError(res, err.message || 'Internal server error', statusCode);
};
