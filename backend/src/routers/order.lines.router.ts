import { Router } from "express";
import * as ordersLinesController from "../controllers/orders.lines.controller.js";
import { checkRoles } from "../middlewares/access-control.middleware.js"


export const router = Router();
// export default router;


// protected routes (Admin, member)
// router.get("/orders_lines/:id", checkRoles(["Member", "Admin"]), ordersLinesController.getOrderLine);
// router.post("/orders_lines", checkRoles(["Member", "Admin"]), ordersLinesController.createOrderLine);
// router.put("/orders_lines/:id", checkRoles(["Member", "Admin"]), ordersLinesController.updateOrderLine);
// router.delete("/orders_lines/:id", checkRoles(["Member", "Admin"]), ordersLinesController.deleteOrderLine);

// protected routes (Admin)
router.get("/orders_lines", checkRoles(["Admin"]), ordersLinesController.getOrdersLines);
