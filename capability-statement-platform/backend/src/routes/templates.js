import express from 'express';
import templateController from '../controllers/templateController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { requireAssociateOrAdmin, checkReferenceDataPermission } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Read access: Both Admin and Associate can read templates
router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateController.getTemplates(req, res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateController.getTemplateById(req, res);
}));

// Write access: Only Admin can create/update/delete templates
router.post('/', authenticate, checkReferenceDataPermission('create', 'templates'), asyncHandler(async (req, res) => {
  await templateController.createTemplate(req, res);
}));

router.put('/:id', authenticate, checkReferenceDataPermission('update', 'templates'), asyncHandler(async (req, res) => {
  await templateController.updateTemplate(req, res);
}));

router.delete('/:id', authenticate, checkReferenceDataPermission('delete', 'templates'), asyncHandler(async (req, res) => {
  await templateController.deleteTemplate(req, res);
}));

export default router;
