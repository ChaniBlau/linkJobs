import { 
  CompanyJobCount, 
  CompanyGrowthData, 
  getJobCountByCompany, 
  getCompanyGrowth,
  getTopCompanies 
} from "../repositories/analytics.repository";
import logger from "../utils/logger";

export interface BaseAnalyticsReport {
  dateRange: {
    startDate?: Date;
    endDate?: Date;
  };
  generatedAt: Date;
  isPersonalUser: boolean;
  isLimited?: boolean;
  isSuperAdmin?: boolean;
}

export interface CompetitionReport extends BaseAnalyticsReport {
  totalCompanies: number;
  totalJobs: number;
  topCompanies: CompanyJobCount[];
}

export interface GrowthReport extends BaseAnalyticsReport {
  company: string;
  growthData: CompanyGrowthData[];
  totalJobsInPeriod: number;
  averageJobsPerPeriod: number;
  interval: string;
}

export interface CompanyComparison extends BaseAnalyticsReport {
  comparison: CompanyJobCount[];
  requestedCompanies: string[];
  foundCompanies: string[];
  notFound: string[];
}

/**
 * User limits configuration
 */
const USER_LIMITS = {
  PERSONAL: {
    maxResults: 10,
    maxCompanies: 3,
    maxDaysBack: 30
  },
  ORGANIZATION: {
    maxResults: 100,
    maxCompanies: 50,
    maxDaysBack: 365
  }
} as const;

type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "RECRUITER" | "VIEWER";

/**
 * Helper: Determine user type and applicable limits
 */
const getUserContext = (userId?: number, organizationId?: number, role?: UserRole) => {
  // SUPER_ADMIN → אין מגבלות בכלל
  if (role === "SUPER_ADMIN") {
    return { isPersonalUser: false, isSuperAdmin: true, limits: USER_LIMITS.ORGANIZATION };
  }

  const isPersonalUser = !!userId && !organizationId;
  const limits = isPersonalUser ? USER_LIMITS.PERSONAL : USER_LIMITS.ORGANIZATION;

  return { isPersonalUser, isSuperAdmin: false, limits };
};

/**
 * Helper: check date range validity
 */
const validateDateRange = (startDate?: Date, endDate?: Date): void => {
  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start date cannot be after end date");
  }
};

/**
 * Helper: Limit date range for personal users (default to last 30 days if not specified)
 */
const limitDateRangeForPersonalUser = (startDate?: Date, maxDaysBack: number = 30): Date => {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - maxDaysBack);
  
  return startDate && startDate > limitDate ? startDate : limitDate;
};

/**
 * Get competition report 
 */
export const getCompetitionReport = async (
  startDate?: Date, 
  endDate?: Date, 
  limit: number = 20,
  userId?: number,
  organizationId?: number,
  role?: UserRole
): Promise<CompetitionReport> => {
  try {
    validateDateRange(startDate, endDate);
    
    const { isPersonalUser, isSuperAdmin, limits } = getUserContext(userId, organizationId, role);

    const effectiveLimit = isSuperAdmin 
      ? limit 
      : Math.min(limit, limits.maxResults);

    const effectiveStartDate = isSuperAdmin
      ? startDate
      : isPersonalUser 
        ? limitDateRangeForPersonalUser(startDate, limits.maxDaysBack)
        : startDate;

    logger.info("Generating competition report", { 
      startDate: effectiveStartDate, 
      endDate, 
      limit: effectiveLimit,
      isPersonalUser,
      isSuperAdmin,
      userId, 
      organizationId,
      role
    });

    const companies = await getJobCountByCompany(effectiveStartDate, endDate);
    
    const totalCompanies = companies.length;
    const totalJobs = companies.reduce((sum, company) => sum + company.jobCount, 0);
    const topCompanies = companies.slice(0, effectiveLimit);

    return {
      totalCompanies,
      totalJobs,
      topCompanies,
      dateRange: { startDate: effectiveStartDate, endDate },
      generatedAt: new Date(),
      isPersonalUser,
      isSuperAdmin,
      isLimited: !isSuperAdmin && limit > effectiveLimit
    };

  } catch (error) {
    logger.error("Error generating competition report", { error, startDate, endDate, userId, role });
    throw error instanceof Error ? error : new Error("Failed to generate competition report");
  }
};

/**
 * Get company growth trend report
 */
export const getCompanyGrowthTrend = async (
  company: string, 
  interval: "day" | "month" = "month",
  startDate?: Date,
  endDate?: Date,
  userId?: number,
  organizationId?: number,
  role?: UserRole
): Promise<GrowthReport> => {
  try {
    if (!company?.trim()) {
      throw new Error("Company name is required");
    }

    validateDateRange(startDate, endDate);
    
    const { isPersonalUser, isSuperAdmin, limits } = getUserContext(userId, organizationId, role);
    
    const effectiveStartDate = isSuperAdmin
      ? startDate
      : isPersonalUser 
        ? limitDateRangeForPersonalUser(startDate, limits.maxDaysBack)
        : startDate;

    logger.info("Generating company growth report", { 
      company, 
      interval, 
      startDate: effectiveStartDate, 
      endDate,
      isPersonalUser,
      isSuperAdmin
    });

    const growthData = await getCompanyGrowth(
      company.trim(), 
      interval, 
      effectiveStartDate, 
      endDate
    );

    const totalJobsInPeriod = growthData.reduce((sum, period) => sum + period.total, 0);
    const averageJobsPerPeriod = growthData.length > 0 
      ? Math.round((totalJobsInPeriod / growthData.length) * 100) / 100 
      : 0;

    return {
      company: company.trim(),
      growthData,
      totalJobsInPeriod,
      averageJobsPerPeriod,
      interval,
      dateRange: { startDate: effectiveStartDate, endDate },
      generatedAt: new Date(),  
      isPersonalUser,
      isSuperAdmin,
      isLimited: !isSuperAdmin && startDate !== effectiveStartDate
    };

  } catch (error) {
    logger.error("Error generating company growth report", { error, company, role });
    throw error instanceof Error ? error : new Error("Failed to generate company growth report");
  }
};

/**
 * compareCompanies according to the number of job postings
 */
export const compareCompanies = async (
  companies: string[], 
  startDate?: Date, 
  endDate?: Date,
  userId?: number,
  organizationId?: number,
  role?: UserRole
): Promise<CompanyComparison> => {
  try {
    if (!companies?.length) {
      throw new Error("At least one company is required for comparison");
    }

    validateDateRange(startDate, endDate);
    
    const { isPersonalUser, isSuperAdmin, limits } = getUserContext(userId, organizationId, role);
    
    const maxCompanies = isSuperAdmin
      ? companies.length
      : Math.min(companies.length, limits.maxCompanies);

    const limitedCompanies = companies.slice(0, maxCompanies);

    const effectiveStartDate = isSuperAdmin
      ? startDate
      : isPersonalUser 
        ? limitDateRangeForPersonalUser(startDate, limits.maxDaysBack)
        : startDate;

    logger.info("Comparing companies", { 
      requestedCompanies: companies.length,
      limitedCompanies: limitedCompanies.length,
      startDate: effectiveStartDate, 
      endDate,
      isPersonalUser,
      isSuperAdmin
    });

    const allCompaniesData = await getJobCountByCompany(effectiveStartDate, endDate);

    const comparison: CompanyJobCount[] = [];
    const foundCompanies: string[] = [];
    const notFound: string[] = [];

    limitedCompanies.forEach(requestedCompany => {
      const found = allCompaniesData.find(companyData =>
        companyData.company.toLowerCase().includes(requestedCompany.toLowerCase().trim())
      );

      if (found) {
        comparison.push(found);
        foundCompanies.push(found.company);
      } else {
        notFound.push(requestedCompany);
      }
    });

    return {
      comparison: comparison.sort((a, b) => b.jobCount - a.jobCount), 
      requestedCompanies: companies,
      foundCompanies,
      notFound,
      dateRange: { startDate: effectiveStartDate, endDate },
      generatedAt: new Date(),
      isPersonalUser,
      isSuperAdmin,
      isLimited: !isSuperAdmin && companies.length > maxCompanies
    };

  } catch (error) {
    logger.error("Error comparing companies", { error, companies, role });
    throw error instanceof Error ? error : new Error("Failed to compare companies");
  }
};

/**
 * Get basic stats for regular users
 */
export const getBasicStats = async (
  userId: number
): Promise<{
  totalJobs: number;
  totalCompanies: number;
  lastWeekJobs: number;
  generatedAt: Date;
}> => {
  try {
    logger.info("Generating basic stats for user", { userId });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [allTimeData, lastWeekData] = await Promise.all([
      getJobCountByCompany(),
      getJobCountByCompany(lastWeek)
    ]);

    const totalJobs = allTimeData.reduce((sum, company) => sum + company.jobCount, 0);
    const totalCompanies = allTimeData.length;
    const lastWeekJobs = lastWeekData.reduce((sum, company) => sum + company.jobCount, 0);

    return {
      totalJobs,
      totalCompanies,
      lastWeekJobs,
      generatedAt: new Date()
    };

  } catch (error) {
    logger.error("Error generating basic stats", { error, userId });
    throw new Error("Failed to generate basic statistics");
  }
};
