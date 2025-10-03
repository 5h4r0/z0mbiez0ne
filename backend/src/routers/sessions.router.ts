import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";

export const router = Router();

// public routes
router.get("/sessions", sessionsController.getSessions);
router.get("/sessions/:id", sessionsController.getSession);

// protected routes (admin)
router.post("/session", sessionsController.createSession);
router.put("/sessions/:id", sessionsController.updateSession);
router.delete("/sessions/:id", sessionsController.deleteSession);


// export default router;