import { supabase } from '../config/db.js';
import { sendError } from '../utils/apiResponse.js';
import { verifyAccessToken } from '../utils/generateToken.js';

const usersTable = 'app_users(Registration)';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return sendError(res, 'Authorization token is required', 401);
    }
    const payload = verifyAccessToken(token);

    const { data: user, error } = await supabase
      .from(usersTable)
      .select('user_id, name, email, phone, role, is_active, created_at, updated_at')
      .eq('user_id', payload.sub)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user || !user.is_active) {
      return sendError(res, 'User is not authorized', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};
