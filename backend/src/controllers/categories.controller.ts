import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { makeSlug } from "../utils/slugify.js";
import { getRandomInt } from "../utils/index.js";
import { Prisma } from "@prisma/client";


/** GET all */
export async function getCategories(req: Request, res: Response) {
  return prisma.categories
    .findMany({
      include: {
        activities_categories: {
          select: {
            activity: {
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
    .then((categories) =>
      res.status(200).json(
        categories.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          image_filename: c.image_filename,
          activities_count: c.activities_categories.length,
          activities: c.activities_categories.map((ac) => ac.activity),
        }))
      )
    )
    .catch((error) => (
      console.error(`Error fetching categories:`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}


/** GET one */
export async function getCategory(req: Request, res: Response) {
  const { id } = req.params;

  return prisma.categories
    .findUnique({
      where: { id: Number(id) },
      include: {
        activities_categories: {
          select: {
            activity: {
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
    .then((category) =>
      category
        ? res.status(200).json({
            id: category.id,
            title: category.title,
            slug: category.slug,
            description: category.description,
            image_filename: category.image_filename,
            activities: category.activities_categories.map((ac) => ac.activity),
          })
        : res.status(404).json({ message: `Category ${id} not found` })
    )
    .catch((error) => (
      console.error(`Error fetching category with id ${id}:`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}


/** CREATE */
export async function createCategory(req: Request, res: Response) {
  const { title, description } = req.body;
  const slug = makeSlug(title);
  const image_filename = `img-category-${getRandomInt(1, 999)}.jpg`
  try {
    const newCategory = await prisma.categories.create({
      data: {
        title,
        slug,
        description,
        image_filename
      }
    });
    console.log(`Category ${newCategory.id} created`);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(`Error creating category:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}


/** UPDATE */
export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description } = req.body;
  const slug = makeSlug(title);
  const image_filename = `img-category-${getRandomInt(1, 999)}.jpg`;

  return prisma.categories
    .update({
      where: { id: Number(id) },
      data: { title, slug, description, image_filename },
      include: {
        activities_categories: {
          select: {
            activity: {
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
    .then((updated) =>
      res.status(200).json({
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        description: updated.description,
        image_filename: updated.image_filename,
        activities: updated.activities_categories.map((ac) => ac.activity),
      })
    )
    .catch((error) =>
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
        ? res.status(404).json({ message: `Category ${id} not found` })
        : (console.error(`Error updating category ${id}:`, error),
          res.status(500).json({ message: "Internal server error" }))
    );
}


/** DELETE */
export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = Number(id);

  return Number.isNaN(categoryId)
    ? res.status(400).json({ message: `Invalid category id ${id}` })
    : prisma.activities_categories.findMany({
        where: { category_id: categoryId },
        include: { activity: { select: { id: true, activities_categories: true } } },
      })
        .then((linked) =>
          linked.some((relation) => relation.activity.activities_categories.length === 1)
            ? res.status(400).json({
                message: `Cannot delete category ${id}, activities ${linked
                  .filter((relation) => relation.activity.activities_categories.length === 1)
                  .map((relation) => relation.activity.id)
                  .join(", ")} depend exclusively on it`,
              })
            : prisma.activities_categories
                .deleteMany({ where: { category_id: categoryId } })
                .then(() =>
                  prisma.categories
                    .delete({ where: { id: categoryId } })
                    .then((deleted) =>
                      res.status(200).json({
                        message: `Category ${deleted.id} * ${deleted.title} has been deleted`,
                      })
                    )
                )
        )
        .catch((error) =>
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
            ? res.status(404).json({ message: `Category ${id} not found` })
            : (console.error(`Error deleting category ${id}:`, error),
              res.status(500).json({ message: "Internal server error" }))
        );
}