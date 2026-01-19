import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import templateDefinitionController from '../controllers/templateDefinitionController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { requireAssociateOrAdmin, checkReferenceDataPermission } from '../middlewares/rbac.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates');
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
    cb(null, `template-${req.params.id}-${uniqueSuffix}${ext}`);
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

// Read access: Both Admin and Associate can read template definitions
router.get('/', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateDefinitionController.getTemplateDefinitions(req, res);
}));

router.get('/name/:name', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateDefinitionController.getTemplateDefinitionByName(req, res);
}));

router.get('/:id', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateDefinitionController.getTemplateDefinitionById(req, res);
}));

router.get('/:id/with-content', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateDefinitionController.getTemplateDefinitionWithContent(req, res);
}));

router.get('/:id/content', optionalAuthenticate, asyncHandler(async (req, res) => {
  await templateDefinitionController.getTemplateContent(req, res);
}));

// Write access: Only Admin can create/update/delete template definitions
router.post('/', authenticate, checkReferenceDataPermission('create', 'templates'), asyncHandler(async (req, res) => {
  await templateDefinitionController.createTemplateDefinition(req, res);
}));

router.put('/:id', authenticate, checkReferenceDataPermission('update', 'templates'), asyncHandler(async (req, res) => {
  await templateDefinitionController.updateTemplateDefinition(req, res);
}));

router.delete('/:id', authenticate, checkReferenceDataPermission('delete', 'templates'), asyncHandler(async (req, res) => {
  await templateDefinitionController.deleteTemplateDefinition(req, res);
}));

// Content updates: Both Admin and Associate can update content (but structure changes require Admin)
router.put('/:id/content', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await templateDefinitionController.updateTemplateContentBatch(req, res);
}));

// Content upsert (create or update): Both Admin and Associate can upsert content
// IMPORTANT: This must come BEFORE /:id/content/:page/:section/:element to avoid route collision
router.put('/:id/content/upsert', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await templateDefinitionController.upsertTemplateContent(req, res);
}));

router.put('/:id/content/:page/:section/:element', authenticate, requireAssociateOrAdmin, asyncHandler(async (req, res) => {
  await templateDefinitionController.updateTemplateContent(req, res);
}));

router.put('/:id/content/:page/:section/:element/enabled', authenticate, checkReferenceDataPermission('update', 'templates'), asyncHandler(async (req, res) => {
  await templateDefinitionController.setTemplateContentEnabled(req, res);
}));

// Upload image for template
router.post('/:id/upload-image', authenticate, checkReferenceDataPermission('update', 'templates'), upload.single('image'), asyncHandler(async (req, res) => {
  await templateDefinitionController.uploadImage(req, res);
}));

export default router;
