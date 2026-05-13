import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/orders', requireAuth, requireRole('Admin'), ordersController.getOrders);
router.get('/orders/:id', requireAuth, requireRole('Member', 'Admin'), ordersController.getOrder);
router.post('/orders', requireAuth, requireRole('Member', 'Admin'), ordersController.createOrder);
router.put('/orders/:id', requireAuth, requireRole('Member', 'Admin'), ordersController.updateOrder);
router.delete('/orders/:id', requireAuth, requireRole('Member', 'Admin'), ordersController.deleteOrder);
