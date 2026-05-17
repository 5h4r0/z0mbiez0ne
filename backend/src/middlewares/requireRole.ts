import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import { prisma } from '../models/index.js';

export function requireRole(...roleNames: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('not authenticated');

      // use cached roleName if already loaded by a previous requireRole call
      const roleName = req.user.roleName ?? (await prisma.roles.findUnique({ where: { id: req.user.roleId } }))?.name;

      if (!roleName) throw new ForbiddenError('role not found');

      if (!roleNames.includes(roleName)) {
        throw new ForbiddenError(`role '${roleName}' is not allowed`);
      }

      req.user.roleName = roleName;
      next();
    } catch (err) {
      next(err);
    }
  };
}
