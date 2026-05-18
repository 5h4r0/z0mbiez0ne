import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireRole } from '../middlewares/requireRole.js';

export const router = Router();

// public routes
router.get('/categories', categoriesController.getCategories);
router.get('/categories/by-slug/:slug', categoriesController.getCategoryBySlug);
router.get('/categories/:id', categoriesController.getCategory);

// admin-only routes
router.post('/categories', requireAuth, requireRole('admin'), categoriesController.createCategory);
router.put('/categories/:id', requireAuth, requireRole('admin'), categoriesController.updateCategory);
router.delete('/categories/:id', requireAuth, requireRole('admin'), categoriesController.deleteCategory);
