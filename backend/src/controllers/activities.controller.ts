import { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { BadRequestError } from '../lib/errors.js';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
import { prisma } from '../models/index.js';
import { getRandomInt } from '../utils/index.js';
import { makeSlug } from '../utils/slugify.js';

/** get all */
export const getActivities = async (req: Request, res: Response) => {
  const { take, skip } = getPagination(req);

  // schema to validate pagination query
  const paginationSchema = z.object({
    take: z.string().optional(),
    skip: z.string().optional(),
  });

  try {
    await paginationSchema.parseAsync(req.query);

    // base args with categories (via pivot) and sessions -> orders_lines -> order -> user (clean)
    const baseArgs = {
      include: {
        activities_categories: {
          // -> pivot table
          include: { category: true }, // -> real categories
        },
        sessions: {
          include: {
            orders_lines: {
              include: {
                order: {
                  include: {
                    user: {
                      // -> keep only safe fields
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
        },
      },
    };

    // add pagination without spread, no if
    let args: typeof baseArgs & { take?: number; skip?: number } = Object.assign({}, baseArgs);
    args = take !== undefined ? Object.assign({}, args, { take }) : args;
    args = skip !== undefined ? Object.assign({}, args, { skip }) : args;

    // query activities with nested data
    const activities = await prisma.activities.findMany(args);

    // format and flatten: categories + sessions dates + users
    const formatted = activities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      categories: a.activities_categories.map((ac) => ac.category), // -> flatten categories
      slug: a.slug,
      image_filename: a.image_filename,
      updated_at: a.updated_at,
      sessions: a.sessions.map((s) => ({
        id: s.id,
        date: format(new Date(s.date), 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS }), // -> strict us business
        capacity: s.capacity,
        unit_price: s.unit_price,
        status: s.status,
        users: s.orders_lines.map((ol) => ol.order.user), // -> flattened, cleaned users
      })),
    }));

    // reject empty list using ternary
    if (formatted.length === 0) {
      throw new BadRequestError('no activities caught');
    }

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    // zod vs generic error
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error fetching activities' });
    }
  }
};

/** get one */
export const getActivity = async (req: Request, res: Response) => {
  // schema to validate route param
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);

    // base args with categories via pivot + sessions users
    const args = {
      where: { id: Number(id) },
      include: {
        activities_categories: { include: { category: true } },
        sessions: {
          include: {
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
          },
        },
      },
    };

    // run query
    const activity = await prisma.activities.findUnique(args);

    // not found -> throw, else format
    if (activity === null) {
      throw new BadRequestError('activity not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        categories: activity.activities_categories.map((ac) => ac.category),
        sessions: activity.sessions.map((s) => ({
          id: s.id,
          date: format(new Date(s.date), 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS }),
          capacity: s.capacity,
          unit_price: s.unit_price,
          status: s.status,
          users: s.orders_lines.map((ol) => ol.order.user),
        })),
      },
    });
  } catch (error) {
    // zod vs generic error
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ status: 'error', message: (error as Error).message || 'error fetching activity' });
    }
  }
};

/** create */
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  const { title, description, activities_categories } = req.body;
  const slug = makeSlug(title);
  const image_filename = `img-activity-${getRandomInt(1, 999)}.jpg`;

  try {
    const created = await prisma.activities.create({
      data: {
        title,
        slug,
        description,
        image_filename,
        activities_categories: {
          create: activities_categories.map((catId: number) => ({
            category: { connect: { id: catId } },
          })),
        },
      },
      include: {
        activities_categories: {
          select: {
            category: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: created,
      message: buildCudMessage('created', 'activity', created.title, {
        categories: created.activities_categories.map((ac) => ac.category.title),
      }),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('invalid_categories', 'activity', title) });
    } else {
      console.error('Error creating activity:', error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'activity') });
    }
  }
};

/** update */
export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, activities_categories } = req.body as {
    title: string;
    description?: string;
    activities_categories?: number[];
  };

  const activityId = Number(id);
  const categoryIds = activities_categories ?? [];

  try {
    const activity = await prisma.activities.findUnique({ where: { id: activityId } });

    if (!activity) {
      throw { type: 'notFound' };
    }

    const existing = await prisma.categories.findMany({ where: { id: { in: categoryIds } }, select: { id: true } });
    const existingIds = existing.map((c) => c.id);
    const invalidIds = categoryIds.filter((cid) => !existingIds.includes(cid));

    if (invalidIds.length > 0) {
      throw { type: 'invalidCategories', ids: invalidIds };
    }

    let updated: Prisma.activitiesGetPayload<{ include: { activities_categories: { include: { category: true } } } }>;

    if (categoryIds.length > 0) {
      await prisma.activities_categories.deleteMany({ where: { activity_id: activityId } });
      updated = await prisma.activities.update({
        where: { id: activityId },
        data: {
          title,
          slug: makeSlug(title),
          ...(description !== undefined ? { description } : {}),
          activities_categories: {
            create: categoryIds.map((cid) => ({
              category: { connect: { id: cid } },
            })),
          },
        },
        include: {
          activities_categories: { include: { category: true } },
        },
      });
    } else {
      updated = await prisma.activities.update({
        where: { id: activityId },
        data: {
          title,
          slug: makeSlug(title),
          ...(description !== undefined ? { description } : {}),
        },
        include: {
          activities_categories: { include: { category: true } },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        image_filename: updated.image_filename,
        categories: updated.activities_categories.map((ac) => ac.category),
      },
      message: buildCudMessage('updated', 'activity', updated.title, {
        categories: updated.activities_categories.map((ac) => ac.category.title),
      }),
    });
  } catch (error: unknown) {
    const err = error as { type?: string; ids?: number[] };
    if (err?.type === 'notFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'activity', id) });
    } else if (err?.type === 'invalidCategories') {
      res.status(400).json({ success: false, message: buildErrorMessage('invalid_categories', 'activity', id) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'activity', id) });
    } else {
      console.error(`Error updating activity ${id}:`, error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'activity') });
    }
  }
};

/** delete */
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const activityId = Number(id);

  try {
    if (Number.isNaN(activityId)) {
      res.status(400).json({ success: false, message: buildErrorMessage('invalid_id', 'activity', String(id)) });
      return;
    }

    const orderLines = await prisma.orders_lines.findMany({
      where: { session: { activity_id: activityId } },
      select: { session: { select: { id: true, date: true } } },
    });

    if (orderLines.length > 0) {
      throw {
        type: 'hasOrderLines',
        count: orderLines.length,
        sessions: orderLines.map((ol) => ol.session),
      };
    }

    const ordersCount = await prisma.orders.count({
      where: {
        orders_lines: { some: { session: { activity_id: activityId } } },
      },
    });

    if (ordersCount > 0) {
      throw { type: 'hasOrders', count: ordersCount };
    }

    const sessionsCount = await prisma.sessions.count({ where: { activity_id: activityId } });

    if (sessionsCount > 0) {
      throw { type: 'hasSessions', count: sessionsCount };
    }

    await prisma.activities_categories.deleteMany({ where: { activity_id: activityId } });
    const deleted = await prisma.activities.delete({ where: { id: activityId } });

    res.status(200).json({
      success: true,
      data: {
        id: deleted.id,
        title: deleted.title,
        slug: deleted.slug,
        description: deleted.description,
        image_filename: deleted.image_filename,
      },
      message: buildCudMessage('deleted', 'activity', deleted.title),
    });
  } catch (error: unknown) {
    const err = error as { type?: string; count?: number; sessions?: unknown[] };
    if (err?.type === 'hasOrderLines') {
      res.status(400).json({
        success: false,
        message: buildErrorMessage('has_order_lines', 'activity', id),
        sessions: err.sessions,
      });
    } else if (err?.type === 'hasOrders') {
      res.status(400).json({ success: false, message: buildErrorMessage('has_orders', 'activity', id) });
    } else if (err?.type === 'hasSessions') {
      res.status(400).json({ success: false, message: buildErrorMessage('has_sessions', 'activity', id) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'activity', id) });
    } else {
      console.error(`Error deleting activity ${id}:`, error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'activity') });
    }
  }
};
