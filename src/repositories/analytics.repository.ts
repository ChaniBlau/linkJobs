import prisma from "../config/prisma";
import logger from "../utils/logger";
import redis from "../config/redis";

export interface CompanyJobCount {
  company: string;
  jobCount: number;
}

export interface CompanyGrowthData {
  period: string;
  total: number;
}

/**
 * Cache keys generator
 */
class CacheKeys {
  static jobCountByCompany(startDate?: Date, endDate?: Date): string {
    return `jobs:count:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;
  }

  static companyGrowth(company: string, interval: string, startDate?: Date, endDate?: Date): string {
    return `growth:${company.toLowerCase()}:${interval}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`;
  }
}

/**
 * Returns job counts grouped by company with optional date filtering and caching
 */
export const getJobCountByCompany = async (
  startDate?: Date,
  endDate?: Date,
): Promise<CompanyJobCount[]> => {
  const cacheKey = CacheKeys.jobCountByCompany(startDate, endDate);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("Cache hit for job count by company", { cacheKey });
      return JSON.parse(cached);
    }

    logger.info("Cache miss - fetching job count from database", { startDate, endDate });

    const whereClause: any = {
      isArchived: false,
    };

    if (startDate || endDate) {
      whereClause.postingDate = {};
      if (startDate) whereClause.postingDate.gte = startDate;
      if (endDate) whereClause.postingDate.lte = endDate;
    }

    const result = await prisma.jobPosting.groupBy({
      by: ["company"],
      _count: { id: true },
      where: whereClause,
      orderBy: {
        _count: { id: "desc" },
      },
    });

    const formatted: CompanyJobCount[] = result.map(item => ({
      company: item.company,
      jobCount: item._count.id
    }));

    const ttl = parseInt(process.env.CACHE_ANALYTICS_TTL || '300', 10);
    await redis.set(cacheKey, JSON.stringify(formatted), { EX: ttl });

    logger.info("Successfully fetched and cached job count", {
      resultCount: formatted.length,
      cacheKey
    });

    return formatted;

  } catch (error) {
    logger.error("Error fetching job count by company", { error, startDate, endDate });
    throw new Error("Failed to fetch company job statistics");
  }
};

/**
 * Returns growth data for a specific company over time with caching
 */
export const getCompanyGrowth = async (
  company: string,
  interval: "day" | "month" = "month",
  startDate?: Date,
  endDate?: Date
): Promise<CompanyGrowthData[]> => {
  const cacheKey = CacheKeys.companyGrowth(company, interval, startDate, endDate);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("Cache hit for company growth", { company, interval });
      return JSON.parse(cached);
    }

    const whereClause: any = {
      isArchived: false,
      company: {
        contains: company.trim(),
        mode: 'insensitive',
      }
    };

    if (startDate || endDate) {
      whereClause.postingDate = {};
      if (startDate) whereClause.postingDate.gte = startDate;
      if (endDate) whereClause.postingDate.lte = endDate;
    }

    const jobs = await prisma.jobPosting.findMany({
      where: whereClause,
      select: { postingDate: true },
      orderBy: { postingDate: 'asc' }
    });

    const groupedData = new Map<string, number>();
    jobs.forEach(job => {
      const date = new Date(job.postingDate);
      const periodKey = interval === 'day'
        ? date.toISOString().split('T')[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      groupedData.set(periodKey, (groupedData.get(periodKey) || 0) + 1);
    });

    const result: CompanyGrowthData[] = Array.from(groupedData.entries())
      .map(([period, total]) => ({ period, total }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const ttl = parseInt(process.env.CACHE_ANALYTICS_TTL || '600', 10);
    await redis.set(cacheKey, JSON.stringify(result), { EX: ttl });

    logger.info("Company growth data fetched successfully", {
      company: company.trim(),
      interval,
      periodsFound: result.length,
      totalJobs: jobs.length
    });

    return result;

  } catch (error) {
    logger.error("Error fetching company growth data", { 
      error: error instanceof Error ? error.message : error,
      company, 
      interval 
    });
    throw new Error(`Failed to fetch growth data for company: ${company}`);
  }
};

/**
 * Returns top companies by job count with optional date filtering
 */
export const getTopCompanies = async (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<CompanyJobCount[]> => {
  try {
    const companies = await getJobCountByCompany(startDate, endDate);
    return companies.slice(0, limit);
  } catch (error) {
    logger.error("Error fetching top companies", { error, limit, startDate, endDate });
    throw new Error("Failed to fetch top companies");
  }
};

/**
 * Serves to clear analytics related cache
 */
export const clearAnalyticsCache = async (): Promise<void> => {
  try {
    const jobsKeysCount = (await redis.deleteByPattern('jobs:count:*')) ?? 0;
    const growthKeysCount = (await redis.deleteByPattern('growth:*')) ?? 0;

    const totalCleared = (Number(jobsKeysCount) || 0) + (Number(growthKeysCount) || 0);
    logger.info("Analytics cache cleared", { clearedKeys: totalCleared });
  } catch (error) {
    logger.error("Error clearing analytics cache", { error });
  }
};
