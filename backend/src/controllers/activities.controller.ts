import { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { BadRequestError } from '../lib/errors.js';
import { prisma } from '../models/index.js';
import { getRandomInt } from '../utils/index.js';
import { makeSlug } from '../utils/slugify.js';

/** get all */
export const getActivities = (req: Request, res: Response) => {
  const { take, skip } = getPagination(req);

  // schema to validate pagination query
  const paginationSchema = z.object({
    take: z.string().optional(),
    skip: z.string().optional(),
  });

  return paginationSchema
    .parseAsync(req.query)
    .then(() => {
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
      return prisma.activities.findMany(args);
    })
    .then((activities) => {
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
      return formatted.length === 0
        ? Promise.reject(new BadRequestError('no activities caught'))
        : res.status(200).json({ success: true, data: formatted });
    })
    .catch((error) => {
      // zod vs generic error
      return error instanceof z.ZodError
        ? res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') })
        : res.status(500).json({ status: 'error', message: error.message || 'error fetching activities' });
    });
};

/** get one */
export const getActivity = (req: Request, res: Response) => {
  // schema to validate route param
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  return paramsSchema
    .parseAsync(req.params)
    .then(({ id }) => {
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
      return prisma.activities.findUnique(args);
    })
    .then((activity) => {
      // not found -> reject, else format
      return activity === null
        ? Promise.reject(new BadRequestError('activity not found'))
        : res.status(200).json({
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
    })
    .catch((error) => {
      // zod vs generic error
      return error instanceof z.ZodError
        ? res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') })
        : res.status(500).json({ status: 'error', message: error.message || 'error fetching activity' });
    });
};

/** create */
export const createActivity = (req: Request, res: Response): Promise<void> => {
  const { title, description, activities_categories } = req.body;
  const slug = makeSlug(title);
  const image_filename = `img-activity-${getRandomInt(1, 999)}.jpg`;

  return prisma.activities
    .create({
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
    })
    .then((created) => {
      res.status(201).json({
        success: true,
        data: created,
      });
    })
    .catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        res.status(404).json({
          success: false,
          error: 'One or more categories not found',
        });
      } else {
        console.error('Error creating activity:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    });
};

/** update */
export const updateActivity = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, activities_categories } = req.body as {
    title: string;
    description?: string;
    activities_categories?: number[];
  };

  const activityId = Number(id);
  const categoryIds = activities_categories ?? [];

  return prisma.activities
    .findUnique({ where: { id: activityId } })
    .then((activity) =>
      activity
        ? prisma.categories.findMany({ where: { id: { in: categoryIds } }, select: { id: true } }).then((existing) => {
            const existingIds = existing.map((c) => c.id);
            const invalidIds = categoryIds.filter((cid) => !existingIds.includes(cid));

            return invalidIds.length > 0
              ? Promise.reject({ type: 'invalidCategories', ids: invalidIds })
              : categoryIds.length > 0
                ? prisma.activities_categories.deleteMany({ where: { activity_id: activityId } }).then(() =>
                    prisma.activities.update({
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
                    }),
                  )
                : prisma.activities.update({
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
          })
        : Promise.reject({ type: 'notFound' }),
    )
    .then((updated) => {
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
      });
    })
    .catch((error) => {
      error?.type === 'notFound'
        ? res.status(404).json({ success: false, error: `Activity ${id} not found` })
        : error?.type === 'invalidCategories'
          ? res.status(400).json({
              success: false,
              error: `Invalid category IDs: ${error.ids.join(', ')}`,
            })
          : error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
            ? res.status(404).json({ success: false, error: `Activity ${id} not found` })
            : (() => {
                console.error(`Error updating activity ${id}:`, error);
                res.status(500).json({ success: false, error: 'Internal server error' });
              })();
    });
};

/** delete */
export const deleteActivity = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const activityId = Number(id);

  return Number.isNaN(activityId)
    ? Promise.reject(new BadRequestError(`invalid activity id ${id}`))
    : prisma.orders_lines
        .findMany({
          where: { session: { activity_id: activityId } },
          select: { session: { select: { id: true, date: true } } },
        })
        .then((orderLines) =>
          orderLines.length > 0
            ? Promise.reject({
                type: 'hasOrderLines',
                count: orderLines.length,
                sessions: orderLines.map((ol) => ol.session),
              })
            : prisma.orders.count({
                where: {
                  orders_lines: { some: { session: { activity_id: activityId } } },
                },
              }),
        )
        .then((ordersCount) =>
          ordersCount > 0
            ? Promise.reject({ type: 'hasOrders', count: ordersCount })
            : prisma.sessions.count({ where: { activity_id: activityId } }),
        )
        .then((sessionsCount) =>
          sessionsCount > 0
            ? Promise.reject({ type: 'hasSessions', count: sessionsCount })
            : prisma.activities_categories
                .deleteMany({
                  where: { activity_id: activityId },
                })
                .then(() => prisma.activities.delete({ where: { id: activityId } })),
        )
        .then((deleted) => {
          res.status(200).json({
            success: true,
            data: {
              id: deleted.id,
              title: deleted.title,
              slug: deleted.slug,
              description: deleted.description,
              image_filename: deleted.image_filename,
            },
          });
        })
        .catch((error) => {
          error?.type === 'hasOrderLines'
            ? res.status(400).json({
                success: false,
                error: `Cannot delete activity ${id}, it has ${error.count} order lines linked through sessions`,
                sessions: error.sessions,
              })
            : error?.type === 'hasOrders'
              ? res.status(400).json({
                  success: false,
                  error: `Cannot delete activity ${id}, it has ${error.count} orders linked`,
                })
              : error?.type === 'hasSessions'
                ? res.status(400).json({
                    success: false,
                    error: `Cannot delete activity ${id}, it has ${error.count} sessions`,
                  })
                : error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
                  ? res.status(404).json({
                      success: false,
                      error: `Activity ${id} not found`,
                    })
                  : (() => {
                      // keep single-expression style via IIFE, no comma operator - () at the end launch the IIFE (Immediately Invoked Function Expression)
                      console.error(`Error deleting activity ${id}:`, error);
                      return res.status(500).json({ success: false, error: 'Internal server error' });
                    })();
        });
};
