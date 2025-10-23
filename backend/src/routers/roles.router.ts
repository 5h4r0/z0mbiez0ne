import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller.js';
import { checkRoles } from '../middlewares/access-control.middleware.js';

export const router = Router();
// export default router;

// protected routes (Member, Admin)
router.get('/roles/:id', checkRoles(['Member', 'Admin']), rolesController.getRole);

// protected routes (Admin)
router.get('/roles', checkRoles(['Admin']), rolesController.getRoles);
