import * as argon2 from 'argon2';
import type { Request, Response } from 'express';
import z from 'zod';
import { config } from '../config/config.js';
import { comparePassword, hashPassword } from '../lib/auth.js';
import { createAndSendVerificationToken } from '../lib/emailVerification.js';
import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import { sendNewUserEmail } from '../lib/mailer.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/tokens.js';
import { prisma } from '../models/index.js';

const ACCESS_EXPIRES_MS = 15 * 60 * 1000;
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

import { passwordSchema } from '../lib/schemas/password.js';

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
    const { jwt: refreshJwt, tokenId } = generateRefreshToken(newUser.id);

    await persistRefreshToken(newUser.id, tokenId, refreshJwt);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshJwt);

    try {
      await createAndSendVerificationToken(newUser.id, newUser.email);
    } catch (err) {
      console.error('sendVerificationEmail after register failed:', err);
    }

    try {
      const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? req.ip ?? 'inconnue';
      await sendNewUserEmail(
        newUser.id,
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.role_id,
        ip,
        new Date(),
      );
    } catch (err) {
      console.error('sendNewUserEmail after register failed:', err);
    }

    res.status(201).json({ status: 'success', data: newUser });
  } catch (error) {
    handleError(res, error, 'Failed to register user');
  }
}

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
    const { jwt: refreshJwt, tokenId } = generateRefreshToken(user.id);

    await persistRefreshToken(user.id, tokenId, refreshJwt);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshJwt);

    res.status(200).json({
      status: 'success',
      expiresInMS: ACCESS_EXPIRES_MS,
      message: `user ${email} logged in successfully`,
    });
  } catch (error) {
    handleError(res, error, 'login failed');
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const { userId } = verifyRefreshToken(raw);
      await prisma.refreshToken.deleteMany({ where: { user_id: userId } });
    }
  } catch {
    // silencieux — token invalide ou BDD indisponible
  } finally {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth' });
  }
  res.status(200).json({ status: 'success', message: 'logged out' });
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) throw new UnauthorizedError('refresh token not provided');

    const { userId, tokenId } = verifyRefreshToken(raw);

    const stored = await prisma.refreshToken.findUnique({
      where: { token_id: tokenId },
    });

    if (!stored || stored.user_id !== userId || stored.expired_at < new Date()) {
      throw new UnauthorizedError('refresh token invalid or expired');
    }

    const valid = await comparePassword(raw, stored.token_hash);
    if (!valid) throw new UnauthorizedError('refresh token hash mismatch');

    // DELETE atomique — count 0 = token déjà consommé (race condition)
    const deleted = await prisma.refreshToken.deleteMany({
      where: { id: stored.id, user_id: userId },
    });
    if (deleted.count === 0) throw new UnauthorizedError('refresh token already used');

    // Nettoyage tokens expirés (housekeeping silencieux)
    prisma.refreshToken
      .deleteMany({
        where: { user_id: userId, expired_at: { lt: new Date() } },
      })
      .catch(() => {});

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('user not found');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const { jwt: newRefreshJwt, tokenId: newTokenId } = generateRefreshToken(user.id);

    await persistRefreshToken(user.id, newTokenId, newRefreshJwt);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshJwt);

    res.status(200).json({ status: 'success', expiresInMS: ACCESS_EXPIRES_MS });
  } catch (error) {
    handleError(res, error, 'failed to refresh token');
  }
}

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

const verifyEmailQuerySchema = z.object({ token: z.string().min(1) });

export async function sendVerificationEmailController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('not authenticated');
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { email: true },
    });
    if (!user) throw new UnauthorizedError('user not found');
    await createAndSendVerificationToken(req.user.id, user.email);
    res.status(200).json({ success: true, message: 'Email de vérification envoyé.' });
  } catch (error) {
    handleError(res, error, 'Failed to send verification email');
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const parsed = verifyEmailQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
    return;
  }

  const { token } = parsed.data;

  try {
    const records = await prisma.emailVerificationToken.findMany({
      where: { used_at: null, expires_at: { gt: new Date() } },
      select: { id: true, user_id: true, token_hash: true },
    });

    let matched: (typeof records)[number] | null = null;
    for (const record of records) {
      const isValid = await argon2.verify(record.token_hash, token);
      if (isValid) {
        matched = record;
        break;
      }
    }

    if (!matched) {
      res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
      return;
    }

    await prisma.$transaction([
      prisma.users.update({
        where: { id: matched.user_id },
        data: { email_verified_at: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: matched.id },
        data: { used_at: new Date() },
      }),
    ]);

    res.status(200).json({ success: true, message: 'Adresse email confirmée.' });
  } catch (error) {
    handleError(res, error, 'Failed to verify email');
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function persistRefreshToken(userId: number, tokenId: string, jwt: string): Promise<void> {
  const token_hash = await hashPassword(jwt);
  await prisma.refreshToken.create({
    data: {
      token_id: tokenId,
      token_hash,
      user_id: userId,
      issued_at: new Date(),
      expired_at: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });
}

function setAccessCookie(res: Response, token: string): void {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: config.server.secure,
    sameSite: 'strict',
    path: '/',
    maxAge: ACCESS_EXPIRES_MS,
  });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.server.secure,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_EXPIRES_MS,
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
