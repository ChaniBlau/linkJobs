import { Response } from "express";
import * as analyticsService from "../../services/analytics.service"; 
import logger from "../../utils/logger";
import { BaseController } from "../base/base.controller";
import { validationResult } from "express-validator";
import { parseDateParam } from "../../validations/analytics.validation";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";

/**
 * Helper: Check validation results and respond with errors if any
 */
const checkValidation = (req: AuthenticatedRequest, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(BaseController.error("Invalid parameters", { errors: errors.array() }));
    return false;
  }
  return true;
};

/**
 * Helper: Get user info from request
 */
const getUserInfo = (req: AuthenticatedRequest) => ({
  userId: req.user?.id,
  organizationId: req.organization?.id,
  role: req.user?.role,
});

/**
 * Helper: Handling errors and logging
 */
const handleError = (
  error: unknown, 
  operation: string, 
  req: AuthenticatedRequest, 
  res: Response
) => {
  logger.error(`Error in ${operation}`, {
    error: error instanceof Error ? error.message : error,
    userId: req.user?.id,
    organizationId: req.organization?.id,
    role: req.user?.role
  });

  const statusCode = error instanceof Error && 
    (error.message.includes("required") || error.message.includes("date")) ? 400 : 500;
  
  const message = error instanceof Error ? error.message : `${operation} failed`;
  
  return res.status(statusCode).json(BaseController.error(message));
};

/**
 * GET /api/analytics/competition
 * Get competition report
 */
export const getCompetitionReport = async (req: AuthenticatedRequest, res: Response) => {
  if (!checkValidation(req, res)) return;

  try {
    const { startDate, endDate, limit } = req.query;
    const { userId, organizationId, role } = getUserInfo(req);

    const data = await analyticsService.getCompetitionReport(
      parseDateParam(startDate as string),
      parseDateParam(endDate as string),
      limit ? parseInt(limit as string, 10) : 20,
      userId,
      organizationId,
      role
    );

    logger.info("Competition report generated", {
      totalCompanies: data.totalCompanies,
      totalJobs: data.totalJobs,
      isPersonalUser: data.isPersonalUser,
      isSuperAdmin: data.isSuperAdmin,
      isLimited: data.isLimited
    });

    return res.json(BaseController.success("Competition report generated successfully", data));

  } catch (error) {
    return handleError(error, "competition report generation", req, res);
  }
};

/**
 * GET /api/analytics/company-growth
 * Get company growth over time
 */
export const getCompanyGrowth = async (req: AuthenticatedRequest, res: Response) => {
  if (!checkValidation(req, res)) return;

  try {
    const { company, interval, startDate, endDate } = req.query;
    const { userId, organizationId, role } = getUserInfo(req);

    if (!company?.toString().trim()) {
      return res.status(400).json(BaseController.error("Company name is required"));
    }

    const data = await analyticsService.getCompanyGrowthTrend(
      company as string,
      (interval as "day" | "month") || "month",
      parseDateParam(startDate as string),
      parseDateParam(endDate as string),
      userId,
      organizationId,
      role
    );

    logger.info("Company growth report generated", {
      company,
      totalJobsInPeriod: data.totalJobsInPeriod,
      periodsCount: data.growthData.length,
      isSuperAdmin: data.isSuperAdmin,
      isLimited: data.isLimited
    });

    return res.json(BaseController.success("Company growth report generated successfully", data));

  } catch (error) {
    return handleError(error, "company growth report generation", req, res);
  }
};

/**
 * POST /api/analytics/compare-companies
 * Compare multiple companies
 */
export const compareCompanies = async (req: AuthenticatedRequest, res: Response) => {
  if (!checkValidation(req, res)) return;

  try {
    const { companies, startDate, endDate } = req.body;
    const { userId, organizationId, role } = getUserInfo(req);

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json(BaseController.error("At least one company is required"));
    }

    const data = await analyticsService.compareCompanies(
      companies,
      parseDateParam(startDate),
      parseDateParam(endDate),
      userId,
      organizationId,
      role
    );

    logger.info("Company comparison completed", {
      requestedCompanies: data.requestedCompanies.length,
      foundCompanies: data.foundCompanies.length,
      notFound: data.notFound.length,
      isSuperAdmin: data.isSuperAdmin,
      isLimited: data.isLimited
    });

    return res.json(BaseController.success("Company comparison completed successfully", data));

  } catch (error) {
    return handleError(error, "company comparison", req, res);
  }
};

/**
 * GET /api/analytics/basic-stats
 * Basic statistics for personal users
 */
export const getBasicStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = getUserInfo(req);

    if (!userId) {
      return res.status(401).json(BaseController.error("User authentication required"));
    }

    const data = await analyticsService.getBasicStats(userId);

    logger.info("Basic stats generated", {
      userId,
      totalJobs: data.totalJobs,
      totalCompanies: data.totalCompanies
    });

    return res.json(BaseController.success("Basic statistics generated successfully", data));

  } catch (error) {
    return handleError(error, "basic stats generation", req, res);
  }
};

/**
 * GET /api/analytics/organization-summary
 */
export const getOrganizationSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId } = getUserInfo(req);
    
    if (!organizationId) {
      return res.status(403).json(
        BaseController.error("This feature requires organization membership")
      );
    }

    return res.json(BaseController.success("Organization summary - Coming Soon", {
      message: "Advanced organization analytics will be available soon",
      organizationId
    }));

  } catch (error) {
    return handleError(error, "organization summary generation", req, res);
  }
};
