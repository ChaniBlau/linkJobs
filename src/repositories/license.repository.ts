import prisma from '../config/prisma';
import { LicensePlan, LicenseStatus } from '@prisma/client';

export const licenseRepository = {
  create: async (data: {
    organizationId: number;
    plan: LicensePlan;
    seatsAllocated: number;
    seatsUsed: number;
    startDate: Date;
    endDate: Date;
    status?: LicenseStatus;
  }) => {
    return prisma.license.create({ data });
  },

  getByOrgId: async (organizationId: number) => {
    return prisma.license.findFirst({ where: { organizationId } });
  },

  getById: async (id: number) => {
    return prisma.license.findUnique({ where: { id } });
  },

  updateById: async (
    id: number,
    data: Partial<{
      plan: LicensePlan;
      seatsAllocated: number;
      seatsUsed: number;
      startDate: Date;
      endDate: Date;
      status: LicenseStatus;
    }>
  ) => {
    return prisma.license.update({ where: { id }, data });
  },

  incrementSeatsUsedById: async (licenseId: number) => {
    return prisma.license.update({
      where: { id: licenseId },
      data: { seatsUsed: { increment: 1 } },
    });
  },

  resetSeatsUsed: async (organizationId: number) => {
    return prisma.license.updateMany({ where: { organizationId }, data: { seatsUsed: 0 } });
  },

  getAll: async () => {
    return prisma.license.findMany();
  },
};