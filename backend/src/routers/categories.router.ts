import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller.js";

export const router = Router();

// public routes
router.get("/categories", categoriesController.getCategories);
router.get("/categories/:id", categoriesController.getCategory);

// protected routes (admin)
router.post("/categories", categoriesController.createCategory);
router.put("/categories/:id", categoriesController.updateCategory);
router.delete("/categories/:id", categoriesController.deleteCategory);

// export default router;