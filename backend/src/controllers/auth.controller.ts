import type { Request, Response } from 'express';
import z from 'zod';
import { config } from '../config/config.js';
import { comparePassword, hashPassword } from '../lib/auth.js';
import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/tokens.js';
import { prisma } from '../models/index.js';

const ACCESS_EXPIRES_MS = 15 * 60 * 1000;
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

/** Register */

const passwordBlacklist: string[] = process.env.PASSWORDS_BLACKLIST
  ? process.env.PASSWORDS_BLACKLIST.split(',').map((o) => o.trim())
  : [];

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' })
  .refine((val) => !/\s/.test(val), { message: 'Password must not contain spaces' })
  .refine((val) => !passwordBlacklist.includes(val), { message: 'This password is not allowed' });

const registerBodySchema = z
  .object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.email(),
    role_id: z.number(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export async function registerUser(req: Request, res: Response) {
  try {
    const { firstname, lastname, email, password, role_id } = await registerBodySchema.parseAsync(req.body);

    const existing = await prisma.users.findFirst({ where: { email } });
    if (existing) throw new ConflictError('Email already taken');

    const role = await prisma.roles.findUnique({ where: { id: role_id } });
    if (!role) return res.status(400).json({ status: 'error', message: 'Invalid role' });

    const password_hash = await hashPassword(password);

    const newUser = await prisma.users.create({
      data: { firstname, lastname, email, role_id, password_hash },
      select: { id: true, firstname: true, lastname: true, email: true, role_id: true },
    });

    const accessToken = generateAccessToken(newUser.id, newUser.role_id);
    const refreshToken = generateRefreshToken(newUser.id);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      status: 'success',
      data: newUser,
      token: accessToken,
      type: 'Bearer',
    });
  } catch (error) {
    handleError(res, error, 'Failed to register user');
  }
}

/** Login */

const loginBodySchema = z.object({
  email: z.email({ message: 'invalid email address' }),
  password: z.string().min(1, { message: 'password is required' }),
});

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = await loginBodySchema.parseAsync(req.body);

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new UnauthorizedError('email and password do not match');

    const isMatching = await comparePassword(password, user.password_hash);
    if (!isMatching) throw new UnauthorizedError('email and password do not match');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const refreshToken = generateRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      token: accessToken,
      type: 'Bearer',
      expiresInMS: ACCESS_EXPIRES_MS,
      message: `user ${email} logged in successfully`,
    });
  } catch (error) {
    handleError(res, error, 'login failed');
  }
}

/** Logout */
export async function logoutUser(_req: Request, res: Response) {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.status(200).json({ status: 'success', message: 'logged out' });
}

/** Refresh */
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!raw) throw new UnauthorizedError('refresh token not provided');

    const { userId } = verifyRefreshToken(raw);

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('user not found');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const refreshToken = generateRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      status: 'success',
      token: accessToken,
      type: 'Bearer',
      expiresInMS: ACCESS_EXPIRES_MS,
    });
  } catch (error) {
    handleError(res, error, 'failed to refresh token');
  }
}

/** Get authenticated user profile */
export async function getAuthenticatedUser(req: Request, res: Response) {
  try {
    if (!req.user) throw new UnauthorizedError('not authenticated');
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      omit: { password_hash: true },
    });
    if (!user) throw new UnauthorizedError('user not found');
    res.json(user);
  } catch (error) {
    handleError(res, error, 'failed to get user');
  }
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    maxAge: REFRESH_EXPIRES_MS,
    secure: config.server.secure,
    path: '/api/auth/refresh',
  });
}

function handleError(res: Response, error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
  }
  res.status((error as { status?: number }).status || 500).json({
    status: 'error',
    message: (error as Error).message || fallback,
  });
}
