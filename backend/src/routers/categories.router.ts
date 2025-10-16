import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller.js";
import { checkRoles } from "../middlewares/access-control.middleware.js"


export const router = Router();
// export default router;


// public routes
router.get("/categories", categoriesController.getCategories);
router.get("/categories/:id", categoriesController.getCategory);

// protected routes (admin)
router.post("/categories", checkRoles(["Admin"]), categoriesController.createCategory);
router.put("/categories/:id", checkRoles(["Admin"]), categoriesController.updateCategory);
router.delete("/categories/:id", checkRoles(["Admin"]), categoriesController.deleteCategory);
