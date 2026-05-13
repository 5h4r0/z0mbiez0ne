import type { Request, Response } from 'express';
import { getPagination } from '../helpers/index.js';
import { prisma } from '../models/index.js';

/** get all */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const { take, skip } = getPagination(req);

  try {
    const orders = await prisma.orders.findMany({
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
      data: orders,
    });
  } catch (error) {
    // log -> stderr, then send error -> do not return the Response
    console.error('error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'error fetching orders',
      error: (error as Error).message,
    });
  }
};

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
