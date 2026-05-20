import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError('missing access token');

    const { userId, roleId } = verifyAccessToken(token);
    req.user = { id: userId, roleId };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('access token expired'));
    } else {
      next(new UnauthorizedError('invalid access token'));
    }
  }
}
