import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/users', requireAuth, requireRole('Admin'), usersController.getUsers);
router.get('/users/:id', requireAuth, requireRole('Member', 'Admin'), usersController.getUser);
router.put('/users/:id', requireAuth, requireRole('Member', 'Admin'), usersController.updateUser);
router.delete('/users/:id', requireAuth, requireRole('Member', 'Admin'), usersController.deleteUser);
