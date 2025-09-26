import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";

export const router = Router();

// protected routes
router.get("/sessions", sessionsController.getSessions);
router.get("/sessions/:id", sessionsController.getSession);

// export default router;