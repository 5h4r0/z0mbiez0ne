import { Router } from "express";
import * as activitiesController from "../controllers/activities.controller.js";
import { checkRoles } from "../middlewares/access-control.middleware.js"


export const router = Router();
// export default router;


// public routes
router.get("/activities", activitiesController.getActivities);
router.get("/activities/:id", activitiesController.getActivity);

// protected routes (Admin)
router.post("/activities", checkRoles(["Admin"]), activitiesController.createActivity);
router.put("/activities/:id", checkRoles(["Admin"]), activitiesController.updateActivity);
router.delete("/activities/:id", checkRoles(["Admin"]), activitiesController.deleteActivity);
