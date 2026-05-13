import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { checkRoles } from '../middlewares/access-control.middleware.js';

export const router = Router();
// export default router;

// protected routes (Member, Admin)
router.get('/orders/:id', checkRoles(['Member', 'Admin']), ordersController.getOrder);
router.post('/orders', checkRoles(['Member', 'Admin']), ordersController.createOrder);
router.put('/orders/:id', checkRoles(['Member', 'Admin']), ordersController.updateOrder);
router.delete('/orders/:id', checkRoles(['Member', 'Admin']), ordersController.deleteOrder);

// protected routes (Admin)
router.get('/orders', checkRoles(['Admin']), ordersController.getOrders);
