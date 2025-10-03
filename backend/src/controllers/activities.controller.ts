import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { getRandomInt } from "../utils/index.js";
import { makeSlug } from "../utils/slugify.js";
import { getPagination } from "../helpers/index.js";


/** get all */
export const getActivities = (req: Request, res: Response): Promise<void> => {
  const { take, skip } = getPagination(req);

  return prisma.activities
    .findMany({
      include: {
        activities_categories: {
          select: {
            category: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                image_filename: true,
              },
            },
          },
        },
      },
      ...(take !== undefined ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
    })
    .then((activities) => {
      res.status(200).json({
        success: true,
        data: activities.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          description: a.description,
          image_filename: a.image_filename,
          categories_count: a.activities_categories.length,
          categories: a.activities_categories.map((ac) => ac.category),
        })),
      });
    })
    .catch((error) => {
      console.error("Error fetching activities:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    });
};


/** get one */
export const getActivity = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  return prisma.activities
    .findUnique({
      where: { id: Number(id) },
      include: {
        activities_categories: {
          select: {
            category: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                image_filename: true,
              },
            },
          },
        },
      },
    })
    .then((activity) => {
      activity
        ? res.status(200).json({
            success: true,
            data: {
              id: activity.id,
              title: activity.title,
              slug: activity.slug,
              description: activity.description,
              image_filename: activity.image_filename,
              categories: activity.activities_categories.map((ac) => ac.category),
            },
          })
        : res.status(404).json({
            success: false,
            error: `Activity ${id} not found`,
          });
    })
    .catch((error) => {
      console.error(`Error fetching activity with id: ${id}`, error);
      res
        .status(500)
        .json({ success: false, error: "Internal server error" });
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({
          success: false,
          error: "One or more categories not found",
        });
      } else {
        console.error("Error creating activity:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
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
        ? prisma.categories
            .findMany({ where: { id: { in: categoryIds } }, select: { id: true } })
            .then((existing) => {
              const existingIds = existing.map((c) => c.id);
              const invalidIds = categoryIds.filter((cid) => !existingIds.includes(cid));

              return invalidIds.length > 0
                ? Promise.reject({ type: "invalidCategories", ids: invalidIds })
                : categoryIds.length > 0
                ? prisma.activities_categories
                    .deleteMany({ where: { activity_id: activityId } })
                    .then(() =>
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
                      })
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
        : Promise.reject({ type: "notFound" })
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
      error?.type === "notFound"
        ? res.status(404).json({ success: false, error: `Activity ${id} not found` })
        : error?.type === "invalidCategories"
        ? res.status(400).json({
            success: false,
            error: `Invalid category IDs: ${error.ids.join(", ")}`,
          })
        : error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ? res.status(404).json({ success: false, error: `Activity ${id} not found` })
        : (console.error(`Error updating activity ${id}:`, error),
          res.status(500).json({ success: false, error: "Internal server error" }));
    });
};


/** delete */
export const deleteActivity = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const activityId = Number(id);

  return Number.isNaN(activityId)
    ? (res.status(400).json({
        success: false,
        error: `Invalid activity id ${id}`,
      }), Promise.resolve())
    : prisma.orders_lines
        .count({ where: { session: { activity_id: activityId } } })
        .then((orderLinesCount) =>
          orderLinesCount > 0
            ? Promise.reject({ type: "hasOrderLines", count: orderLinesCount })
            : prisma.orders.count({
                where: {
                  orders_lines: { some: { session: { activity_id: activityId } } },
                },
              })
        )
        .then((ordersCount) =>
          ordersCount > 0
            ? Promise.reject({ type: "hasOrders", count: ordersCount })
            : prisma.sessions.count({ where: { activity_id: activityId } })
        )
        .then((sessionsCount) =>
          sessionsCount > 0
            ? Promise.reject({ type: "hasSessions", count: sessionsCount })
            : prisma.activities_categories
                .deleteMany({ where: { activity_id: activityId } })
                .then(() => prisma.activities.delete({ where: { id: activityId } }))
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
          error?.type === "hasOrderLines"
            ? res.status(400).json({
                success: false,
                error: `Cannot delete activity ${id}, it has ${error.count} order lines linked through sessions`,
              })
            : error?.type === "hasOrders"
            ? res.status(400).json({
                success: false,
                error: `Cannot delete activity ${id}, it has ${error.count} orders linked`,
              })
            : error?.type === "hasSessions"
            ? res.status(400).json({
                success: false,
                error: `Cannot delete activity ${id}, it has ${error.count} sessions`,
              })
            : error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2025"
            ? res.status(404).json({
                success: false,
                error: `Activity ${id} not found`,
              })
            : (console.error(`Error deleting activity ${id}:`, error),
              res.status(500).json({
                success: false,
                error: "Internal server error",
              }));
        });
};
