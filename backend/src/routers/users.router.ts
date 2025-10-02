import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";

export const router = Router();

// protected route (admin)
router.get("/users", usersController.getUsers);

// protected route (member, admin)
router.get("/users/:id", usersController.getUser);

// protected routes (member)
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);


// export default router;