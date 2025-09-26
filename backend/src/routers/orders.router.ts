import { Router } from "express";
import * as ordersController from "../controllers/orders.controller.js";

export const router = Router();

// protected routes
router.get("/orders", ordersController.getOrders);
router.get("/orders/:id", ordersController.getOrder);

// export default router;