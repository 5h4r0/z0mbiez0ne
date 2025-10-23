import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../models/index.js';
import { makeSlug } from '../utils/slugify.js';

/** get all */
export const getCategories = (_req: Request, res: Response): Promise<void> => {
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
              },
            },
          },
        },
      },
    })
    .then((categories) => {
      res.status(200).json({
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          image_filename: c.image_filename,
          activities_count: c.activities_categories.length,
          activities: c.activities_categories.map((ac) => ac.activity),
        })),
      });
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    });
};

/** get one */
export const getCategory = (req: Request, res: Response): Promise<void> => {
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
              },
            },
          },
        },
      },
    })
    .then((category) => {
      category
        ? res.status(200).json({
            success: true,
            data: {
              id: category.id,
              title: category.title,
              slug: category.slug,
              description: category.description,
              image_filename: category.image_filename,
              activities: category.activities_categories.map((ac) => ac.activity),
            },
          })
        : res.status(404).json({
            success: false,
            error: `Category ${id} not found`,
          });
    })
    .catch((error) => {
      console.error(`Error fetching category ${id}:`, error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    });
};

/** create */
export const createCategory = (req: Request, res: Response): Promise<void> => {
  const { title, description, image_filename } = req.body;
  const slug = makeSlug(title);

  return prisma.categories
    .create({
      data: {
        title,
        slug,
        description,
        image_filename,
      },
    })
    .then((created) => {
      res.status(201).json({
        success: true,
        data: created,
      });
    })
    .catch((error) => {
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
        ? res.status(409).json({
            success: false,
            error: 'Category with this title or slug already exists',
          })
        : (() => {
            // keep single-expression style via IIFE, no comma operator - () at the end launch the IIFE (Immediately Invoked Function Expression)
            console.error('Error creating category:', error);
            return res.status(500).json({ success: false, error: 'internal server error' });
          })();
    });
};

/** update */
export const updateCategory = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, image_filename } = req.body;

  const data: Prisma.categoriesUpdateInput = Object.assign(
    {
      title,
      slug: makeSlug(title),
    },
    description !== undefined ? { description } : {},
    image_filename !== undefined ? { image_filename } : {},
  );

  return prisma.categories
    .update({
      where: { id: Number(id) },
      data,
    })
    .then((updated) => {
      res.status(200).json({
        success: true,
        data: updated,
      });
    })
    .catch((error) => {
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
        ? res.status(404).json({
            success: false,
            error: `Category ${id} not found`,
          })
        : (() => {
            // keep single-expression style via IIFE, no comma operator - () at the end launch the IIFE (Immediately Invoked Function Expression)
            console.error(`Error updating category ${id}:`, error);
            return res.status(500).json({ success: false, error: 'internal server error' });
          })();
    });
};

/** delete */
export const deleteCategory = (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const categoryId = Number(id);

  // Rejeter tôt si id invalide pour éviter les unions "void | T"
  return (
    Number.isNaN(categoryId)
      ? Promise.reject({ type: 'invalidId' })
      : prisma.activities_categories.findMany({
          where: { category_id: categoryId },
          include: { activity: { select: { id: true, activities_categories: true } } },
        })
  )
    .then((linked) => {
      const orphanActivities = linked
        .filter((relation) => relation.activity.activities_categories.length === 1)
        .map((relation) => relation.activity.id);

      // rejected, the next then only sees the deleted category
      return orphanActivities.length > 0
        ? Promise.reject({ type: 'hasOrphans', ids: orphanActivities })
        : prisma.activities_categories
            .deleteMany({ where: { category_id: categoryId } })
            .then(() => prisma.categories.delete({ where: { id: categoryId } }));
    })
    .then((deletedCategory) => {
      res.status(200).json({
        success: true,
        data: {
          id: deletedCategory.id,
          title: deletedCategory.title,
          slug: deletedCategory.slug,
          description: deletedCategory.description,
          image_filename: deletedCategory.image_filename,
        },
      });
    })
    .catch((error) => {
      error?.type === 'invalidId'
        ? res.status(400).json({ success: false, error: `Invalid category id ${id}` })
        : error?.type === 'hasOrphans'
          ? res.status(400).json({
              success: false,
              error: `Cannot delete category ${id}, activities ${error.ids.join(', ')} depend exclusively on it`,
            })
          : error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
            ? res.status(404).json({ success: false, error: `Category ${id} not found` })
            : (() => {
                // keep single-expression style via IIFE, no comma operator - () at the end launch the IIFE (Immediately Invoked Function Expression)
                console.error(`Error deleting category ${id}:`, error);
                res.status(500).json({ success: false, error: 'Internal server error' });
              })();
    });
};
