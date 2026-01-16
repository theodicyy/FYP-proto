import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  logger.error('Error occurred', {
    error: err.message,
    stack: isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Only expose stack traces in development mode
  // Explicitly check NODE_ENV to prevent accidental exposure
  const shouldExposeStack = isDevelopment && process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(shouldExposeStack && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
