import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
// import { checkRoles } from "../middlewares/access-control.middleware.js";

export const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.post("/refresh", authController.refreshAccessToken);

// router.get("/profile", checkRoles(["member", "admin"]), authController.getAuthenticatedUser);
// router.put("/profile/:id", checkRoles(["member", "admin"]), authController.updateAuthenticatedUser);
// router.delete("/profile/:id", checkRoles(["member", "admin"]), authController.deleteAuthenticatedUser);


// export default router;
