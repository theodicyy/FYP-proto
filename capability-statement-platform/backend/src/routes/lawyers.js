import express from 'express';
import lawyerController from '../controllers/lawyerController.js';
import { optionalAuthenticate, authenticate } from '../middlewares/auth.js';
import { checkReferenceDataPermission } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Read access: Both Admin and Associate can read lawyers
router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  await lawyerController.getLawyers(req, res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  await lawyerController.getLawyerById(req, res);
}));

// Write access: Only Admin
router.post('/', authenticate, checkReferenceDataPermission('create', 'lawyers'), asyncHandler(async (req, res) => {
  await lawyerController.createLawyer(req, res);
}));

router.put('/:id', authenticate, checkReferenceDataPermission('update', 'lawyers'), asyncHandler(async (req, res) => {
  await lawyerController.updateLawyer(req, res);
}));

router.delete('/:id', authenticate, checkReferenceDataPermission('delete', 'lawyers'), asyncHandler(async (req, res) => {
  await lawyerController.deleteLawyer(req, res);
}));

export default router;
