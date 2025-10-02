import { Router } from "express";
import * as ordersController from "../controllers/orders.controller.js";

export const router = Router();

// protected routes (admin, member)
router.get("/orders/:id", ordersController.getOrder);
router.post("/orders", ordersController.createOrder);
router.put("/orders/:id", ordersController.updateOrder);
router.delete("/orders/:id", ordersController.deleteOrder);

// protected routes (admin)
router.get("/orders", ordersController.getOrders);


// export default router;