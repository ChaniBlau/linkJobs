import * as orgRepo from '../repositories/organization.repository';
import { sendInviteEmail } from '../utils/emailHelper';
import { Role } from '@prisma/client';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors'
import logger from '../utils/logger';
import { publishInviteEmail } from '../queues/producers/email.producer';

const verifyOrgAdmin = async (orgId: number, userId: number) => {
  const user = await orgRepo.getUserById(userId);
  if (!user || user.organizationId !== orgId || user.role !== Role.ORG_ADMIN) {
    throw new ForbiddenError('User is not authorized');
  }
};

export const inviteUserToOrg = async (
  orgId: number,
  email: string,
  invitedById: number
) => {
  logger.info(`[OrgService] Invite requested: orgId=${orgId}, email=${email}, invitedBy=${invitedById}`);

  await verifyOrgAdmin(orgId, invitedById);

  const user = await orgRepo.getUserByEmail(email);

  if (!user) {
    await sendInviteEmail(email, orgId);
    logger.info(`📧[OrgService] Invitation sent to new user: ${email}`);
    return { message: 'Invitation email sent to new user' };
  }

  if (user.organizationId === orgId) {
    return { message: 'User is already in this organization' };
  }

  if (user.organizationId && user.organizationId !== orgId) {
    throw new ForbiddenError('User belongs to a different organization');
  }

  await orgRepo.assignUserToOrganization(user.id, orgId, Role.VIEWER);
  await publishInviteEmail(email, orgId);
  logger.info(`[OrgService] Existing user ${user.email} added to org ${orgId} and invited`);

  return { message: 'User added to organization and invitation email sent' };
};

export const updateUserRole = async (
  orgId: number,
  targetUserId: number,
  newRole: Role,
  requestedById: number
) => {
  logger.info(`[OrgService] Requested role update: orgId=${orgId}, targetUserId=${targetUserId}, newRole=${newRole}, byUser=${requestedById}`);

  if (!Object.values(Role).includes(newRole)) {
    throw new BadRequestError(`Invalid role: ${newRole}`);
  }

  if (targetUserId === requestedById) {
    throw new ForbiddenError('You cannot change your own role');
  }

  const requestingUser = await orgRepo.getUserById(requestedById);
  if (
    !requestingUser ||
    requestingUser.organizationId !== orgId ||
    requestingUser.role !== Role.ORG_ADMIN
  ) {
    throw new ForbiddenError('Only organization admins can change roles');
  }

  const targetUser = await orgRepo.getUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError('Target user not found');
  }

  if (targetUser.organizationId !== orgId) {
    throw new ForbiddenError('Target user does not belong to this organization');
  }

  if (targetUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError('Cannot change role of SUPER_ADMIN');
  }

  await orgRepo.updateUserRole(targetUserId, newRole);

  logger.info(`[OrgService] Role updated successfully for user ${targetUserId} to ${newRole}`);
};

export const removeUserFromOrganization = async (
  orgId: number,
  targetUserId: number,
  requestedById: number
) => {
  logger.info(`[OrgService] Remove user: orgId=${orgId}, targetUserId=${targetUserId}, byUser=${requestedById}`);

  if (targetUserId === requestedById) {
    throw new ForbiddenError('You cannot remove yourself from the organization');
  }

  const requestingUser = await orgRepo.getUserById(requestedById);
  if (
    !requestingUser ||
    requestingUser.organizationId !== orgId ||
    requestingUser.role !== Role.ORG_ADMIN
  ) {
    throw new ForbiddenError('Only organization admins can remove users');
  }

  const targetUser = await orgRepo.getUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError('User to remove not found');
  }

  if (targetUser.organizationId !== orgId) {
    throw new ForbiddenError('User does not belong to this organization');
  }

  if (targetUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError('Cannot remove SUPER_ADMIN from organization');
  }

  await orgRepo.removeUserFromOrganization(targetUserId);

  logger.info(`[OrgService] User ${targetUserId} removed from organization ${orgId}`);
};
