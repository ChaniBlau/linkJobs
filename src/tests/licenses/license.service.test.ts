import { licenseService } from '../../services/license.service';
import { licenseRepository } from '../../repositories/license.repository';
import { LicensePlan, LicenseStatus } from '@prisma/client';

jest.mock('../../repositories/license.repository');

describe('licenseService', () => {
  const orgId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLicense', () => {
    it('should create a new license if none exists', async () => {
      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue(null);
      (licenseRepository.create as jest.Mock).mockResolvedValue({ id: 1 });

      const license = await licenseService.createLicense({
        organizationId: orgId,
        plan: LicensePlan.BASIC,
      });

      expect(licenseRepository.getByOrgId).toHaveBeenCalledWith(orgId);
      expect(licenseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: orgId,
          plan: LicensePlan.BASIC,
          seatsAllocated: 5,
          seatsUsed: 1,
          status: LicenseStatus.ACTIVE,
        })
      );
      expect(license).toEqual({ id: 1 });
    });

    it('should throw if license already exists', async () => {
      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(
        licenseService.createLicense({ organizationId: orgId })
      ).rejects.toThrow('License already exists');
    });
  });

  describe('isLicenseExpired', () => {
    it('should return false if license is active', async () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);

      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue({
        endDate: future,
      });

      const result = await licenseService.isLicenseExpired(orgId);
      expect(result).toBe(false);
    });

    it('should return true if license is expired', async () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);

      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue({
        endDate: past,
      });

      const result = await licenseService.isLicenseExpired(orgId);
      expect(result).toBe(true);
    });
  });

  describe('hasAvailableSeats', () => {
    it('should return true if seats are available', async () => {
      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue({
        seatsUsed: 3,
        seatsAllocated: 5,
      });

      const result = await licenseService.hasAvailableSeats(orgId);
      expect(result).toBe(true);
    });

    it('should return false if no seats are available', async () => {
      (licenseRepository.getByOrgId as jest.Mock).mockResolvedValue({
        seatsUsed: 5,
        seatsAllocated: 5,
      });

      const result = await licenseService.hasAvailableSeats(orgId);
      expect(result).toBe(false);
    });
  });
});
