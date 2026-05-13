import { Router } from 'express';
import * as ordersLinesController from '../controllers/orders.lines.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/orders_lines', requireAuth, requireRole('Admin'), ordersLinesController.getOrdersLines);
router.get('/orders_lines/:id', requireAuth, requireRole('Member', 'Admin'), ordersLinesController.getOrderLine);
router.post('/orders_lines', requireAuth, requireRole('Member', 'Admin'), ordersLinesController.createOrderLine);
router.put('/orders_lines/:id', requireAuth, requireRole('Member', 'Admin'), ordersLinesController.updateOrderLine);
router.delete('/orders_lines/:id', requireAuth, requireRole('Member', 'Admin'), ordersLinesController.deleteOrderLine);
