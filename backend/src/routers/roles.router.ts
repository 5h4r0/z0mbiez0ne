import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/roles', requireAuth, requireRole('Admin'), rolesController.getRoles);
router.get('/roles/:id', requireAuth, requireRole('Member', 'Admin'), rolesController.getRole);
