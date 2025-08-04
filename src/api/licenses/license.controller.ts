import { Request, Response } from 'express';
import { licenseService } from '../../services/license.service';
import { LicensePlan, LicenseStatus } from '@prisma/client';
import { BaseController } from '../base/base.controller';
import logger from '../../utils/logger';

export const createLicense = async (req: Request, res: Response) => {
  try {
    const { organizationId, plan } = req.body;

    if (!organizationId) {
      return res.status(400).json(BaseController.error('Organization ID is required'));
    }

    const license = await licenseService.createLicense({ organizationId, plan });
    return res.status(201).json(BaseController.success("License created successfully", license));
  } catch (error) {
    console.error('Error creating license:', error);
    return res.status(500).json(BaseController.error('Internal Server Error'));
  }
};

export const getLicenseByOrgId = async (req: Request, res: Response) => {
  try {
    const orgId = Number(req.params.orgId);
    const license = await licenseService.getLicenseByOrgId(orgId);

    if (!license) {
      return res.status(404).json(BaseController.error('License not found for this organization'));
    }

    return res.json(license);
  } catch (error) {
    logger.error('Error fetching license:', error);
    return res.status(500).json(BaseController.error('Internal Server Error'));
  }
};

export const updateLicense = async (req: Request, res: Response) => {
  try {
    const licenseId = Number(req.params.id);
    const updates = req.body;

    const updated = await licenseService.updateLicense(licenseId, updates);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating license:', error);
    return res.status(500).json(BaseController.error('Internal Server Error'));
  }
};

export const getLicenseUsageStatus = async (req: Request, res: Response) => {
  try {
    const orgId = Number(req.params.orgId);

    const isExpired = await licenseService.isLicenseExpired(orgId);
    const hasSeats = await licenseService.hasAvailableSeats(orgId);

    return res.json({
      isExpired,
      hasAvailableSeats: hasSeats,
    });
  } catch (error) {
    logger.error('Error checking license status:', error);
    return res.status(500).json(BaseController.error('Internal Server Error'));
  }
}
