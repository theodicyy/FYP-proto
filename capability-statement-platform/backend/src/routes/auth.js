import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  await authController.login(req, res);
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await authController.logout(req, res);
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  await authController.getCurrentUser(req, res);
}));

export default router;
