import express from 'express';
import awardController from '../controllers/awardController.js';
import { optionalAuthenticate, authenticate } from '../middlewares/auth.js';
import { checkReferenceDataPermission } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Read access: Both Admin and Associate can read awards
router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  await awardController.getAwards(req, res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  await awardController.getAwardById(req, res);
}));

// Write access: Only Admin
router.post('/', authenticate, checkReferenceDataPermission('create', 'awards'), asyncHandler(async (req, res) => {
  await awardController.createAward(req, res);
}));

router.put('/:id', authenticate, checkReferenceDataPermission('update', 'awards'), asyncHandler(async (req, res) => {
  await awardController.updateAward(req, res);
}));

router.delete('/:id', authenticate, checkReferenceDataPermission('delete', 'awards'), asyncHandler(async (req, res) => {
  await awardController.deleteAward(req, res);
}));

export default router;
