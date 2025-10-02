import { Router } from "express";
import * as ordersLinesController from "../controllers/orders.lines.controller.js";

export const router = Router();

// protected routes (admin, member)
router.get("/orders_lines/:id", ordersLinesController.getOrderLine);
router.post("/orders_lines", ordersLinesController.createOrderLine);
router.put("/orders_lines/:id", ordersLinesController.updateOrderLine);
router.delete("/orders_lines/:id", ordersLinesController.deleteOrderLine);

// protected routes (admin)
router.get("/orders_lines", ordersLinesController.getOrdersLines);


// export default router;