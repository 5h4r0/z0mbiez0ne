import { OrderStatus, Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Request, Response } from 'express';
import z from 'zod';
import { getPagination } from '../helpers/index.js';
import { TAXES_MULTIPLIER, TAXES_RATE } from '../lib/constants.js';
import { buildCudMessage, buildErrorMessage } from '../lib/messages.js';
import { prisma } from '../models/index.js';

// valid status transitions: only these paths are allowed
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Refunded],
};

const formatDate = (d: Date) => format(d, 'EEEE, MMMM d, yyyy, h:mm a', { locale: enUS });

// shared order response shape (without lines)
const formatOrder = (o: {
  id: number;
  user_id: number;
  taxes: Prisma.Decimal;
  total_amount: Prisma.Decimal;
  payment_method: string | null;
  payment_date: Date | null;
  status: OrderStatus;
  created_at: Date;
  deleted_at: Date | null;
}) => ({
  id: o.id,
  user_id: o.user_id,
  taxes: Number(o.taxes),
  total_amount: Number(o.total_amount),
  payment_method: o.payment_method,
  payment_date: o.payment_date ? formatDate(o.payment_date) : null,
  status: o.status,
  created_at: o.created_at,
  deleted_at: o.deleted_at,
});

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
      data: orders.map(formatOrder),
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

/** get one */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);

    if (!req.user) {
      res.status(401).json({ success: false, message: 'not authenticated' });
      return;
    }

    const isAdmin = req.user.roleName === 'admin';

    const order = await prisma.orders.findUnique({
      where: {
        id: Number(id),
        ...(!isAdmin && { user_id: req.user.id }),
      },
      include: {
        orders_lines: {
          // include session details alongside each line
          include: {
            session: {
              select: {
                id: true,
                date: true,
                capacity: true,
                unit_price: true,
                status: true,
                activity: { select: { title: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', id) });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        ...formatOrder(order),
        lines: order.orders_lines.map((ol) => ({
          id: ol.id,
          session_id: ol.session_id,
          tickets_qty: ol.tickets_qty,
          amount: Number(ol.amount),
          activity_title: ol.session.activity?.title ?? null,
          session: {
            id: ol.session.id,
            date: formatDate(ol.session.date),
            date_iso: ol.session.date.toISOString(),
            capacity: ol.session.capacity,
            unit_price: Number(ol.session.unit_price),
            status: ol.session.status,
          },
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order') });
    }
  }
};

/** get my orders (authenticated user) */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: req.user.id },
      include: {
        orders_lines: {
          include: {
            session: {
              select: {
                id: true,
                date: true,
                capacity: true,
                unit_price: true,
                status: true,
                activity: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: orders.map((o) => ({
        ...formatOrder(o),
        lines: o.orders_lines.map((ol) => ({
          id: ol.id,
          session_id: ol.session_id,
          tickets_qty: ol.tickets_qty,
          amount: Number(ol.amount),
          activity_title: ol.session.activity?.title ?? null,
          session: {
            id: ol.session.id,
            date: formatDate(ol.session.date),
            date_iso: ol.session.date.toISOString(),
            capacity: ol.session.capacity,
            unit_price: Number(ol.session.unit_price),
            status: ol.session.status,
          },
        })),
      })),
    });
  } catch (error) {
    console.error('error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'error fetching user orders' });
  }
};

/** create */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const bodySchema = z.object({
    user_id: z.number().int().positive(),
    payment_method: z.string().max(30).optional(),
    lines: z
      .array(
        z.object({
          session_id: z.number().int().positive(),
          tickets_qty: z.number().int().min(1),
        }),
      )
      .min(1, { message: 'at least one line is required' }),
  });

  try {
    const { user_id, payment_method, lines } = await bodySchema.parseAsync(req.body);

    const result = await prisma.$transaction(
      async (tx) => {
        // create order with placeholder total — will be updated after lines are inserted
        const order = await tx.orders.create({
          data: {
            user_id,
            taxes: TAXES_RATE,
            total_amount: new Prisma.Decimal('0'),
            status: OrderStatus.Pending,
            ...(payment_method ? { payment_method } : {}),
          },
        });

        const createdLines: {
          amount: Prisma.Decimal;
          id: number;
          order_id: number;
          session_id: number;
          tickets_qty: number;
        }[] = [];

        for (const line of lines) {
          const { session_id, tickets_qty } = line;

          const session = await tx.sessions.findUnique({ where: { id: session_id } });
          if (!session) throw { type: 'sessionNotFound', id: session_id };

          // check remaining capacity: capacity - already booked tickets for this session
          const agg = await tx.orders_lines.aggregate({
            where: {
              session_id,
              order: { status: { notIn: ['Cancelled', 'Refunded'] } },
            },
            _sum: { tickets_qty: true },
          });
          const booked = agg._sum.tickets_qty ?? 0;
          const remaining = session.capacity - booked;
          if (remaining < tickets_qty) {
            throw { type: 'insufficientCapacity', id: session_id };
          }

          const amount = new Prisma.Decimal(tickets_qty).mul(session.unit_price);
          const orderLine = await tx.orders_lines.create({
            data: { order_id: order.id, session_id, tickets_qty, amount },
          });
          createdLines.push(orderLine);
        }

        // recalculate total_amount = SUM(lines.amount) * (1 + taxes_rate)
        const subtotal = createdLines.reduce((s, l) => s.add(l.amount), new Prisma.Decimal('0'));
        const total_amount = subtotal.mul(TAXES_MULTIPLIER);

        return tx.orders.update({
          where: { id: order.id },
          data: { total_amount },
          include: {
            orders_lines: {
              include: {
                session: { select: { id: true, date: true, capacity: true, unit_price: true, status: true } },
              },
            },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    res.status(201).json({
      success: true,
      data: {
        ...formatOrder(result),
        lines: result.orders_lines.map((ol) => ({
          id: ol.id,
          session_id: ol.session_id,
          tickets_qty: ol.tickets_qty,
          amount: Number(ol.amount),
          session: {
            id: ol.session.id,
            date: formatDate(ol.session.date),
            date_iso: ol.session.date.toISOString(),
            capacity: ol.session.capacity,
            unit_price: Number(ol.session.unit_price),
            status: ol.session.status,
          },
        })),
      },
      message: buildCudMessage('created', 'order', String(result.id)),
    });
  } catch (error) {
    const err = error as { type?: string; id?: number };
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (err?.type === 'sessionNotFound') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'session', String(err.id)) });
    } else if (err?.type === 'insufficientCapacity') {
      res
        .status(400)
        .json({ success: false, message: buildErrorMessage('insufficient_capacity', 'session', String(err.id)) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order') });
    }
  }
};

/** update */
// TODO: intégrer Stripe pour le paiement réel — gérer les cas d'échec,
// refus de carte, 3DS, remboursement. Prévoir mode test avec carte Stripe test.
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });
  const bodySchema = z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    payment_method: z.string().max(30).optional(),
    payment_date: z.string().optional(),
  });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);
    const body = await bodySchema.parseAsync(req.body);

    const order = await prisma.orders.findUnique({ where: { id: Number(id) } });
    if (!order) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', id) });
      return;
    }

    // enforce valid status transitions
    if (body.status !== undefined && body.status !== order.status) {
      const allowed = VALID_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(body.status)) {
        res.status(400).json({ success: false, message: buildErrorMessage('invalid_status_transition', 'order', id) });
        return;
      }
    }

    const data: Prisma.ordersUpdateInput = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.payment_method !== undefined) data.payment_method = body.payment_method;
    if (body.payment_date !== undefined) data.payment_date = new Date(body.payment_date);

    const updated = await prisma.orders.update({ where: { id: Number(id) }, data });

    res.status(200).json({
      success: true,
      data: formatOrder(updated),
      message: buildCudMessage('updated', 'order', String(updated.id)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', req.params.id) });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order') });
    }
  }
};

/** delete (soft) */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const paramsSchema = z.object({ id: z.string().regex(/^\d+$/, 'id must be a number') });

  try {
    const { id } = await paramsSchema.parseAsync(req.params);

    const order = await prisma.orders.findUnique({ where: { id: Number(id) } });
    if (!order) {
      res.status(404).json({ success: false, message: buildErrorMessage('not_found', 'order', id) });
      return;
    }

    if (order.status !== OrderStatus.Pending) {
      res.status(400).json({ success: false, message: buildErrorMessage('not_pending', 'order', id) });
      return;
    }

    const deleted = await prisma.orders.update({
      where: { id: Number(id) },
      data: { deleted_at: new Date() },
    });

    res.status(200).json({
      success: true,
      data: formatOrder(deleted),
      message: buildCudMessage('deleted', 'order', String(deleted.id)),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.issues.map((e) => e.message).join(', ') });
    } else {
      res.status(500).json({ success: false, message: buildErrorMessage('internal_error', 'order') });
    }
  }
};
