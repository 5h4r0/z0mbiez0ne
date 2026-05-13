import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// accept only the fields required for the token
type User = {
  id: number;
  role: string;
};

export function generateAuthenticationTokens(user: User) {
  const payload = {
    userId: user.id,
    role: user.role,
  };

  // signed JWT access token
  const accessToken = jwt.sign(payload, config.server.jwtSecret, { expiresIn: '15m' });

  // opaque random refresh token
  const refreshToken = crypto.randomBytes(128).toString('base64');

  // return both tokens with metadata
  return {
    accessToken: {
      token: accessToken,
      type: 'Bearer',
      expiresInMS: 15 * 60 * 1000, // 15mn
    },
    refreshToken: {
      token: refreshToken,
      type: 'Bearer',
      expiresInMS: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };
}