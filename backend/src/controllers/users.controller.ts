import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { getPagination } from '../helpers/getPagination.js';
import { BadRequestError, ConflictError } from '../lib/errors.js';
import { prisma } from '../models/index.js';

// Type utilitaire : un user avec sa relation "role"
type UserWithRole = Prisma.usersGetPayload<{ include: { role: true } }>;

/** GET all */
export async function getUsers(req: Request, res: Response): Promise<void> {
  const { take, skip } = getPagination(req);

  const options: Parameters<typeof prisma.users.findMany>[0] = Object.assign(
    {
      include: {
        role: true,
        orders: {
          select: {
            id: true,
            total_amount: true,
            status: true,
            payment_date: true,
          },
        },
      },
    },
    take !== undefined ? { take: take as number } : {},
    skip !== undefined ? { skip: skip as number } : {},
  );

  try {
    const users = await prisma.users.findMany(options);
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
      throw new BadRequestError(`Invalid user id ${req.params.id}`);
    }

    const user = (await prisma.users.findUnique({ where: { id: userId }, include: { role: true } })) as UserWithRole | null;

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
      res.status(404).json({ message: `User ${userId} not found` });
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).json({ status: 'error', message: (error as Error).message });
    } else {
      console.error(`Error fetching user with id: ${userId}`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

/** UPDATE */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstname, lastname, role_id } = req.body;

  try {
    // check if another user already has this email
    const existing = await prisma.users.findFirst({
      where: {
        email,
        NOT: { id: Number(id) }, // exclude the current user from the check
      },
    });

    // if another user already uses this email, reject
    if (existing) {
      throw new ConflictError('Email already taken');
    }

    // otherwise, update the current user
    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data: { email, firstname, lastname, role_id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role_id: true,
      },
    });

    // send a consistent REST response with sanitized user data
    res.status(200).json({
      status: 'success',
      data: updatedUser,
      message: `User ${id} updated`,
    });
  } catch (error) {
    // handle Prisma "record not found" error (P2025)
    if ((error as { code?: string }).code === 'P2025') {
      res.status(404).json({ status: 'error', message: `User ${id} not found` });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'Internal server error' });
    }
  }
};

/** DELETE */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);

  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    if (orders.length > 0) {
      throw { type: 'hasOrders', ids: orders.map((o) => o.id) };
    }

    const deleted = await prisma.users.delete({ where: { id: userId } });

    res.status(200).json({ success: true, data: deleted, message: `User ${id} deleted` });
  } catch (error: unknown) {
    const err = error as { type?: string; ids?: number[] };
    if (err?.type === 'hasOrders') {
      res.status(400).json({
        success: false,
        error: `Cannot delete user ${id}, order ${err.ids?.join(', ')} depend exclusively on it`,
      });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: `User ${id} not found`,
      });
    } else {
      console.error(`Error deleting user ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};
