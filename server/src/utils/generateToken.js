import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const getUserId = (user) => user.user_id || user.userId;
const getRole = (user) => user.role;
const getEmail = (user) => user.email;

export const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub: getUserId(user),
      role: getRole(user),
      email: getEmail(user),
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenExpiresIn }
  );

export const generateRefreshToken = (user) =>
  jwt.sign(
    {
      sub: getUserId(user),
      role: getRole(user),
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

const isProduction = env.nodeEnv === 'production';

export const accessCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 15 * 60 * 1000,
  path: '/',
};

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};
