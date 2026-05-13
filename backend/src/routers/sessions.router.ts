import { Router } from 'express';
import * as sessionsController from '../controllers/sessions.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

// public routes
router.get('/sessions', sessionsController.getSessions);
router.get('/sessions/:id', sessionsController.getSession);

// admin-only routes
router.post('/sessions', requireAuth, requireRole('Admin'), sessionsController.createSession);
router.put('/sessions/:id', requireAuth, requireRole('Admin'), sessionsController.updateSession);
router.delete('/sessions/:id', requireAuth, requireRole('Admin'), sessionsController.deleteSession);
