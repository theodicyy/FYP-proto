import { logger } from '../utils/logger.js';
import { UserRoles } from '../models/User.js';

// RBAC Permission Checks
// These middleware functions enforce role-based access control

// Require Admin role (Type 1)
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
  }

  if (!req.user.isAdmin()) {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user.id,
      role: req.user.roleType,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required' }
    });
  }

  next();
};

// Require Associate role (Type 2) or Admin
export const requireAssociateOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
  }

  if (!req.user.isAdmin() && !req.user.isAssociate()) {
    logger.warn('Unauthorized access attempt', {
      userId: req.user.id,
      role: req.user.roleType,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied' }
    });
  }

  next();
};

// Check if user can edit a specific cap statement
export const canEditCapStatement = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
  }

  const statementId = parseInt(req.params.id, 10);

  try {
    // Import here to avoid circular dependency
    const capStatementService = (await import('../services/capStatementService.js')).default;
    const statement = await capStatementService.getStatementById(statementId);

    if (!statement) {
      return res.status(404).json({
        success: false,
        error: { message: 'Capability statement not found' }
      });
    }

    // Admin can edit any, Associate can only edit their own
    if (req.user.isAdmin() || statement.created_by_user_id === req.user.id) {
      req.statement = statement; // Attach for use in controller
      next();
    } else {
      logger.warn('Unauthorized cap statement edit attempt', {
        userId: req.user.id,
        statementId,
        statementOwner: statement.created_by_user_id
      });
      return res.status(403).json({
        success: false,
        error: { message: 'You can only edit your own capability statements' }
      });
    }
  } catch (error) {
    logger.error('Error checking cap statement edit permission', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking permissions' }
    });
  }
};

// Permission check helper for reference data
export const checkReferenceDataPermission = (action, resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    // Only Admin can modify reference data
    if (action !== 'read' && !req.user.isAdmin()) {
      logger.warn('Unauthorized reference data access', {
        userId: req.user.id,
        role: req.user.roleType,
        action,
        resource,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        error: { message: `Only admins can ${action} ${resource}` }
      });
    }

    next();
  };
};
