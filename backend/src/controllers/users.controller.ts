import type { users } from "@prisma/client";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { getPagination } from "../helpers/getPagination.js";
import { sanitizeUser } from "../helpers/sanitizeUser.js";
import { prisma } from "../models/index.js";

// Type utilitaire : un user avec sa relation "role"
type UserWithRole = Prisma.usersGetPayload<{ include: { role: true } }>;


/** GET all */
export function getUsers(req: Request, res: Response): Promise<void> {
  const { take, skip } = getPagination(req);

  const options: Parameters<typeof prisma.users.findMany>[0] = Object.assign({
    include: {
      role: true,
      orders: {
        select: {
          id: true,
          total_amount: true,
          status: true,
          payment_date: true,
        }
      }
    } },
    take !== undefined ? { take: take as number } : {},
    skip !== undefined ? { skip: skip as number } : {}
  );

  return prisma.users
    .findMany(options)
    .then((users) => {
      const list = users as UserWithRole[];
      res.status(200).json({
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
    .catch((error) => {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    });
}


/** GET one */
export async function getUser(req: Request, res: Response) {
  const { id } = req.params;

  return prisma.users
    .findUnique({
      where: { id: Number(id) },
      include: { role: true },
    })
    .then((user: UserWithRole | null) =>
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
    .catch((error) => {
      console.error(`Error fetching user with id: ${id}`, error);
      res.status(500).json({ message: "Internal server error" });
    });
}


/** REGISTER */
export const registerUser = (req: Request, res: Response): Promise<void> => {
  const { email, firstname, lastname, password } = req.body;

  return (password === undefined
    ? Promise.reject(new Error("Password is required"))
    : bcrypt.hash(password, 10)
  )
    .then((hash) =>
      prisma.roles
        .findFirst({ where: { name: "member" } })
        .then((role) =>
          role
            ? prisma.users.create({
                data: {
                  email,
                  firstname,
                  lastname,
                  password_hash: hash,
                  role_id: role.id,
                },
              })
            : Promise.reject(new Error("Default role 'member' not found"))
        )
    )
    .then((newUser: users) => {
      res.status(201).json({
        success: true,
        data: sanitizeUser(newUser),
      });
    })
    .catch((err) => {
      console.error("Error registering user:", err);

      const errorMessage =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
          ? "A user with this email already exists"
          : err instanceof Error
          ? err.message
          : JSON.stringify(err);

      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    });
};


/** UPDATE */
export const updateUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstname, lastname, role } = req.body;

  return prisma.users
    .update({
      where: { id: Number(id) },
      data: { email, firstname, lastname, role },
    })
    .then((updated) =>
      res.status(200).json({ success: true, data: updated }),
    )
    .catch((error) =>
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
        ? res.status(404).json({ success: false, error: `User ${id} not found` })
        : (res.status(500).json({ success: false, error: "Internal server error" }) &&
        console.error(`Error updating user ${id}:`, error))
    );
};


/** DELETE */
export const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(id);

  return prisma.orders
    .findMany({
      where: { user_id: userId },
      select: { id: true },
    })
    .then((orders) =>
      orders.length > 0
        ? Promise.reject({ type: "hasOrders", ids: orders.map((o) => o.id) })
        : prisma.users.delete({ where: { id: userId } }),
    )
    .then((deleted) =>
      res.status(200).json({ success: true, message: `User ${id} deleted`, data: deleted }),
    )
    .catch((error) =>
      error?.type === "hasOrders"
        ? res.status(400).json({
            success: false,
            error: `Cannot delete user ${id}, order ${error.ids.join(", ")} depend exclusively on it`,
          })
        : error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
          ? res.status(404).json({
              success: false,
              error: `User ${id} not found`,
            })
          : (() => {
              console.error(`Error deleting user ${id}:`, error);
              return res.status(500).json({
                success: false,
                error: "Internal server error",
              });
            })(),
    );
};
