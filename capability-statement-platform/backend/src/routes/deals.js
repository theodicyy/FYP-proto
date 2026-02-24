import express from 'express';
import dealController from '../controllers/dealController.js';
import { optionalAuthenticate, authenticate } from '../middlewares/auth.js';
import { checkReferenceDataPermission } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Read access: Both Admin and Associate can read deals
router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  await dealController.getDeals(req, res);
}));

router.get('/industries', optionalAuthenticate, asyncHandler(async (req, res) => {
  await dealController.getDealIndustries(req, res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  await dealController.getDealById(req, res);
}));

// Write access: Only Admin
router.post('/', authenticate, checkReferenceDataPermission('create', 'deals'), asyncHandler(async (req, res) => {
  await dealController.createDeal(req, res);
}));

router.put('/:id', authenticate, checkReferenceDataPermission('update', 'deals'), asyncHandler(async (req, res) => {
  await dealController.updateDeal(req, res);
}));

router.delete('/:id', authenticate, checkReferenceDataPermission('delete', 'deals'), asyncHandler(async (req, res) => {
  await dealController.deleteDeal(req, res);
}));

export default router;
