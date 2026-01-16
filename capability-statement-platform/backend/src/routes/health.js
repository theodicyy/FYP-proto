import express from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'capability-statement-api'
  });
}));

export default router;
