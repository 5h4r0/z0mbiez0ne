import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { checkRoles } from "../middlewares/access-control.middleware.js";


export const router = Router();
// export default router;


// public routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.post("/refresh", authController.refreshAccessToken);

// protected routes
// router.get("/profile", checkRoles(["Member", "Admin"]), authController.getAuthenticatedUser);
// router.put("/profile/:id", checkRoles(["Member", "Admin"]), authController.updateAuthenticatedUser);
// router.delete("/profile/:id", checkRoles(["Member", "Admin"]), authController.deleteAuthenticatedUser);
