import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { checkOrganizationAccess, requireActiveOrganization } from '../middlewares/organization.middleware';
import * as analyticsController from '../api/analytics/analytics.controller';
import { validateCompetitionReport, validateCompanyGrowth } from '../validations/analytics.validation';
import { validateCompanyComparison } from '../validations/analytics.validation';
const router = express.Router();

/**
 * GET /api/analytics/competition
 * Competition report between companies
 * Available to both personal and organization users (with different limits)
 */
router.get(
  '/competition',
  authenticate,
  checkOrganizationAccess,
  validateCompetitionReport,
  analyticsController.getCompetitionReport
);

/**
 * GET /api/analytics/company-growth
 * Growth report for a specific company
 * Available: Personal users (30 days data) + Organization users (without limit)
 */
router.get(
  '/company-growth',
  authenticate,
  checkOrganizationAccess,
  validateCompanyGrowth,
  analyticsController.getCompanyGrowth
);

/**
 * POST /api/analytics/compare-companies
 * Compare multiple companies
 * Available to both personal and organization users (with different limits)
 */
router.post(
  '/compare-companies',
  authenticate,
  checkOrganizationAccess,
  validateCompanyComparison,
  analyticsController.compareCompanies
);

// Organization-Only Analytics Routes - רק לארגונים

/**
 * GET /api/analytics/organization-summary
 * Summary of organization's job postings and analytics
 * Available to organization users with active license only
 */
router.get(
  '/organization-summary',
  authenticate,
  requireActiveOrganization,
  analyticsController.getOrganizationSummary
);

export default router;