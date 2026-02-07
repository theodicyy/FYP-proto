import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import capStatementController from '../controllers/capStatementController.js'
import { authenticate } from '../middlewares/auth.js'
import {
  requireAssociateOrAdmin,
  canEditCapStatement
} from '../middlewares/rbac.js'
import { asyncHandler } from '../middlewares/errorHandler.js'

const router = express.Router()

/* =====================================================
   IMAGE UPLOAD CONFIG
===================================================== */

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'statements')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `statement-${req.params.id}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files allowed'), false)
  }
})

/* =====================================================
   GENERATE DOCX
===================================================== */

router.post(
  '/generate',
  authenticate,
  requireAssociateOrAdmin,
  asyncHandler(async (req, res) => {
    await capStatementController.generateStatement(req, res)
  })
)

/* =====================================================
   CRUD (LEGACY / OPTIONAL)
===================================================== */

router.post(
  '/',
  authenticate,
  requireAssociateOrAdmin,
  asyncHandler(async (req, res) => {
    await capStatementController.saveStatement(req, res)
  })
)

router.get(
  '/',
  authenticate,
  requireAssociateOrAdmin,
  asyncHandler(async (req, res) => {
    await capStatementController.getStatements(req, res)
  })
)

router.get(
  '/:id',
  authenticate,
  requireAssociateOrAdmin,
  asyncHandler(async (req, res) => {
    await capStatementController.getStatementById(req, res)
  })
)

router.put(
  '/:id',
  authenticate,
  requireAssociateOrAdmin,
  canEditCapStatement,
  asyncHandler(async (req, res) => {
    await capStatementController.updateStatement(req, res)
  })
)

router.delete(
  '/:id',
  authenticate,
  requireAssociateOrAdmin,
  canEditCapStatement,
  asyncHandler(async (req, res) => {
    await capStatementController.deleteStatement(req, res)
  })
)

/* =====================================================
   VERSIONING
===================================================== */

router.post(
  '/:id/versions',
  authenticate,
  requireAssociateOrAdmin,
  canEditCapStatement,
  asyncHandler(async (req, res) => {
    await capStatementController.createVersion(req, res)
  })
)

router.put(
  '/:id/versions/:versionId',
  authenticate,
  requireAssociateOrAdmin,
  canEditCapStatement,
  asyncHandler(async (req, res) => {
    await capStatementController.updateVersion(req, res)
  })
)

/* =====================================================
   IMAGE UPLOAD
===================================================== */

router.post(
  '/:id/upload-image',
  authenticate,
  requireAssociateOrAdmin,
  canEditCapStatement,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    await capStatementController.uploadImage(req, res)
  })
)

export default router
