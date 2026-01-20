import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import capStatementController from '../controllers/capStatementController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { requireAssociateOrAdmin, canEditCapStatement, requireAdmin } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Configure multer for image uploads (similar to template definitions)
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'statements');
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `statement-${req.params.id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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

// Upload image for capability statement
router.post('/:id/upload-image', authenticate, requireAssociateOrAdmin, canEditCapStatement, upload.single('image'), asyncHandler(async (req, res) => {
  await capStatementController.uploadImage(req, res);
}));

export default router;
