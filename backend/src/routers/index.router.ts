// import path from "node:path";
import { Router } from "express";

import { router as usersRouter } from "./users.router.js";
import { router as rolesRouter } from "./roles.router.js";
import { router as activitiesRouter } from "./activities.router.js";
import { router as categoriesRouter } from "./categories.router.js";

export const router = Router();

router.use(usersRouter);
router.use(rolesRouter)
router.use(activitiesRouter);
router.use(categoriesRouter);

// router.use("sessionsRouter);






// /api/ root
router.get("/", (req, res) => {
  res.json({ status: "Nothing here... but the API is running 🚀" });
});





// // Documentation swagger
// const spec = swaggerJsdoc({
//   definition: {
//     info: {
//       title: 'the Z0mbie Z0ne',
//       version: '1.0.0',
//     },
//     basePath: "/backend"
//   },
//   apis: [path.join(import.meta.dirname, '*.router.ts')]
// });
// router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));