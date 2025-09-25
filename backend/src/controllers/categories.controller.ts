import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { Prisma } from "@prisma/client";
import { makeSlug } from "../utils/slugify.js";
import { getRandomInt } from "../utils/getrandomint.js";
import { isClassStaticBlockDeclaration } from "typescript";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        activities_categories: {
          select:  {
            // activities: true // renvoie tout (donc les dates), sinon select: {}
            activities: {
              select: {
                // id: true,
                title: true,
                slug: true,
                description: true,
                image_filename: true
              }
            }
          }
        }
      }
    });
    const result = categories.map((a) => ({
      // id: a.id,
      title: a.title,
      description: a.description,
      slug: a.slug,
      image_filename: a.image_filename,
      activities_count: a.activities_categories.map((ac) => ac.activities).length,
      activities: a.activities_categories.map((ac) => ac.activities)
    }))
    //res.status(200).json(result); // result pour champs selected, categories renvoie tout
    res.status(200).json(categories);
  } catch (error) {
    console.error(`Error fetching categories:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const category = await prisma.categories.findUnique({
      where: { id: Number(id) },
      include: {
        activities_categories: {
          select: {
            activities: {
              select: {
                title: true,
                slug: true,
                description: true,
                image_filename: true
              }
            }
          }
        }
      }
    });
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: `Category not found` });
    }
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}

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

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description } = req.body;
  const slug = makeSlug(title);
  const image_filename = `img-category-${getRandomInt(1, 999)}.jpg`
  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: Number(id) },
      data: { title, slug, description, image_filename }
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return res.status(400).json({ message: `Invalid category id ${id}`});
  }

  try {
    // Récupère toutes les activités many-to-many de l'activité et compte combien de catégories possède chaque activité liée
    const linked = await prisma.activities_categories.findMany({
      where: { category_id: categoryId },
      include: {
        activities: {
          select: {
            id: true,
            activities_categories: { select: { category_id: true } }
          }
        }
      },
    });

    // Vérifie si certaines activités n'ont QUE cette catégorie
    const blocked = linked
      .filter(rel => rel.activities.activities_categories.length === 1)
      .map(rel => rel.activities.id);

    if (blocked.length > 0) {
      return res.status(400).json({
        message: `Cannot delete category ${id}, activities ${blocked.join(", ")} depend exclusively on it`
      });
    }

    // Supprime les relations many-to-many
    await prisma.activities_categories.deleteMany({
      where: { category_id: categoryId },
    });

    // Supprime la catégorie
    const deleted = await prisma.categories.delete({
      where: { id: categoryId },
    });

    return res.status(200).json(deleted);
  }
  catch(error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: `Category ${id} not found` });
    }

    console.error(`Error deleting category ${id}:`, error);
    res.status(500).json({ message: "Internal server error"});
  }
}