import { Request, Response } from 'express';
import * as organizationService from '../../services/organization.service';
import logger from '../../utils/logger';
import { BaseController } from '../base/base.controller';
import { error } from 'console';

export const inviteUserByEmail = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { email } = req.body;
  const invitedBy = req.user?.id;

  if (!email || typeof email !== 'string') {
    return res.status(400).json(BaseController.error("Valid email is required", error));
  }

  try {
    const result = await organizationService.inviteUserToOrg(
      Number(orgId),
      email,
      invitedBy
    );

    logger.info(`[OrgController] Invitation sent to ${email} by user ${invitedBy}`);
    res.status(200).json(BaseController.success(result.message, { email }));
  } catch (error) {
    logger.error('[OrgController] Invite User Error:', error);
    res.status(500).json(BaseController.error(error.message || 'Internal server error'));
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { orgId, userId } = req.params;
  const { newRole } = req.body;
  const currentUserId = req.user?.id;

  try {
    if (!newRole) {
      return res.status(400).json(BaseController.error("New role is required"));
    }

    await organizationService.updateUserRole(
      Number(orgId),
      Number(userId),
      newRole,
      currentUserId
    );

    res.status(200).json(BaseController.success("User role updated successfully", { userId, newRole }));
  } catch (error) {
    logger.error('Update user role failed', error);
    const status = (error as any).statusCode || 500;
    res.status(status).json(BaseController.error(error.message || 'Internal server error'));
  }
};

export const removeUserFromOrg = async (req: Request, res: Response) => {
  const { orgId, userId } = req.params;
  const currentUserId = req.user?.id;

  if (isNaN(orgId) || isNaN(userId)) {
    return res.status(400).json(BaseController.error("Invalid organization or user ID"));
  }
  try {
    if (!currentUserId) {
      return res.status(401).json(BaseController.error("Unauthorized"));
    }

    await organizationService.removeUserFromOrganization(
      Number(orgId),
      Number(userId),
      currentUserId
    );

    res.status(200).json(BaseController.success("User removed from organization successfully", { userId }));
  } catch (error) {
    logger.error('❌ Remove User Error:', error);
    const status = (error as any).statusCode || 500;
    res.status(status).json(BaseController.error(error.message || 'Internal server error'));
  }
};
export const getOrgUsers = async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const currentUserId = req.user?.id;
  try {
    //const users = await organizationService.getUsersInOrganization(Number(orgId), currentUserId);
    // res.status(200).json({ users });
  } catch (error) {
    logger.error('Get Org Users Error:', error);
    res.status(500).json(BaseController.error("Internal server error", error.message))
  }
};
