import { Router } from "express";
import * as rolesController from "../controllers/roles.controller.js";

export const router = Router();

// protected routes (member, admin)
router.get("/roles/:id", rolesController.getRole);

// protected routes (admin)
router.get("/roles", rolesController.getRoles);


// export default router;