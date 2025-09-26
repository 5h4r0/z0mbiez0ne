import { Router } from "express";
import * as rolesController from "../controllers/roles.controller.js";

export const router = Router();

// protected routes
router.get("/roles", rolesController.getRoles);
router.get("/roles/:id", rolesController.getRole);

// export default router;