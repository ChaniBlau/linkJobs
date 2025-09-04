import { body, query } from "express-validator";
/**
 * Validation middleware for competition report
 */
export const validateCompetitionReport = [
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid ISO date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid ISO date"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation middleware for company growth report
 */
export const validateCompanyGrowth = [
  query("company").notEmpty().trim().withMessage("Company name is required"),
  query("interval").optional().isIn(["day", "month"]).withMessage("Interval must be day or month"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid ISO date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid ISO date"),
];

/**
 * Validation middleware for company comparison
 */
export const validateCompanyComparison = [
  body("companies").isArray({ min: 1 }).withMessage("Companies array is required with at least one company"),
  body("companies.*").isString().trim().notEmpty().withMessage("Each company name must be a non-empty string"),
  body("startDate").optional().isISO8601().withMessage("Start date must be a valid ISO date"),
  body("endDate").optional().isISO8601().withMessage("End date must be a valid ISO date"),
];

/**
 * Helper function to parse dates safely
 */
export const parseDateParam = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};
