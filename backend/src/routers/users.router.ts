import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";

export const router = Router();

// protected routes
router.get("/users", usersController.getUsers);
router.get("/users/:id", usersController.getUser);

// export default router;