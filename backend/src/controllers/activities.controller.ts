import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { Prisma } from "@prisma/client";
import { makeSlug } from "../utils/slugify.js";
import { getRandomInt } from "../utils/getrandomint.js";

/** GET all */
export async function getActivities(req: Request, res: Response) {
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
    })
    .then((activities) =>
      res.status(200).json(
        activities.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          description: a.description,
          image_filename: a.image_filename,
          categories_count: a.activities_categories.length,
          categories: a.activities_categories.map((ac) => ac.category),
        }))
      )
    )
    .catch((error) => (
      console.error(`Error fetching activities:`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}


/** GET one */
export async function getActivity(req: Request, res: Response) {
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
    .then((activity) =>
      activity
        ? res.status(200).json({
            id: activity.id,
            title: activity.title,
            slug: activity.slug,
            description: activity.description,
            image_filename: activity.image_filename,
            categories: activity.activities_categories.map((ac) => ac.category),
          })
        : res.status(404).json({ message: `Activity ${id} not found` })
    )
    .catch((error) => (
      console.error(`Error fetching activity with id ${id}:`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}


/** CREATE */
export async function createActivity(req: Request, res: Response) {
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
          select: { category: { select: { id: true, title: true } } },
        },
      },
    })
    .then((created) => res.status(201).json(created))
    .catch((error) =>
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
        ? res.status(404).json({ message: "One or more categories not found" })
        : (console.error("Error creating activity:", error),
          res.status(500).json({ message: "Internal server error" }))
    );
}


/** UPDATE */
export async function updateActivity(req: Request, res: Response) {
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
                    .then(() => {
                      const data: any = { title, slug: makeSlug(title) };
                      description !== undefined && (data.description = description);
                      data.activities_categories = {
                        create: categoryIds.map((cid) => ({
                          category: { connect: { id: cid } },
                        })),
                      };
                      return prisma.activities.update({
                        where: { id: activityId },
                        data,
                        include: {
                          activities_categories: { include: { category: true } },
                        },
                      });
                    })
                : (() => {
                    const data: any = { title, slug: makeSlug(title) };
                    description !== undefined && (data.description = description);
                    return prisma.activities.update({
                      where: { id: activityId },
                      data,
                      include: {
                        activities_categories: { include: { category: true } },
                      },
                    });
                  })();
            })
        : Promise.reject({ type: "notFound" })
    )
    .then((updated) =>
      res.status(200).json({
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        image_filename: updated.image_filename,
        categories: (updated as any).activities_categories.map(
          (ac: any) => ac.category
        ),
      })
    )
    .catch((error) =>
      error?.type === "notFound"
        ? res.status(404).json({ message: `Activity ${id} not found` })
        : error?.type === "invalidCategories"
        ? res
            .status(400)
            .json({ message: `Invalid category IDs: ${error.ids.join(", ")}` })
        : error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ? res.status(404).json({ message: `Activity ${id} not found` })
        : (console.error(`Error updating activity ${id}:`, error),
          res.status(500).json({ message: "Internal server error" }))
    );
}


/** DELETE */
export async function deleteActivity(req: Request, res: Response) {
  const { id } = req.params;
  const activityId = Number(id);

  return Number.isNaN(activityId)
    ? res.status(400).json({ message: `Invalid activity id ${id}` })
    : prisma.orders_lines
        .count({ where: { session: { activity_id: activityId } } })
        .then((ordersLinesCount) =>
          ordersLinesCount > 0
            ? Promise.reject({ type: "hasOrders", count: ordersLinesCount })
            : prisma.sessions.count({ where: { activity_id: activityId } })
        )
        .then((sessionsCount) =>
          sessionsCount && sessionsCount > 0
            ? res.status(400).json({
                message: `Cannot delete activity ${id}, it has ${sessionsCount} sessions`,
              })
            : prisma.activities_categories
                .deleteMany({ where: { activity_id: activityId } })
                .then(() =>
                  prisma.activities
                    .delete({ where: { id: activityId } })
                    .then((deleted) =>
                      res.status(200).json({
                        message: `Activity ${deleted.id} * ${deleted.title} has been deleted`,
                      })
                    )
                )
        )
        .catch((error) =>
          error?.type === "hasOrders"
            ? res.status(400).json({
                message: `Cannot delete activity ${id}, it has ${error.count} orders linked through sessions`,
              })
            : error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2025"
            ? res.status(404).json({ message: `Activity ${id} not found` })
            : (console.error(`Error deleting activity ${id}:`, error),
              res.status(500).json({ message: "Internal server error" }))
        );
}
