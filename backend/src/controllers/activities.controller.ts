import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { makeSlug } from "../utils/slugify.js";

export async function getAllActivities(req: Request, res: Response) {
  try {
    const activities = await prisma.activities.findMany({
      include: {
        activities_categories: {
          include: {
            // categories: true // renvoie tous les champs de categories, donc select: {}
            categories: {
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
    const result = activities.map((a) => ({
      // id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description,
      image_filename: a.image_filename,
      categories_count: a.activities_categories.map((ac) => ac.categories).length,
      categories: a.activities_categories.map((ac) => ac.categories)
    }))
    res.status(200).json(result); // on renvoie result, car activities renvoie tous les champs
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getActivityById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const activity = await prisma.activities.findUnique({
      where: { id: Number(id) }
    });
    if (activity) {
      res.status(200).json(activity);
    } else {
      res.status(404).json({ message: "Activity not found" });
    }
  } catch (error) {
    console.error(`Error fetching activity with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createActivity(req: Request, res: Response) {
  const { title, description, activities_categories } = req.body;
  const slug = makeSlug(title);

  try {
    const newActivity = await prisma.activities.create({
      data: {
        title,
        slug,
        description,
        activities_categories: {
          create: activities_categories.map((categories: { category_id: number }) => ({
            category_id: categories.category_id,
          })),
        },
      },
      include: {
        activities_categories: {
          include: { categories: true }, // renvoie aussi les infos des catégories liées
        },
      },
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function updateActivity(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description, activities_categories } = req.body;
  try {
    const updatedActivity = await prisma.activities.update({
      where: { id: Number(id) },
      data: { title, description, activities_categories }
    });
    res.status(200).json(updatedActivity);
  } catch (error) {
    console.error(`Error updating activity with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteActivity(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.activities.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting activity with id ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}