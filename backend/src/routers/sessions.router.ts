import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import { checkRoles } from "../middlewares/access-control.middleware.js"


export const router = Router();
// export default router;


// public routes
router.get("/sessions", sessionsController.getSessions);
router.get("/sessions/:id", sessionsController.getSession);

// protected routes (Admin)
// router.post("/session", checkRoles(["Admin"]), sessionsController.createSession);
// router.put("/sessions/:id", checkRoles(["Admin"]), sessionsController.updateSession);
// router.delete("/sessions/:id", checkRoles(["Admin"]), sessionsController.deleteSession);
