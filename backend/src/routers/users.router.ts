import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";

export const router = Router();

// protected routes
router.get("/users", usersController.getUsers);
router.get("/users/:id", usersController.getUser);

// public routes
router.post("/users", usersController.registerUser);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);


// export default router;