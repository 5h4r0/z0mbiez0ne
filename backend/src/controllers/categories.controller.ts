import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import z from 'zod';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
import { prisma } from '../models/index.js';
import { makeSlug } from '../utils/slugify.js';

/** get all */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  });

  try {
    const { page, limit } = await paginationSchema.parseAsync(req.query);
    const skip = (page - 1) * limit;

    const include = {
      activities_categories: {
        select: {
          activity: { select: { id: true, title: true, slug: true } },
        },
      },
    };

    const [categories, total] = await Promise.all([
      prisma.categories.findMany({ include, take: limit, skip }),
      prisma.categories.count(),
    ]);

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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
    }
  }
};

/** get one */
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await prisma.categories.findUnique({
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
    });

    if (category) {
      res.status(200).json({
        success: true,
        data: {
          id: category.id,
          title: category.title,
          slug: category.slug,
          description: category.description,
          image_filename: category.image_filename,
          activities: category.activities_categories.map((ac) => ac.activity),
        },
      });
    } else {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'category', id) });
    }
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
  }
};

/** get one by slug */
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const slugParam = req.params.slug;
  if (typeof slugParam !== 'string' || !slugParam) {
    res.status(400).json({ success: false, message: 'Invalid slug' });
    return;
  }

  try {
    const category = await prisma.categories.findFirst({
      where: { slug: slugParam },
      include: {
        activities_categories: {
          select: {
            activity: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'category', slugParam) });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        image_filename: category.image_filename,
        activities: category.activities_categories.map((ac) => ac.activity),
      },
    });
  } catch (error) {
    console.error(`Error fetching category by slug ${slugParam}:`, error);
    res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
  }
};

/** create */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { title, description, image_filename } = req.body;
  const slug = makeSlug(title);

  try {
    const created = await prisma.categories.create({
      data: {
        title,
        slug,
        description,
        image_filename,
      },
    });

    res.status(201).json({
      success: true,
      data: created,
      message: buildCudMessage('created', 'category', created.title),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ success: false, message: buildErrorMessage('already_exists', 'category', title) });
    } else {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
    }
  }
};

/** update */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
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

  try {
    const updated = await prisma.categories.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: buildCudMessage('updated', 'category', updated.title),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'category', id) });
    } else {
      console.error(`Error updating category ${id}:`, error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
    }
  }
};

/** delete */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const categoryId = Number(id);

  try {
    // Rejeter tôt si id invalide pour éviter les unions "void | T"
    if (Number.isNaN(categoryId)) {
      throw { type: 'invalidId' };
    }

    const linked = await prisma.activities_categories.findMany({
      where: { category_id: categoryId },
      include: { activity: { select: { id: true, activities_categories: true } } },
    });

    const orphanActivities = linked
      .filter((relation) => relation.activity.activities_categories.length === 1)
      .map((relation) => relation.activity.id);

    // rejected, the next then only sees the deleted category
    if (orphanActivities.length > 0) {
      throw { type: 'hasOrphans', ids: orphanActivities };
    }

    await prisma.activities_categories.deleteMany({ where: { category_id: categoryId } });
    const deletedCategory = await prisma.categories.delete({ where: { id: categoryId } });

    res.status(200).json({
      success: true,
      data: {
        id: deletedCategory.id,
        title: deletedCategory.title,
        slug: deletedCategory.slug,
        description: deletedCategory.description,
        image_filename: deletedCategory.image_filename,
      },
      message: buildCudMessage('deleted', 'category', deletedCategory.title),
    });
  } catch (error: unknown) {
    const err = error as { type?: string; ids?: number[] };
    if (err?.type === 'invalidId') {
      res.status(400).json({ success: false, message: buildErrorMessage('invalid_id', 'category', id) });
    } else if (err?.type === 'hasOrphans') {
      res.status(400).json({ success: false, message: buildErrorMessage('has_orphan_activities', 'category', id) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'category', id) });
    } else {
      console.error(`Error deleting category ${id}:`, error);
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'category') });
    }
  }
};
