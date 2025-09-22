import type { Request, Response } from "express";
import { prisma } from "../models/index.js";

export async function getAllActivities(req: Request, res: Response) {
  try {
    const activities = await prisma.activities.findMany();
    res.status(200).json(activities);
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

  try {
    const newActivity = await prisma.activities.create({
      data: {
        title,
        description,
        activities_categories: {
          create: { category_id: activities_categories }
        }
      },
      include: { activities_categories: true } // Renvoi de la liaison
    });

    res.status(201).json(newActivity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// activities_categories.create



// export async function createActivity(req: Request, res: Response) {
//   const { title, description, categoryId } = req.body;
//   try {
//     const newActivity = await prisma.activities.create({
//       data: { title, description, activityId }
//     });
//     res.status(201).json(newActivity);
//   } catch (error) {
//     console.error("Error creating activity:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

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