import { Prisma, SessionStatus } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // -> use US locale
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { BadRequestError } from '../lib/errors.js';
import { prisma } from '../models/index.js';

// shared date formatter
const formatDate = (d: Date) => format(d, 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS });

// shared session response shape
const formatSession = (s: {
  id: number;
  activity_id: number;
  date: Date;
  capacity: number;
  unit_price: Prisma.Decimal;
  status: SessionStatus;
}) => ({
  id: s.id,
  activity_id: s.activity_id,
  date: formatDate(s.date),
  capacity: s.capacity,
  unit_price: Number(s.unit_price),
  status: s.status,
});

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
      date: formatDate(new Date(s.date)),
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
        date: formatDate(session.date),
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

/** create */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  const bodySchema = z.object({
    activity_id: z.number().int().positive(),
    date: z.string().refine((d) => new Date(d) > new Date(), { message: 'date must be in the future' }),
    capacity: z.number().int().min(1),
    unit_price: z.number().positive(),
    status: z.nativeEnum(SessionStatus),
  });

  try {
    const { activity_id, date, capacity, unit_price, status } = await bodySchema.parseAsync(req.body);

    const session = await prisma.sessions.create({
      data: {
        activity_id,
        date: new Date(date),
        capacity,
        unit_price: new Prisma.Decimal(unit_price),
        status,
      },
    });

    res.status(201).json({ success: true, data: formatSession(session) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(404).json({ status: 'error', message: 'activity not found' });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error creating session' });
    }
  }
};

/** update */
export const updateSession = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });
  // activity_id is not updatable — all other fields optional
  const bodySchema = z.object({
    date: z
      .string()
      .refine((d) => new Date(d) > new Date(), { message: 'date must be in the future' })
      .optional(),
    capacity: z.number().int().min(1).optional(),
    unit_price: z.number().positive().optional(),
    status: z.nativeEnum(SessionStatus).optional(),
  });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const body = await bodySchema.parseAsync(req.body);

    const data: Prisma.sessionsUpdateInput = {};
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.capacity !== undefined) data.capacity = body.capacity;
    if (body.unit_price !== undefined) data.unit_price = new Prisma.Decimal(body.unit_price);
    if (body.status !== undefined) data.status = body.status;

    const session = await prisma.sessions.update({ where: { id: Number(id) }, data });

    res.status(200).json({ success: true, data: formatSession(session) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ status: 'error', message: 'session not found' });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error updating session' });
    }
  }
};

/** delete */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const sessionId = Number(id);

    // block deletion if any order lines reference this session
    const orderLinesCount = await prisma.orders_lines.count({ where: { session_id: sessionId } });
    if (orderLinesCount > 0) {
      throw new BadRequestError(
        `cannot delete session ${id}, it has ${orderLinesCount} order line${orderLinesCount > 1 ? 's' : ''}`,
      );
    }

    const deleted = await prisma.sessions.delete({ where: { id: sessionId } });

    res.status(200).json({ success: true, data: formatSession(deleted) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ status: 'error', message: 'session not found' });
    } else {
      res.status((error as { status?: number }).status || 500).json({
        status: 'error',
        message: (error as Error).message || 'error deleting session',
      });
    }
  }
};
