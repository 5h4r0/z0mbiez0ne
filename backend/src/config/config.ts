// src/config/config.ts

// -> load env vars once
import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const valid = <T extends string>(val: string | undefined, allowed: readonly T[], fallback: T): T =>
  val && allowed.includes(val as T) ? (val as T) : fallback;

const nodeEnv: NodeEnv = valid(process.env.NODE_ENV, ['development', 'production', 'test'] as const, 'development');
const logLevel: LogLevel = valid(process.env.LOG_LEVEL, ['error', 'warn', 'info', 'debug'] as const, 'info');

const secure = nodeEnv === 'production';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'jwt-access-secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret';

if (secure && accessSecret === 'jwt-access-secret') throw new Error('JWT_ACCESS_SECRET must be set in production');
if (secure && refreshSecret === 'jwt-refresh-secret') throw new Error('JWT_REFRESH_SECRET must be set in production');

if (!secure) {
  if (accessSecret === 'jwt-access-secret') console.warn('⚠️  Using default JWT_ACCESS_SECRET, define it in .env');
  if (refreshSecret === 'jwt-refresh-secret') console.warn('⚠️  Using default JWT_REFRESH_SECRET, define it in .env');
}

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

export const config = {
  server: {
    env: nodeEnv,
    port: parseInt(process.env.PORT || '3000', 10),
    allowedOrigins,
    secure,
    logLevel,
  },
  jwt: {
    accessSecret,
    refreshSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
