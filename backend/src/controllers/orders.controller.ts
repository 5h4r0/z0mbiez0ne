import type { Request, Response } from "express";
import { prisma } from "../models/index.js";
import { Prisma } from "@prisma/client";
import { getPagination } from "../helpers/index.js";

/** GET all */
export async function getOrders(req: Request, res: Response) {
  const { take, skip } = getPagination(req);

  const options: Prisma.usersFindManyArgs = Object.assign({
    include: {
      role: true
    }},
    take !== undefined ? { take } : {},
    skip !== undefined ? { skip } : {}
  );

  return prisma.users
    .findMany(options)
    .then((users) => {
      const list = users as Prisma.usersGetPayload<{ include: { role: true } }>[];
      return res.status(200).json({
        success: true,
        data: list.map((u) => ({
          id: u.id,
          email: u.email,
          firstname: u.firstname,
          lastname: u.lastname,
          created_at: u.created_at,
          updated_at: u.updated_at,
          deleted_at: u.deleted_at,
          role: u.role?.name ?? null,
        })),
      });
    })
    .catch((error) =>
      res.status(500).json({
        success: false,
        error: error.message ?? "Internal server error",
    })
  );
}

/** GET one */
export async function getOrder(req: Request, res: Response) {
  const { id } = req.params;

  return prisma.users
    .findUnique({
      where: { id: Number(id) },
      include: { role: true },
    })
    .then((user) =>
      user
        ? res.status(200).json({
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
            role: user.role?.name ?? null,
          })
        : res.status(404).json({ message: `User ${id} not found` })
    )
    .catch((error) => (
      console.error(`Error fetching user with id: ${id}`, error),
      res.status(500).json({ message: "Internal server error" })
    ));
}
