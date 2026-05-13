import { Router } from 'express';
import * as activitiesController from '../controllers/activities.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

// public routes
router.get('/activities', activitiesController.getActivities);
router.get('/activities/:id', activitiesController.getActivity);

// admin-only routes
router.post('/activities', requireAuth, requireRole('Admin'), activitiesController.createActivity);
router.put('/activities/:id', requireAuth, requireRole('Admin'), activitiesController.updateActivity);
router.delete('/activities/:id', requireAuth, requireRole('Admin'), activitiesController.deleteActivity);
