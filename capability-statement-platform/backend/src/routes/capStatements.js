import express from 'express';
import capStatementController from '../controllers/capStatementController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { requireAssociateOrAdmin, canEditCapStatement, requireAdmin } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Generate: Both Admin and Associate can generate
router.post('/generate', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await capStatementController.generateStatement(req, res);
}));

// Create: Both Admin and Associate can create
router.post('/', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await capStatementController.saveStatement(req, res);
}));

// List: Both can list, but Associates see only their own (filtered in service)
router.get('/', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await capStatementController.getStatements(req, res);
}));

// Get by ID: Both can read
router.get('/:id', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await capStatementController.getStatementById(req, res);
}));

// Update: Associates can only edit their own, Admin can edit any
router.put('/:id', authenticate, requireAssociateOrAdmin, canEditCapStatement, asyncHandler(async (req, res) => {
  await capStatementController.updateStatement(req, res);
}));

// Delete: Associates can only delete their own, Admin can delete any
router.delete('/:id', authenticate, requireAssociateOrAdmin, canEditCapStatement, asyncHandler(async (req, res) => {
  await capStatementController.deleteStatement(req, res);
}));

// Create new version: Both Admin and Associate can create versions of their statements
router.post('/:id/versions', authenticate, requireAssociateOrAdmin, canEditCapStatement, asyncHandler(async (req, res) => {
  await capStatementController.createVersion(req, res);
}));

// Update existing version: Both Admin and Associate can update versions of their statements
router.put('/:id/versions/:versionId', authenticate, requireAssociateOrAdmin, canEditCapStatement, asyncHandler(async (req, res) => {
  await capStatementController.updateVersion(req, res);
}));

export default router;
