import bcrypt from 'bcryptjs';
import { supabase } from '../config/db.js';
import { env } from '../config/env.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import {
  accessCookieOptions,
  generateAccessToken,
  generateRefreshToken,
  refreshCookieOptions,
  verifyRefreshToken,
} from '../utils/generateToken.js';

const userSelect =
  'user_id, name, email, phone, role, is_active, created_at, updated_at, password_hash';
const usersTable = 'app_users(Registration)';
const getStoredPasswordHash = (user) => user.password_hash?.trim();
const attachAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

const normalizeUser = (user) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

const validateRegistrationBody = ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    return 'name, email, password, and role are required';
  }

  const allowedRoles = ['admin', 'pathologist', 'receptionist', 'patient'];
  if (!allowedRoles.includes(role)) {
    return `role must be one of: ${allowedRoles.join(', ')}`;
  }

  if (password.length < 8) {
    return 'password must be at least 8 characters long';
  }

  return null;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, isActive } = req.body;
    const validationError = validateRegistrationBody({ name, email, password, role });

    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { data: existingUser, error: existingUserError } = await supabase
      .from(usersTable)
      .select('user_id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return sendError(res, 'User already exists with this email', 409);
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

    const { data: user, error: createError } = await supabase
      .from(usersTable)
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        phone: phone?.trim() || null,
        role,
        is_active: typeof isActive === 'boolean' ? isActive : true,
      })
      .select(userSelect)
      .single();

    if (createError) {
      throw createError;
    }

    return sendSuccess(
      res,
      'User registered successfully',
      { user: normalizeUser(user) },
      201
    );
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'email and password are required', 400);
    }

    const { data: user, error } = await supabase
      .from(usersTable)
      .select(userSelect)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.is_active) {
      return sendError(res, 'User account is inactive', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, getStoredPasswordHash(user));
    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    attachAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 'Login successful', {
      accessToken,
      refreshToken,
      user: normalizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'refreshToken is required', 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    const { data: user, error } = await supabase
      .from(usersTable)
      .select(userSelect)
      .eq('user_id', payload.sub)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user || !user.is_active) {
      return sendError(res, 'User is not authorized', 401);
    }

    const nextAccessToken = generateAccessToken(user);
    const nextRefreshToken = generateRefreshToken(user);
    attachAuthCookies(res, nextAccessToken, nextRefreshToken);

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const me = async (req, res) =>
  sendSuccess(res, 'Current user fetched successfully', {
    user: normalizeUser(req.user),
  });

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'currentPassword and newPassword are required', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'newPassword must be at least 8 characters long', 400);
    }

    const { data: user, error } = await supabase
      .from(usersTable)
      .select(userSelect)
      .eq('user_id', req.user.user_id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      getStoredPasswordHash(user)
    );
    if (!isPasswordValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);

    const { error: updateError } = await supabase
      .from(usersTable)
      .update({ password_hash: passwordHash })
      .eq('user_id', user.user_id);

    if (updateError) {
      throw updateError;
    }

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    return next(error);
  }
};
