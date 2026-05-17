import { Router } from 'express';
import * as ordersLinesController from '../controllers/orders.lines.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/orders_lines', requireAuth, requireRole('admin'), ordersLinesController.getOrdersLines);
router.get('/orders_lines/:id', requireAuth, requireRole('member', 'admin'), ordersLinesController.getOrderLine);
router.post('/orders_lines', requireAuth, requireRole('member', 'admin'), ordersLinesController.createOrderLine);
router.put('/orders_lines/:id', requireAuth, requireRole('member', 'admin'), ordersLinesController.updateOrderLine);
router.delete('/orders_lines/:id', requireAuth, requireRole('member', 'admin'), ordersLinesController.deleteOrderLine);
