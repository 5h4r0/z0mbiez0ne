import type { Request, Response } from "express";
import { getPagination } from "../helpers/index.js";
import { prisma } from "../models/index.js";

/** GET all */
export async function getRoles(req: Request, res: Response) {
  return prisma.roles
    .findMany()
    .then((roles) =>
      res.status(200).json({
        success: true,
        data: roles,
      })
    )
    .catch((error) => (
      console.error(`Error fetching roles:`, error),
      res.status(500).json({
        success: false,
        message: "Erreur dans la récupération des rôles",
        error: error.message,
    })
  ))
}

/** GET one */
export async function getRole(req: Request, res: Response) {
  const { id } = req.params;
  const { take, skip } = getPagination(req);

  return prisma.roles
    .findUnique({
      where: { id: Number(id) },
      include: {
        users: Object.assign(
          {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
            },
          },
          take !== undefined ? { take } : {},
          skip !== undefined ? { skip } : {}
        ),
      },
    })
    .then((role) =>
      role
        ? res.status(200).json({
            id: role.id,
            name: role.name,
            users: role.users,
          })
        : res.status(404).json({ message: `Role ${id} not found` })
    )
    .catch((error) => (
      console.error(`Error fetching role with id: ${id}`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}
