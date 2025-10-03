import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import z from "zod";
import { getPagination } from "../helpers/index.js";
import { prisma } from "../models/index.js";


/** get all */
export const getSessions = (req: Request, res: Response): Promise<void> => {
  const { take, skip } = getPagination(req);

  return prisma.sessions
    .findMany()
    .then((sessions) => {
      res.status(200).json({
        success: true,
        data: sessions,
      }),
      take !== undefined ? { take } : {},
      skip !== undefined ? { skip } : {}
      })
    .catch((error) => {
      console.error(`Error fetching sessions,`, error),
      res.status(500).json({
        success: false,
        message: "Error fetching sessions",
        error: error.message,
      })
    })
}


/** get one */
export const getSession = (req: Request, res: Response): Promise<void> => {

}


/** create */
export const createSession = (req: Request, res: Response): Promise<void> => {

}


/** update */
export const updateSession = (req: Request, res: Response): Promise<void> => {

}


/** delete */
export const deleteSession = (req: Request, res: Response): Promise<void> => {

}
