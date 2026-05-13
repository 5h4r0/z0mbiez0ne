import { format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // -> use US locale
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { BadRequestError } from '../lib/errors.js';
import { prisma } from '../models/index.js';

/** get all sessions */
export const getSessions = async (req: Request, res: Response) => {
  const { take, skip } = getPagination(req);
  // schema to validate pagination query
  const paginationSchema = z.object({
    take: z.string().optional(),
    skip: z.string().optional(),
  });

  try {
    await paginationSchema.parseAsync(req.query);

    // args for prisma findMany
    const args = {
      include: {
        orders_lines: {
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
            },
          },
        },
      },
      ...(take !== undefined ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    };

    // query sessions with relations
    const sessions = await prisma.sessions.findMany(args);

    // format sessions with flattened users
    const formatted = sessions.map((s) => ({
      id: s.id,
      date: format(new Date(s.date), 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS }),
      capacity: s.capacity,
      unit_price: Number(s.unit_price),
      status: s.status,
      users: s.orders_lines.map((ol) => ol.order.user),
    }));

    // handle empty result
    if (formatted.length === 0) {
      throw new BadRequestError('no sessions caught');
    }

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    // handle zod error
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else {
      // handle generic error
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error fetching sessions' });
    }
  }
};

/** get one */
export const getSession = async (req: Request, res: Response) => {
  // schema to validate route param
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);

    // args for prisma findUnique
    const args = {
      where: { id: Number(id) }, // required for findUnique
      include: {
        orders_lines: {
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
            },
          },
        },
      },
    };

    // query session with relations
    const session = await prisma.sessions.findUnique(args);

    // throw when null, else format
    if (session === null) {
      throw new BadRequestError('session not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: session.id,
        date: format(session.date, 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS }),
        capacity: session.capacity,
        unit_price: Number(session.unit_price),
        status: session.status,
        users: session.orders_lines.map((ol) => ol.order.user),
      },
    });
  } catch (error) {
    // handle zod error vs generic
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error fetching session' });
    }
  }
};

// /** create */
// export const createSession = (req: Request, res: Response): Promise<void> => {

// }

// /** update */
// export const updateSession = (req: Request, res: Response): Promise<void> => {

// }

// /** delete */
// export const deleteSession = (req: Request, res: Response): Promise<void> => {

// }
