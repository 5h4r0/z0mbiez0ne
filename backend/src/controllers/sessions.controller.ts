import type { Request, Response } from "express";
import z from "zod";
import { getPagination } from "../helpers/index.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../lib/errors.js";
import { prisma } from "../models/index.js";
import { format } from "date-fns"
import { enUS } from "date-fns/locale"        // -> use US locale

/** get all sessions */
export const getSessions = (req: Request, res: Response) => {

  const { take, skip } = getPagination(req);
  // schema to validate pagination query
  const paginationSchema = z.object({
    take: z.string().optional(),
    skip: z.string().optional()
  })

  return paginationSchema.parseAsync(req.query)
    .then(() => {
      // args for prisma findMany
      const args = {
        include: {
          orders_lines: {
            include: {
              order: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstname: true,
                      lastname: true
                    }
                  }
                }
              }
            }
          }
        },
        ...(take !== undefined ? { take } : {}),
        ...(skip !== undefined ? { skip } : {})
      }

      // query sessions with relations
      return prisma.sessions.findMany(args)
    })
    .then((sessions) => {
      // format sessions with flattened users
      const formatted = sessions.map((s) => ({
        id: s.id,
        date: format(new Date(s.date), "EEEE, MMMM d, yyyy, h:mm a", { locale: enUS }),
        capacity: s.capacity,
        unit_price: Number(s.unit_price),
        status: s.status,
        users: s.orders_lines.map((ol) => ol.order.user)
      }))

      // handle empty result
      return formatted.length === 0
        ? Promise.reject(new BadRequestError("no sessions caught"))
        : res.status(200).json({ success: true, data: formatted })
    })
    .catch((error) => {
      // handle zod error
      return error instanceof z.ZodError
        ? res.status(400).json({ status: "error", message: error.issues.map((e) => e.message).join(", ") })
        // handle generic error
        : res.status(500).json({ status: "error", message: error.message || "error fetching sessions" })
    })
}


/** get one */
export const getSession = (req: Request, res: Response) => {
  // schema to validate route param
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, "id must be a number") })

  return paramsSchema.parseAsync(req.params)
    // .then((result) => {
    //   const id = result.id   // possible too
    
    .then(({ id }) => {
      // args for prisma findUnique
      const args = {
        where: { id: Number(id) }, // required for findUnique
        include: {
          orders_lines: {
            include: {
              order: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstname: true,
                      lastname: true
                    }
                  }
                }
              }
            }
          }
        }
      }
      // query session with relations
      return prisma.sessions.findUnique(args)
    })
    .then((session) => {
      // reject when null, else format
      return session === null
        ? Promise.reject(new BadRequestError("session not found"))
        : res.status(200).json({
            success: true,
            data: {
              id: session.id,
              date: format(session.date, "EEEE, MMMM d, yyyy, h:mm a", { locale: enUS }),
              capacity: session.capacity,
              unit_price: Number(session.unit_price),
              status: session.status,
              users: session.orders_lines.map((ol) => ol.order.user)
            }
          })
    })
    .catch((error) => {
      // handle zod error vs generic
      return error instanceof z.ZodError
        ? res.status(400).json({ status: "error", message: error.issues.map((e) => e.message).join(", ") })
        : res.status(500).json({ status: "error", message: error.message || "error fetching session" })
    })
}




// /** create */
// export const createSession = (req: Request, res: Response): Promise<void> => {

// }


// /** update */
// export const updateSession = (req: Request, res: Response): Promise<void> => {

// }


// /** delete */
// export const deleteSession = (req: Request, res: Response): Promise<void> => {

// }
