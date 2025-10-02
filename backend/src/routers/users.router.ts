import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";

export const router = Router();

// protected routes (member, admin)
router.get("/users/:id", usersController.getUser);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

// protected route (admin)
router.get("/users", usersController.getUsers);


// export default router;