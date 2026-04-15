import { sendError } from '../utils/apiResponse.js';

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, 'You do not have permission to perform this action', 403);
  }

  return next();
};
