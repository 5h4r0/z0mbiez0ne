import { Router } from "express";
// import { router as activitiesRouter } from "./activities.router.js";
// import { router as categoriesRouter } from "./categories.router.js";
// import { router as sessionsRouter } from "./sessions.router.js";

export const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "API is running 🚀" });
});

// router.use("/activities", activitiesRouter);
// router.use("/categories", categoriesRouter);
// router.use("/sessions", sessionsRouter);