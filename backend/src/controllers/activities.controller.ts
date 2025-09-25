import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { Prisma } from "@prisma/client";
import { makeSlug } from "../utils/slugify.js";

export async function getAllActivities(req: Request, res: Response) {
  try {
    const activities = await prisma.activities.findMany({
      include: {
        activities_categories: {
          include: {
            // categories: true // renvoie tout (donc les dates), sinon select: {}
            categories: {
              select: {
                id: true,
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
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description,
      image_filename: a.image_filename,
      categories_count: a.activities_categories.map((ac) => ac.categories).length,
      categories: a.activities_categories.map((ac) => ac.categories)
    }))
    //res.status(200).json(result); // result pour champs selected, activities renvoie tout
    res.status(200).json(activities);
  } catch (error) {
    console.error(`Error fetching activities:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}

export async function getActivityById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const activity = await prisma.activities.findUnique({
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
    if (activity) {
      res.status(200).json(activity);
    } else {
      res.status(404).json({ message: `Activity not found` });
    }
  } catch (error) {
    console.error(`Error fetching activity with id ${id}:`, error);
    res.status(500).json({ message: `Internal server error` });
  }
}


interface CreateActivityBody {
  title: string;
  description?: string;
  activities_categories: { category_id: number }[];
}

export async function createActivity(
  req: Request<unknown, unknown, CreateActivityBody>,
  res: Response
) {
  const { title, description, activities_categories } = req.body;

  const categoryIds: number[] = activities_categories.map(
    (_id) => _id.category_id
  );

  // Vérifie qu'ils existent dans la DB
  const existingCategories = await prisma.categories.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });

  const existingIds: number[] = existingCategories.map((exist) => exist.id);
  const invalidIds: number[] = categoryIds.filter(
    (id) => !existingIds.includes(id)
  );

  if (invalidIds.length > 0) {
    return res.status(400).json({
      message: `Invalid category IDs: ${invalidIds.join(", ")}`,
    });
  }

  // Création
  const newActivity = await prisma.activities.create({
    data: {
      title,
      slug: makeSlug(title),
      description: description ?? null,
      activities_categories: {
        create: categoryIds.map((id) => ({
          categories: { connect: { id } },
        })),
      },
    },
    include: {
      activities_categories: {
        include: { categories: true },
      },
    },
  });

  res.status(201).json(newActivity);
}

// export async function updateActivity(req: Request, res: Response) {
//   const { id } = req.params;
//   const { title, description, activities_categories } = req.body;
//   try {
//     const updatedActivity = await prisma.activities.update({
//       where: { id: Number(id) },
//       data: { title, description, activities_categories }
//     });
//     res.status(200).json(updatedActivity);
//   } catch (error) {
//     console.error(`Error updating activity with id ${id}:`, error);
//     res.status(500).json({ message: `Internal server error` });
//   }
// }

export async function updateActivity(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description, activities_categories } = req.body;

  try {
    const activityId = parseInt(id, 10);

    // Vérifier que l’activité existe
    const activity = await prisma.activities.findUnique({
      where: { id: activityId },
    });
    if (!activity) {
      return res.status(404).json({ message: `Activity ${id} not found` });
    }

    // Gérer les catégories si fournies
    let categoryData = undefined;
    if (activities_categories) {
      const categoryIds = activities_categories.map(
        (id: { category_id: number }) => id.category_id
      );

      // Vérifier que toutes existent
      const existingCategories = await prisma.categories.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      });
      const existingIds = existingCategories.map((c) => c.id);
      const invalidIds = categoryIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          message: `Invalid category IDs: ${invalidIds.join(", ")}`,
        });
      }

      // Supprimer les anciennes liaisons et recréer les nouvelles
      await prisma.activities_categories.deleteMany({
        where: { activity_id: activityId },
      });

      categoryData = {
        create: categoryIds.map((id) => ({
          categories: { connect: { id } },
        })),
      };
    }

    // Mettre à jour l’activité
    const updatedActivity = await prisma.activities.update({
      where: { id: activityId },
      data: {
        title,
        slug: title ? makeSlug(title) : activity.slug, // régénère si modifié
        description,
        ...(categoryData && { activities_categories: categoryData }),
      },
      include: {
        activities_categories: {
          include: { categories: true },
        },
      },
    });

    console.log(`Activity ${updatedActivity.id} updated`);
    res.json(updatedActivity);
  } catch (error) {
    console.error(`Error updating activity:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteActivity(req: Request, res: Response) {
  const { id } = req.params;
  const activityId = Number(id);

  if (Number.isNaN(activityId)) {
    return res.status(400).json({ message: `Invalid activity id ${id}` });
  }

  try {
    // Vérifie directement s'il existe au moins une order_line liée à cette activité via les sessions
    const ordersLinesCount = await prisma.orders_lines.count ({
      where: {
        sessions: {
          activity_id: activityId,
        }
      }
    });

    if (ordersLinesCount > 0) {
      return res.status(400).json({
        message: `Cannot delete activity ${id}, it has ${ordersLinesCount} orders linked through sessions`
      })
    }

    // Vérifie s'il reste des sessions même sans commandes
    const sessionsCount = await prisma.sessions.count({
      where: {
        activity_id: activityId
      },
    });
    if (sessionsCount > 0 ) {
      return res.status(400).json({
        message: `Cannot delete activity ${id}, it has ${sessionsCount} sessions`
      });
    }

    // Supprime les relations many-to-many
    await prisma.activities_categories.deleteMany({
      where: { activity_id: activityId },
    })

    // Supprime l'activité
    const deleted = await prisma.activities.delete({
      where: { id: activityId }
    });

    return res.status(200).json({
      message: `Activity ${deleted.id} * ${deleted.title} has been deleted`
    });
  }
  catch (error) {
    if ( error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025" ) {
      return res.status(404).json({ message: `Activity ${id} not found`});
    }

    console.error(`Error deleting activity ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}
