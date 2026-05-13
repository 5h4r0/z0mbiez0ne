import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

export const router = Router();

// public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// stateless logout — client drops tokens
router.post('/logout', authController.logoutUser);

// requires valid refresh token in cookie (no access token needed)
router.post('/refresh', authController.refreshAccessToken);

// protected profile
router.get('/profile', requireAuth, authController.getAuthenticatedUser);
