import type { Request, Response } from "express";
import z from "zod";
import { getPagination } from "../helpers/index.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../lib/errors.js";
import { Prisma } from "@prisma/client"
import { prisma } from "../models/index.js";


/** get all */
export const getSessions = (req: Request, res: Response) => {
  const { take, skip } = getPagination(req)

  const paginationSchema = z.object({
    take: z.string().optional(),
    skip: z.string().optional()
  })

  return paginationSchema.parseAsync(req.query)
    .then(() => {
      const baseQuery: Parameters<typeof prisma.sessions.findMany>[0] = {
        select: {
          id: true,
          activity_id: true,
          date: true,
          capacity: true,
          unit_price: true,
          status: true,
          activity: {
            select: { id: true, title: true, description: true }
          },
          orders_lines: {
            select: { id: true, session_id: true }
          }
        }
      }

      return prisma.sessions.findMany(
        Object.assign(
          baseQuery,
          take !== undefined ? { take } : {},
          skip !== undefined ? { skip } : {}
        ) as Prisma.sessionsFindManyArgs
      )
    })
    .then((sessions) => {
      return sessions.length === 0
        ? Promise.reject(new BadRequestError("no sessions caught"))
        : res.status(200).json({
            success: true,
            data: sessions
          })
    })
    .catch((error) => {
      return error instanceof z.ZodError
        ? res.status(400).json({
            status: "error",
            message: error.issues.map((e) => e.message).join(", ")
          })
        : res.status(500).json({
            status: "error",
            message: error.message || "error fetching sessions"
          })
    })
}
