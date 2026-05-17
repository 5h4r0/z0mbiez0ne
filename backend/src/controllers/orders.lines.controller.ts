import { OrderStatus, Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { TAXES_MULTIPLIER } from '../lib/constants.js';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
import { prisma } from '../models/index.js';

const formatDate = (d: Date) => format(d, 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS });

// recalculate order.total_amount from all its lines inside a transaction
const recalcOrderTotal = async (tx: Prisma.TransactionClient, order_id: number) => {
  const allLines = await tx.orders_lines.findMany({ where: { order_id } });
  const subtotal = allLines.reduce((s, l) => s.add(l.amount), new Prisma.Decimal('0'));
  const total_amount = subtotal.mul(TAXES_MULTIPLIER);
  await tx.orders.update({ where: { id: order_id }, data: { total_amount } });
};

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

/** get one */
export const getOrderLine = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);

    const line = await prisma.orders_lines.findUnique({
      where: { id: Number(id) },
      include: {
        session: { select: { id: true, date: true, capacity: true, unit_price: true, status: true } },
        order: { select: { id: true, status: true, user_id: true } },
      },
    });

    if (!line) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order_line', id) });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: line.id,
        order_id: line.order_id,
        session_id: line.session_id,
        tickets_qty: line.tickets_qty,
        amount: Number(line.amount),
        session: {
          id: line.session.id,
          date: formatDate(line.session.date),
          capacity: line.session.capacity,
          unit_price: Number(line.session.unit_price),
          status: line.session.status,
        },
        order: line.order,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status((error as { status?: number }).status || 500).json({
        status: 'error',
        message: (error as Error).message || 'error fetching order line',
      });
    }
  }
};

/** create */
export const createOrderLine = async (req: Request, res: Response): Promise<void> => {
  const bodySchema = z.object({
    order_id: z.number().int().positive(),
    session_id: z.number().int().positive(),
    tickets_qty: z.number().int().min(1),
  });

  try {
    const { order_id, session_id, tickets_qty } = await bodySchema.parseAsync(req.body);

    const line = await prisma.$transaction(
      async (tx) => {
        // all mutations require order.status === Pending
        const order = await tx.orders.findUnique({ where: { id: order_id } });
        if (!order) throw { type: 'orderNotFound', id: order_id };
        if (order.status !== OrderStatus.Pending) throw { type: 'orderNotPending', id: order_id };

        const session = await tx.sessions.findUnique({ where: { id: session_id } });
        if (!session) throw { type: 'sessionNotFound', id: session_id };

        // check remaining capacity
        const agg = await tx.orders_lines.aggregate({
          where: { session_id },
          _sum: { tickets_qty: true },
        });
        const booked = agg._sum.tickets_qty ?? 0;
        const remaining = session.capacity - booked;
        if (remaining < tickets_qty) throw { type: 'insufficientCapacity', id: session_id };

        const amount = new Prisma.Decimal(tickets_qty).mul(session.unit_price);
        const created = await tx.orders_lines.create({
          data: { order_id, session_id, tickets_qty, amount },
        });

        // recalculate order total after insert
        await recalcOrderTotal(tx, order_id);

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    res.status(201).json({
      success: true,
      data: {
        id: line.id,
        order_id: line.order_id,
        session_id: line.session_id,
        tickets_qty: line.tickets_qty,
        amount: Number(line.amount),
      },
      message: buildCudMessage('created', 'order_line', String(line.id)),
    });
  } catch (error) {
    const err = error as { type?: string; id?: number };
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (err?.type === 'orderNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', String(err.id)) });
    } else if (err?.type === 'orderNotPending') {
      res.status(400).json({ success: false, message: buildErrorMessage('not_pending', 'order_line', String(err.id)) });
    } else if (err?.type === 'sessionNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', String(err.id)) });
    } else if (err?.type === 'insufficientCapacity') {
      res
        .status(400)
        .json({ success: false, message: buildErrorMessage('insufficient_capacity', 'session', String(err.id)) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order_line') });
    }
  }
};

/** update */
export const updateOrderLine = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });
  // only tickets_qty is updatable
  const bodySchema = z.object({ tickets_qty: z.number().int().min(1) });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const { tickets_qty } = await bodySchema.parseAsync(req.body);
    const lineId = Number(id);

    const updated = await prisma.$transaction(
      async (tx) => {
        const line = await tx.orders_lines.findUnique({ where: { id: lineId } });
        if (!line) throw { type: 'lineNotFound', id };

        // all mutations require order.status === Pending
        const order = await tx.orders.findUnique({ where: { id: line.order_id } });
        if (!order) throw { type: 'orderNotFound', id: line.order_id };
        if (order.status !== OrderStatus.Pending) throw { type: 'orderNotPending', id: line.order_id };

        const session = await tx.sessions.findUnique({ where: { id: line.session_id } });
        if (!session) throw { type: 'sessionNotFound', id: line.session_id };

        // check capacity excluding the current line being updated
        const agg = await tx.orders_lines.aggregate({
          where: { session_id: line.session_id, NOT: { id: lineId } },
          _sum: { tickets_qty: true },
        });
        const bookedOthers = agg._sum.tickets_qty ?? 0;
        const remaining = session.capacity - bookedOthers;
        if (remaining < tickets_qty) throw { type: 'insufficientCapacity', id: line.session_id };

        const amount = new Prisma.Decimal(tickets_qty).mul(session.unit_price);
        const result = await tx.orders_lines.update({
          where: { id: lineId },
          data: { tickets_qty, amount },
        });

        // recalculate order total after update
        await recalcOrderTotal(tx, line.order_id);

        return result;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        order_id: updated.order_id,
        session_id: updated.session_id,
        tickets_qty: updated.tickets_qty,
        amount: Number(updated.amount),
      },
      message: buildCudMessage('updated', 'order_line', String(updated.id)),
    });
  } catch (error) {
    const err = error as { type?: string; id?: number | string };
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (err?.type === 'lineNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order_line', String(err.id)) });
    } else if (err?.type === 'orderNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', String(err.id)) });
    } else if (err?.type === 'orderNotPending') {
      res.status(400).json({ success: false, message: buildErrorMessage('not_pending', 'order_line', req.params.id) });
    } else if (err?.type === 'sessionNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', String(err.id)) });
    } else if (err?.type === 'insufficientCapacity') {
      res
        .status(400)
        .json({ success: false, message: buildErrorMessage('insufficient_capacity', 'session', String(err.id)) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order_line', req.params.id) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order_line') });
    }
  }
};

/** delete */
export const deleteOrderLine = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const lineId = Number(id);

    await prisma.$transaction(async (tx) => {
      const line = await tx.orders_lines.findUnique({ where: { id: lineId } });
      if (!line) throw { type: 'lineNotFound', id };

      // all mutations require order.status === Pending
      const order = await tx.orders.findUnique({ where: { id: line.order_id } });
      if (!order) throw { type: 'orderNotFound', id: line.order_id };
      if (order.status !== OrderStatus.Pending) throw { type: 'orderNotPending', id: line.order_id };

      await tx.orders_lines.delete({ where: { id: lineId } });

      // recalculate order total after delete
      await recalcOrderTotal(tx, line.order_id);
    });

    res.status(200).json({ success: true, message: buildCudMessage('deleted', 'order_line', id) });
  } catch (error) {
    const err = error as { type?: string; id?: number | string };
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (err?.type === 'lineNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order_line', String(err.id)) });
    } else if (err?.type === 'orderNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', String(err.id)) });
    } else if (err?.type === 'orderNotPending') {
      res.status(400).json({ success: false, message: buildErrorMessage('not_pending', 'order_line', req.params.id) });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order_line', req.params.id) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order_line') });
    }
  }
};
