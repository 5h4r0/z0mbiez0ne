// src/config/config.ts

// -> load env vars once
import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// small helper for validation with fallback
const valid = <T extends string>(val: string | undefined, allowed: readonly T[], fallback: T): T =>
  val && allowed.includes(val as T) ? (val as T) : fallback;

// environment variables with validation and defaults
const nodeEnv: NodeEnv = valid(process.env.NODE_ENV, ['development', 'production', 'test'] as const, 'development');
const logLevel: LogLevel = valid(process.env.LOG_LEVEL, ['error', 'warn', 'info', 'debug'] as const, 'info');

// secure mode is true only in production
const secure = nodeEnv === 'production';

const jwtSecret = process.env.JWT_SECRET || 'jwt-secret';

// warn in non-prod when using weak fallback
jwtSecret === 'jwt-secret' && !secure ? console.warn('⚠️ Using default jwt-secret, define JWT_SECRET in .env') : null;

// hard fail in production if weak secret
if (secure && jwtSecret === 'jwt-secret') {
  throw new Error('A secure JWT_SECRET must be set in production');
}

// allowed origins as array
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['*'];

export const config = {
  server: {
    env: nodeEnv,
    port: parseInt(process.env.PORT || '3000', 10),
    allowedOrigins,
    jwtSecret,
    secure,
    logLevel,
  },
};
