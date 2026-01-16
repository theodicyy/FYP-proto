import authService from '../services/authService.js';
import { logger } from '../utils/logger.js';

// Extract token from Authorization header only
// Query parameter support removed for security (tokens in URLs/logs)
function extractToken(req) {
  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

// Authentication middleware - verifies user is logged in
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const user = await authService.authenticateToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' }
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication failed' }
    });
  }
};

// Optional authentication - doesn't fail if no token, but attaches user if valid
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const user = await authService.authenticateToken(token);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Continue even if auth fails
    next();
  }
};
