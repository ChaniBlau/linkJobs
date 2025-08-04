import { LicensePlan, LicenseStatus } from '@prisma/client';
import { licenseRepository } from '../repositories/license.repository';

const SEATS_BY_PLAN: Record<LicensePlan, number> = {
  BASIC: 5,
  PROFESSIONAL: 25,
  ENTERPRISE: 100,
};

export const licenseService = {
  createLicense: async ({ organizationId, plan = LicensePlan.BASIC }: { organizationId: number; plan?: LicensePlan }) => {
    const existing = await licenseRepository.getByOrgId(organizationId);
    if (existing) throw new Error('License already exists for this organization');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    return licenseRepository.create({
      organizationId,
      plan,
      seatsAllocated: SEATS_BY_PLAN[plan],
      seatsUsed: 1,
      startDate,
      endDate,
      status: LicenseStatus.ACTIVE,
    });
  },

  getLicenseByOrgId: (organizationId: number) => licenseRepository.getByOrgId(organizationId),

  getLicenseById: (licenseId: number) => licenseRepository.getById(licenseId),

  updateLicense: async (licenseId: number, data: Partial<{
    plan: LicensePlan;
    seatsAllocated: number;
    seatsUsed: number;
    startDate: Date;
    endDate: Date;
    status: LicenseStatus;
  }>) => {
    const license = await licenseRepository.getById(licenseId);
    if (!license) throw new Error('License not found');
    if (data.seatsUsed !== undefined && data.seatsAllocated !== undefined && data.seatsUsed > data.seatsAllocated) {
      throw new Error('Used seats cannot exceed allocated seats');
    }
    return licenseRepository.updateById(licenseId, data);
  },

  incrementSeatsUsed: async (organizationId: number) => {
    const license = await licenseRepository.getByOrgId(organizationId);
    if (!license) throw new Error('License not found');
    const isExpired = new Date() > license.endDate;
    const hasAvailableSeats = license.seatsUsed < license.seatsAllocated;
    if (isExpired) throw new Error('License has expired');
    if (!hasAvailableSeats) throw new Error('No available seats');
    return licenseRepository.incrementSeatsUsedById(license.id);
  },

  resetSeatsUsed: (organizationId: number) => licenseRepository.resetSeatsUsed(organizationId),

  isLicenseExpired: async (organizationId: number): Promise<boolean> => {
    const license = await licenseRepository.getByOrgId(organizationId);
    if (!license) return true;
    return new Date() > license.endDate;
  },

  hasAvailableSeats: async (organizationId: number): Promise<boolean> => {
    const license = await licenseRepository.getByOrgId(organizationId);
    if (!license) return false;
    return license.seatsUsed < license.seatsAllocated;
  },

  canAddUserToOrg: async (organizationId: number): Promise<boolean> => {
    const license = await licenseRepository.getByOrgId(organizationId);
    if (!license) return false;
    const now = new Date();
    return now <= license.endDate && license.seatsUsed < license.seatsAllocated;
  },
};
