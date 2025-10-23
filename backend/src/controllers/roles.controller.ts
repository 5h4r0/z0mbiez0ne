import type { Request, Response } from 'express';
import { getPagination } from '../helpers/index.js';
import { prisma } from '../models/index.js';

/** get all */
export const getRoles = (_req: Request, res: Response): Promise<void> => {
  return prisma.roles
    .findMany()
    .then((roles) => {
      res.status(200).json({
        success: true,
        data: roles,
      });
    })
    .catch((error) => {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching roles',
        error: 'Internal server error',
      });
    });
};

/** get one */
export const getRole = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { take, skip } = getPagination(req);

  return prisma.roles
    .findUnique({
      where: { id: Number(id) },
      include: {
        users: Object.assign(
          {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
            },
          },
          take !== undefined ? { take } : {},
          skip !== undefined ? { skip } : {},
        ),
      },
    })
    .then((role) => {
      role
        ? res.status(200).json({
            id: role.id,
            name: role.name,
            users: role.users,
          })
        : res.status(404).json({ message: `Role ${id} not found` });
    })
    .catch((error) => {
      console.error(`Error fetching role with id: ${id}`, error);
      res.status(500).json({ message: 'Internal server error' });
    });
};
