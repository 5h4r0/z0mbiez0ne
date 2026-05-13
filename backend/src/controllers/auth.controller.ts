import type { users } from '@prisma/client';
import argon2 from 'argon2';
import type { Request, Response } from 'express';
import z from 'zod';
import { config } from '../config/config.js';
import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import { generateAuthenticationTokens } from '../lib/token.js';
import { prisma } from '../models/index.js';

/** Register */
export async function registerUser(req: Request, res: Response) {
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
    .refine((val) => !/\s/.test(val), { message: 'Password must not contain spaces' })
    .refine((val) => !passwordBlacklist.includes(val), { message: 'This password is not allowed' });

  const registerUserBodySchema = z
    .object({
      firstname: z.string().min(1),
      lastname: z.string().min(1),
      email: z.email(),
      role_id: z.number(),
      password: passwordSchema,
      confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, { path: ['confirm'], message: 'Passwords do not match' });

  try {
    const { firstname, lastname, email, password, role_id } = await registerUserBodySchema.parseAsync(req.body);

    // check if email is already taken
    const existing = await prisma.users.findFirst({ where: { email } });
    if (existing) {
      throw new ConflictError('Email already taken');
    }

    // hash password
    const password_hash = await argon2.hash(password);

    // create user
    const newUser = await prisma.users.create({
      data: { firstname, lastname, email, role_id, password_hash },
      select: { id: true, firstname: true, lastname: true, email: true, role_id: true },
    });

    res.status(201).json({
      status: 'success',
      data: newUser,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: error.issues.map((e) => e.message).join(', '),
      });
    }
    res.status((error as { status?: number }).status || 500).json({
      status: 'error',
      message: (error as Error).message || 'Failed to register user',
    });
  }
}

/** Login */

// schema for login body validation
const loginUserBodySchema = z.object({
  email: z.email({ message: 'invalid email address' }),
  password: z.string().min(1, { message: 'password is required' }),
});

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = await loginUserBodySchema.parseAsync(req.body);

    // search user by email, include role to get role name for JWT
    const user = await prisma.users.findFirst({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedError('email and password do not match');
    }

    // verify password
    const isMatching = await argon2.verify(user.password_hash, password);
    console.log(`login attempt for ${user.email} → ${isMatching ? 'SUCCESS' : 'FAILURE'}`);
    if (!isMatching) {
      throw new UnauthorizedError('email and password do not match');
    }

    // generate signed JWT access token and opaque refresh token
    const { accessToken, refreshToken } = generateAuthenticationTokens({
      id: user.id,
      role: user.role.name,
    });

    // persist refresh token in DB
    await replaceRefreshTokenInDatabase(refreshToken, user);

    // choose auth mode based on client header (default: cookie)
    const mode = req.header('X-Auth-Mode') || 'cookie';

    if (mode === 'bearer') {
      // bearer mode → return tokens in JSON (mobile apps / public API)
      return res.status(200).json({
        status: 'success',
        token: accessToken,
        type: 'Bearer',
        refresh_token: refreshToken,
        expiresInMS: accessToken.expiresInMS,
        message: `user ${email} logged in successfully`,
      });
    }

    // cookie mode → set httpOnly cookies (web clients)
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({
      status: 'success',
      message: `user ${email} logged in successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: error.issues.map((e) => e.message).join(', '),
      });
    }
    res.status((error as { status?: number }).status || 500).json({
      status: 'error',
      message: (error as Error).message || 'login failed',
    });
  }
}

/** Logout */
export async function logoutUser(_: Request, res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.status(202).json({ status: 200, message: 'Successfully logged out' });
}

/** Refresh token */
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    // get token from cookies or body
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!rawToken) {
      throw new UnauthorizedError('Refresh token not provided');
    }

    // search refresh token in DB, include user and their role
    const existingRefreshToken = await prisma.refreshToken.findFirst({
      where: { token: rawToken },
      include: { user: { include: { role: true } } },
    });
    if (!existingRefreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // check token expiry
    if (existingRefreshToken.expired_at < new Date()) {
      await prisma.refreshToken.delete({ where: { id: existingRefreshToken.id } });
      throw new UnauthorizedError('Expired refresh token');
    }

    // generate new tokens
    const { accessToken, refreshToken } = generateAuthenticationTokens({
      id: existingRefreshToken.user.id,
      role: existingRefreshToken.user.role.name,
    });

    // rotate refresh token in DB
    await replaceRefreshTokenInDatabase(refreshToken, existingRefreshToken.user);

    // set new cookies
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status((error as { status?: number }).status || 500).json({
      status: 'error',
      message: (error as Error).message || 'Failed to refresh token',
    });
  }
}

/** Get authenticated user profile */
export async function getAuthenticatedUser(req: Request, res: Response) {
  try {
    // userId is injected as string by checkRoles middleware
    const userId = parseInt((req as unknown as { userId: string }).userId, 10);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      omit: { password_hash: true },
    });
    if (!user) {
      throw new UnauthorizedError('JWT payload does not match any user');
    }

    res.json(user);
  } catch (error) {
    res.status((error as { status?: number }).status || 500).json({
      status: 'error',
      message: (error as Error).message || 'Failed to get user',
    });
  }
}

interface Token {
  token: string;
  type: string;
  expiresInMS: number;
}

// replace refresh token in DB (rotation)
async function replaceRefreshTokenInDatabase(refreshToken: Token, user: users) {
  await prisma.refreshToken.deleteMany({ where: { user_id: user.id } });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken.token,
      user_id: user.id,
      issued_at: new Date(),
      expired_at: new Date(Date.now() + refreshToken.expiresInMS),
    },
  });
}

// set access token cookie
function setAccessTokenCookie(res: Response, accessToken: Token) {
  res.cookie('accessToken', accessToken.token, {
    httpOnly: true,
    maxAge: accessToken.expiresInMS,
    secure: config.server.secure,
  });
}

// set refresh token cookie — path restreint pour limiter les transferts
function setRefreshTokenCookie(res: Response, refreshToken: Token) {
  res.cookie('refreshToken', refreshToken.token, {
    httpOnly: true,
    maxAge: refreshToken.expiresInMS,
    secure: config.server.secure,
    path: '/api/auth/refresh',
  });
}