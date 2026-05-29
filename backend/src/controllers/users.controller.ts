import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import type { Request, Response } from 'express';
import z from 'zod';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
import { passwordSchema } from '../lib/schemas/password.js';
import { prisma } from '../models/index.js';

// Type utilitaire : un user avec sa relation "role"
type UserWithRole = Prisma.usersGetPayload<{ include: { role: true } }>;

/** GET all */
export async function getUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? '20')));
  const skip = (page - 1) * limit;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where: Prisma.usersWhereInput = search
    ? {
        OR: [
          { lastname: { contains: search, mode: 'insensitive' } },
          { firstname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        include: { role: true },
        orderBy: [{ lastname: 'asc' }, { firstname: 'asc' }],
        take: limit,
        skip,
      }),
      prisma.users.count({ where }),
    ]);
    const list = users as UserWithRole[];

    res.status(200).json({
      success: true,
      data: list.map((u) => ({
        id: u.id,
        email: u.email,
        firstname: u.firstname,
        lastname: u.lastname,
        created_at: u.created_at,
        updated_at: u.updated_at,
        deleted_at: u.deleted_at,
        role: u.role?.name ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/** GET one */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  try {
    if (!Number.isFinite(userId)) {
      res.status(400).json({ success: false, message: buildErrorMessage('invalid_id', 'user', req.params.id) });
      return;
    }

    const user = (await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    })) as UserWithRole | null;

    if (user) {
      // -> side-effect only, no return
      res.status(200).json({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        role: user.role?.name ?? null,
      });
    } else {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'user', String(userId)) });
    }
  } catch (error) {
    console.error(`Error fetching user with id: ${userId}`, error);
    res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'user') });
  }
};

/** UPDATE PASSWORD */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const bodySchema = z.object({
    current_password: z.string(),
    new_password: passwordSchema,
  });

  const userId = Number(req.params.id);

  try {
    const caller = req.user;
    if (!caller || (caller.roleName !== 'admin' && caller.id !== userId)) {
      throw new ForbiddenError('forbidden');
    }

    const body = await bodySchema.parseAsync(req.body);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, password_hash: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'user', String(userId)) });
      return;
    }

    const isMatching = await argon2.verify(user.password_hash, body.current_password);
    if (!isMatching) {
      throw new UnauthorizedError('current password is incorrect');
    }

    const newHash = await argon2.hash(body.new_password);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { user_id: userId } }),
      prisma.users.update({ where: { id: userId }, data: { password_hash: newHash } }),
    ]);

    res.status(200).json({ success: true, message: buildCudMessage('updated', 'user', String(userId)) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status((error as { status?: number }).status || 500).json({
        success: false,
        message: (error as Error).message || buildErrorMessage('internal_error', 'user'),
      });
    }
  }
};

/** UPDATE */
export const updateUser = async (req: Request, res: Response) => {
  const bodySchema = z.object({
    email: z.string().email(),
    firstname: z.string().min(1).max(100),
    lastname: z.string().min(1).max(100),
    role_id: z.number().int().positive().optional(),
  });

  const { id } = req.params;

  try {
    const userId = Number(id);
    const caller = req.user;
    if (!caller || (caller.roleName !== 'admin' && caller.id !== userId)) {
      res.status(403).json({ success: false, message: 'forbidden' });
      return;
    }

    const body = await bodySchema.parseAsync(req.body);

    // verify role exists if provided
    if (body.role_id !== undefined) {
      const role = await prisma.roles.findUnique({ where: { id: body.role_id } });
      if (!role) {
        res.status(400).json({ success: false, message: `role ${body.role_id} not found` });
        return;
      }
    }

    // check if another user already has this email
    const existing = await prisma.users.findFirst({
      where: { email: body.email, NOT: { id: Number(id) } },
    });
    if (existing) {
      throw new ConflictError(buildErrorMessage('already_exists', 'user', body.email));
    }

    const { role_id, ...rest } = body;
    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: role_id !== undefined ? { ...rest, role_id } : rest,
      select: { id: true, firstname: true, lastname: true, email: true, role_id: true },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: buildCudMessage('updated', 'user', updatedUser.email),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'user', id) });
    } else {
      res.status((error as { status?: number }).status || 500).json({
        success: false,
        message: (error as Error).message || buildErrorMessage('internal_error', 'user'),
      });
    }
  }
};

/** DELETE */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);

  try {
    const caller = req.user;
    if (!caller || (caller.roleName !== 'admin' && caller.id !== userId)) {
      res.status(403).json({ success: false, message: 'forbidden' });
      return;
    }

    const activeOrders = await prisma.orders.findMany({
      where: { user_id: userId, status: { in: ['Pending', 'Confirmed'] } },
      select: { id: true },
    });

    if (activeOrders.length > 0) {
      throw { type: 'hasOrders', ids: activeOrders.map((o) => o.id) };
    }

    const [, deleted] = await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { user_id: userId } }),
      prisma.users.update({ where: { id: userId }, data: { deleted_at: new Date() } }),
    ]);

    res.status(200).json({ success: true, data: deleted, message: buildCudMessage('deleted', 'user', deleted.email) });
  } catch (error: unknown) {
    const err = error as { type?: string; ids?: number[] };
    if (err?.type === 'hasOrders') {
      res.status(400).json({ success: false, message: buildErrorMessage('has_orders', 'user', id) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'user', id) });
    } else {
      console.error(`Error deleting user ${id}:`, error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'user') });
    }
  }
};
