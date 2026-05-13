// import path from "node:path";
import { Router } from 'express';

import { router as activitiesRouter } from './activities.router.js';
import { router as authRouter } from './auth.router.js';
import { router as categoriesRouter } from './categories.router.js';
import { router as ordersLinesRouter } from './order.lines.router.js';
import { router as ordersRouter } from './orders.router.js';
import { router as rolesRouter } from './roles.router.js';
import { router as sessionsRouter } from './sessions.router.js';
import { router as usersRouter } from './users.router.js';

export const router = Router();

router.use(activitiesRouter);
router.use(categoriesRouter);

router.use(rolesRouter);
router.use(usersRouter);

router.use('/auth', authRouter);

router.use(sessionsRouter);

router.use(ordersRouter);
router.use(ordersLinesRouter);

// /api/ root
router.get('/', (_req, res) => {
  res.json({ status: 'Nothing here... but the API is running 🚀' });
});

// Documentation swagger
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
