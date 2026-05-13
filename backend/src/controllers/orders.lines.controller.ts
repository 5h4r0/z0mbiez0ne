import type { Request, Response } from 'express';
import { getPagination } from '../helpers/index.js';
import { prisma } from '../models/index.js';

/** get all */
export const getOrdersLines = async (req: Request, res: Response): Promise<void> => {
  const { take, skip } = getPagination(req);

  try {
    const orders_lines = await prisma.orders_lines.findMany({
      // optional args -> spread only when defined
      ...(typeof take !== 'undefined' ? { take } : {}),
      ...(typeof skip !== 'undefined' ? { skip } : {}),
    });

    /** () => res.status(...).json(...) returns Response ❌ Promise<Response>
     * the brace {} bloc cancels the implicit return
     * () => { res.status(...).json(...); } returns nothing ✅ Promise<void> */

    // send success -> do not return the Response
    res.status(200).json({
      success: true,
      data: orders_lines,
    });
  } catch (error) {
    console.error(`Error fetching orders lines,`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders lines',
      error: (error as Error).message,
    });
  }
};

// /** get one */
// export const getOrderLine = (req: Request, res: Response): Promise<void> => {

// }

// /** create */
// export const createOrderLine = (req: Request, res: Response): Promise<void> => {

// }

// /** update */
// export const updateOrderLine = (req: Request, res: Response): Promise<void> => {

// }

// /** delete */
// export const deleteOrderLine = (req: Request, res: Response): Promise<void> => {

// }
