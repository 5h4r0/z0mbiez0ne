import { Prisma, SessionStatus } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // -> use US locale
import type { Request, Response } from 'express';
import z from 'zod';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
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

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  status: z.nativeEnum(SessionStatus).optional(),
  activity_slug: z.string().optional(),
  sort: z.enum(['date', 'id']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/** get all sessions */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const query = await querySchema.parseAsync(req.query);
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.sessionsWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.activity_slug) where.activity = { slug: query.activity_slug };

    const orderBy: Prisma.sessionsOrderByWithRelationInput = {
      [query.sort ?? 'date']: query.order ?? 'asc',
    };

    const include = {
      activity: {
        select: { id: true, title: true, slug: true, image_filename: true },
      },
      orders_lines: {
        include: {
          order: {
            include: {
              user: {
                select: { id: true, email: true, firstname: true, lastname: true },
              },
            },
          },
        },
      },
    };

    const [sessions, total] = await Promise.all([
      prisma.sessions.findMany({ where, orderBy, include, take: limit, skip }),
      prisma.sessions.count({ where }),
    ]);

    const formatted = sessions.map((s) => ({
      id: s.id,
      activity_id: s.activity_id,
      activity: s.activity ?? null,
      date: formatDate(new Date(s.date)),
      capacity: s.capacity,
      unit_price: Number(s.unit_price),
      status: s.status,
      users: s.orders_lines.map((ol) => ol.order.user),
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'session') });
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
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            image_filename: true,
          },
        },
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

    if (session === null) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', req.params.id) });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: session.id,
        activity_id: session.activity_id,
        activity: session.activity
          ? {
              id: session.activity.id,
              title: session.activity.title,
              slug: session.activity.slug,
              image_filename: session.activity.image_filename,
            }
          : null,
        date: formatDate(session.date),
        capacity: session.capacity,
        unit_price: Number(session.unit_price),
        status: session.status,
        users: session.orders_lines.map((ol) => ol.order.user),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'session') });
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

    res.status(201).json({
      success: true,
      data: formatSession(session),
      message: buildCudMessage('created', 'session', formatDate(session.date)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'activity') });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'session') });
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

    res.status(200).json({
      success: true,
      data: formatSession(session),
      message: buildCudMessage('updated', 'session', formatDate(session.date)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', req.params.id) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'session') });
    }
  }
};

/** delete */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const sessionId = Number(id);

    const orderLinesCount = await prisma.orders_lines.count({ where: { session_id: sessionId } });
    if (orderLinesCount > 0) {
      res.status(400).json({ success: false, message: buildErrorMessage('has_order_lines', 'session', id) });
      return;
    }

    const deleted = await prisma.sessions.delete({ where: { id: sessionId } });

    res.status(200).json({
      success: true,
      data: formatSession(deleted),
      message: buildCudMessage('deleted', 'session', formatDate(deleted.date)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', req.params.id) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'session') });
    }
  }
};
