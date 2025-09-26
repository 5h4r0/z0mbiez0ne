import { Router } from "express";
import * as ordersLinesController from "../controllers/orders.lines.controller.js";

export const router = Router();

// protected routes
router.get("/orders_lines", ordersLinesController.getOrderLine);
router.get("/orders_lines/:id", ordersLinesController.getOrderLines);

// export default router;