import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import z from "zod";
import { getPagination } from "../helpers/index.js";
import { prisma } from "../models/index.js";


/** get all */
export const getOrders = (req: Request, res: Response): Promise<void> => {
  const { take, skip } = getPagination(req);

  return prisma.orders
    .findMany()
    .then((orders) => {
      res.status(200).json({
        success: true,
        data: orders,
      }),
      take !== undefined ? { take } : {},
      skip !== undefined ? { skip } : {}
      })
    .catch((error) => {
      console.error(`Error fetching orders,`, error),
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      })
    })
}


// /** get one */
// export const getOrder = (req: Request, res: Response): Promise<void> => {

// }


// /** create */
// export const createOrder = (req: Request, res: Response): Promise<void> => {

// }


// /** update */
// export const updateOrder = (req: Request, res: Response): Promise<void> => {

// }


// /** delete */
// export const deleteOrder = (req: Request, res: Response): Promise<void> => {

// }
