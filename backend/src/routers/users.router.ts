import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

router.get('/users', requireAuth, requireRole('admin'), usersController.getUsers);
router.get('/users/:id', requireAuth, requireRole('member', 'admin'), usersController.getUser);
router.put('/users/:id/password', requireAuth, requireRole('member', 'admin'), usersController.updatePassword);
router.put('/users/:id', requireAuth, requireRole('member', 'admin'), usersController.updateUser);
router.delete('/users/:id', requireAuth, requireRole('member', 'admin'), usersController.deleteUser);
