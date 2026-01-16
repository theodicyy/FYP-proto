import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import lawyersRouter from './lawyers.js';
import dealsRouter from './deals.js';
import awardsRouter from './awards.js';
import capStatementsRouter from './capStatements.js';
import templatesRouter from './templates.js';

const router = express.Router();

// Public endpoints
router.use('/health', healthRouter);
router.use('/auth', authRouter);

// Protected endpoints (with RBAC)
router.use('/lawyers', lawyersRouter);
router.use('/deals', dealsRouter);
router.use('/awards', awardsRouter);
router.use('/cap-statements', capStatementsRouter);
router.use('/templates', templatesRouter);

export default router;
