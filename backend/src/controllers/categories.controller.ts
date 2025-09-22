import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { makeSlug } from "../utils/slugify.js";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        activities_categories: {
          select:  {
            // activities: true // renvoie tous les champs de categories, donc select: {}
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
    const result = categories.map((a) => ({
      // id: a.id,
      title: a.title,
      description: a.description,
      slug: a.slug,
      image_filename: a.image_filename,
      activities_count: a.activities_categories.map((ac) => ac.activities).length,
      activities: a.activities_categories.map((ac) => ac.activities)
    }))
    res.status(200).json(result); // on renvoie result, car categories renvoie tous les champs
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
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
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createCategory(req: Request, res: Response) {
  const { title, description } = req.body;
  const slug = makeSlug(title);
  try {
    const newCategory = await prisma.categories.create({
      data: {
        title,
        slug,
        description
      }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: Number(id) },
      data: { title, description }
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.categories.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}