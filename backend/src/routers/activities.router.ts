import { Router } from 'express';
import * as activitiesController from '../controllers/activities.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

// public routes
router.get('/activities', activitiesController.getActivities);
router.get('/activities/:id', activitiesController.getActivity);

// admin-only routes
router.post('/activities', requireAuth, requireRole('admin'), activitiesController.createActivity);
router.put('/activities/:id', requireAuth, requireRole('admin'), activitiesController.updateActivity);
router.delete('/activities/:id', requireAuth, requireRole('admin'), activitiesController.deleteActivity);
