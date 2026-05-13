import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedError('missing access token');

    const token = auth.slice(7);
    const { userId, roleId } = verifyAccessToken(token);
    req.user = { id: userId, roleId };
    next();
  } catch {
    next(new UnauthorizedError('invalid or expired access token'));
  }
}
