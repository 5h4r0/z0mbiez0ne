import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { getPagination } from '../helpers/getPagination.js';
import { BadRequestError, ConflictError } from '../lib/errors.js';
import { prisma } from '../models/index.js';

// Type utilitaire : un user avec sa relation "role"
type UserWithRole = Prisma.usersGetPayload<{ include: { role: true } }>;

/** GET all */
export function getUsers(req: Request, res: Response): Promise<void> {
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

  return prisma.users
    .findMany(options)
    .then((users) => {
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
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    });
}

/** GET one */
export const getUser = (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  return Number.isFinite(userId)
    ? prisma.users
        .findUnique({ where: { id: userId }, include: { role: true } })
        .then((user: UserWithRole | null) => {
          // -> side-effect only, no return
          user
            ? res.status(200).json({
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at,
                role: user.role?.name ?? null,
              })
            : res.status(404).json({ message: `User ${userId} not found` });
        })
        .catch((error) => {
          console.error(`Error fetching user with id: ${userId}`, error);
          res.status(500).json({ message: 'Internal server error' });
        })
    : Promise.reject(new BadRequestError(`Invalid user id ${req.params.id}`)).catch((err) => {
        res.status(400).json({ status: 'error', message: err.message });
      });
};

/** UPDATE */
export const updateUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstname, lastname, role_id } = req.body;

  return prisma.users
    .findFirst({
      // check if another user already has this email
      where: {
        email,
        NOT: { id: Number(id) }, // exclude the current user from the check
      },
    })
    .then((existing) => {
      // if another user already uses this email, reject
      return existing
        ? Promise.reject(new ConflictError('Email already taken'))
        : // otherwise, update the current user
          prisma.users.update({
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
    })
    .then((updatedUser) =>
      // send a consistent REST response with sanitized user data
      res
        .status(200)
        .json({
          status: 'success',
          data: updatedUser,
          message: `User ${id} updated`,
        }),
    )
    .catch((error) => {
      // handle Prisma "record not found" error (P2025)
      return error.code === 'P2025'
        ? res.status(404).json({ status: 'error', message: `User ${id} not found` })
        : res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    });
};

/** DELETE */
export const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);

  return prisma.orders
    .findMany({
      where: { user_id: userId },
      select: { id: true },
    })
    .then((orders) =>
      orders.length > 0
        ? Promise.reject({ type: 'hasOrders', ids: orders.map((o) => o.id) })
        : prisma.users.delete({ where: { id: userId } }),
    )
    .then((deleted) => res.status(200).json({ success: true, data: deleted, message: `User ${id} deleted` }))
    .catch((error) =>
      error?.type === 'hasOrders'
        ? res.status(400).json({
            success: false,
            error: `Cannot delete user ${id}, order ${error.ids.join(', ')} depend exclusively on it`,
          })
        : error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
          ? res.status(404).json({
              success: false,
              error: `User ${id} not found`,
            })
          : (() => {
              console.error(`Error deleting user ${id}:`, error);
              return res.status(500).json({
                success: false,
                error: 'Internal server error',
              });
            })(),
    );
};
