import { Response, NextFunction } from 'express';
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { BaseController } from "../api/base/base.controller";
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

/**
 * Middleware that checks if the user belongs to an organization
 * If yes, attaches organization info to request
 * If no, continues without blocking (for routes that allow both personal and org users)
 */
export const checkOrganizationAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(BaseController.error("User not authenticated"));
    }

    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Organization: {
          include: {
            licenses: true
          }
        }
      }
    });

    if (userWithOrg?.Organization) {
      const activeLicense = userWithOrg.Organization.licenses?.find(l => l.status === 'ACTIVE');
      
      if (activeLicense) {
        req.organization = userWithOrg.Organization;
        req.hasActiveLicense = true;
      } else {
        req.hasActiveLicense = false;
      }
    } else {
      req.organization = undefined;
      req.hasActiveLicense = false;
    }

    logger.info("Organization access check completed", {
      userId,
      hasOrganization: !!req.organization,
      hasActiveLicense: req.hasActiveLicense
    });

    next();
  } catch (error) {
    logger.error("Error in organization middleware", { error, userId: req.user?.id });
    return res.status(500).json(BaseController.error("Authorization check failed"));
  }
};

/**
 * Middleware that requires the user to belong to an organization with an active license
 * Used for features that require organization membership
 */
export const requireActiveOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(BaseController.error("User not authenticated"));
    }

    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Organization: {
          include: {
            licenses: true
          }
        }
      }
    });

    if (!userWithOrg?.Organization) {
      return res.status(403).json(
        BaseController.error("This feature requires an organization membership. Please create or join an organization.")
      );
    }

    const activeLicense = userWithOrg.Organization.licenses?.find(l => l.status === 'ACTIVE');
    if (!activeLicense) {
      return res.status(403).json(
        BaseController.error("Organization has no active license. Please renew your license to use this feature.")
      );
    }

    req.organization = userWithOrg.Organization;
    req.hasActiveLicense = true;

    logger.info("Organization requirement check passed", {
      userId,
      organizationId: req.organization.id
    });

    next();
  } catch (error) {
    logger.error("Error in organization requirement middleware", { error, userId: req.user?.id });
    return res.status(500).json(BaseController.error("Authorization check failed"));
  }
};

/**
 * Middleware for ORG_ADMIN Or SUPER_ADMIN users with active license
 * Used for organization management features
 */
export const requireOrgAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json(BaseController.error("User not authenticated"));
    }

    if (userRole === 'SUPER_ADMIN') {
      logger.info("Super admin access granted", { userId });
      return next();
    }

    const userWithOrg = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Organization: {
          include: {
            licenses: true
          }
        }
      }
    });

    if (!userWithOrg?.Organization) {
      return res.status(403).json(
        BaseController.error("Organization admin access required")
      );
    }

    if (userRole !== 'ORG_ADMIN') {
      return res.status(403).json(
        BaseController.error("Organization admin privileges required")
      );
    }

    const activeLicense = userWithOrg.Organization.licenses?.find(l => l.status === 'ACTIVE');
    if (!activeLicense) {
      return res.status(403).json(
        BaseController.error("Organization license is not active")
      );
    }

    req.organization = userWithOrg.Organization;
    req.hasActiveLicense = true;

    logger.info("Organization admin access granted", {
      userId,
      organizationId: req.organization.id,
      userRole
    });

    next();
  } catch (error) {
    logger.error("Error in organization admin middleware", { error, userId: req.user?.id });
    return res.status(500).json(BaseController.error("Authorization check failed"));
  }
};

/**
 * Middleware for SUPER_ADMIN only
 * Used for critical admin operations
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (userRole !== 'SUPER_ADMIN') {
    logger.warn("Super admin access denied", { 
      userId: req.user?.id, 
      userRole,
      endpoint: req.path 
    });
    
    return res.status(403).json(
      BaseController.error("Super admin privileges required")
    );
  }

  logger.info("Super admin access granted", { userId: req.user?.id });
  next();
};