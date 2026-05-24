import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

interface AccessTokenPayload {
  userId: number;
  roleId: number;
}

interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
}

// jwt.SignOptions['expiresIn'] is `number | StringValue` (branded string from ms)
// env vars are plain `string` — double-cast is the idiomatic bridge
type Expiry = NonNullable<jwt.SignOptions['expiresIn']>;

export function generateAccessToken(userId: number, roleId: number): string {
  return jwt.sign({ userId, roleId } satisfies AccessTokenPayload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as unknown as Expiry,
  });
}

export function generateRefreshToken(userId: number): { jwt: string; tokenId: string } {
  const tokenId = randomUUID();
  const token = jwt.sign({ userId, tokenId } satisfies RefreshTokenPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as unknown as Expiry,
  });
  return { jwt: token, tokenId };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
  if (typeof payload.userId !== 'number' || typeof payload.roleId !== 'number') {
    throw new Error('invalid access token payload');
  }
  return { userId: payload.userId, roleId: payload.roleId };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  if (typeof payload.userId !== 'number' || typeof payload.tokenId !== 'string') {
    throw new Error('invalid refresh token payload');
  }
  return { userId: payload.userId, tokenId: payload.tokenId };
}
