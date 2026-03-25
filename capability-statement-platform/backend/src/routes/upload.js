import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { runBulkCoreImport } from '../services/bulkCoreImport/bulkCoreImportService.js';

const router = express.Router();

router.post(
  '/bulk-core',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await runBulkCoreImport(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  })
);

export default router;
