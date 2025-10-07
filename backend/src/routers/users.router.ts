import { Router, type NextFunction } from "express"
import * as usersController from "../controllers/users.controller.js"
import { checkRoles } from "../middlewares/access-control.middleware.js"

export const router = Router()
// export default router

// protected routes (member, admin)
router.get("/users/:id", checkRoles(["Member", "Admin"]), usersController.getUser)
router.put("/users/:id", checkRoles(["Member", "Admin"]), usersController.updateUser)
router.delete("/users/:id", checkRoles(["Member", "Admin"]), usersController.deleteUser)

// protected route (admin)
router.get("/users", checkRoles(["Admin"]), usersController.getUsers)
