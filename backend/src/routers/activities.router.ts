import { Router } from "express";
import * as activitiesController from "../controllers/activities.controller.js";

export const router = Router();

// public routes
router.get("/activities", activitiesController.getAllActivities);
router.get("/activities/:id", activitiesController.getActivityById);

// protected routes (admin)
router.post("/activities", activitiesController.createActivity);
router.put("/activities/:id", activitiesController.updateActivity);
router.delete("/activities/:id", activitiesController.deleteActivity);

export default router;
