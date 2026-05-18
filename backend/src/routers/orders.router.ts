import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/orders', requireAuth, requireRole('admin'), ordersController.getOrders);
router.get('/orders/mine', requireAuth, requireRole('member', 'admin'), ordersController.getMyOrders);
router.get('/orders/:id', requireAuth, requireRole('member', 'admin'), ordersController.getOrder);
router.post('/orders', requireAuth, requireRole('member', 'admin'), ordersController.createOrder);
router.put('/orders/:id', requireAuth, requireRole('member', 'admin'), ordersController.updateOrder);
router.delete('/orders/:id', requireAuth, requireRole('member', 'admin'), ordersController.deleteOrder);
