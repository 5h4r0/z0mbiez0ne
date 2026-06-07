import { readFileSync } from 'node:fs';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';
import { router as activitiesRouter } from './activities.router.js';
import { router as authRouter } from './auth.router.js';
import { router as contactRouter } from './contact.router.js';
import { router as categoriesRouter } from './categories.router.js';
import { router as ordersLinesRouter } from './order.lines.router.js';
import { router as ordersRouter } from './orders.router.js';
import { router as rolesRouter } from './roles.router.js';
import { router as sessionsRouter } from './sessions.router.js';
import { router as uploadRouter } from './upload.router.js';
import { router as usersRouter } from './users.router.js';

export const router = Router();

router.use(activitiesRouter);
router.use(categoriesRouter);
router.use(sessionsRouter);
router.use(ordersRouter);
router.use(ordersLinesRouter);

router.use(contactRouter);
router.use(uploadRouter);
router.use(rolesRouter);
router.use(usersRouter);
router.use('/auth', authRouter);

// /api/ root
router.get('/', (_req, res) => {
  res.json({ status: 'Nothing here... but the API is running 🚀' });
});

const spec = parse(readFileSync(new URL('../../openapi.yaml', import.meta.url), 'utf-8'));
router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
