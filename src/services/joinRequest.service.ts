import * as orgRepo from '../repositories/organization.repository';
import * as joinRequestRepo from '../repositories/joinRequest.repository'
import logger from '../utils/logger';
import { sendInviteEmail } from '../utils/emailHelper';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors'
import { JoinRequestStatus, Role } from '@prisma/client';

export const submitJoinRequest = async (
  userId: number,
  organizationId: number,
  requestMessage?: string
) => {
  logger.info(`[JoinRequestService] Join request submitted: userId=${userId}, orgId=${organizationId}`);

  const organization = await orgRepo.getOrganizationById(organizationId);
  if (!organization) {
    throw new NotFoundError('Organization not found');
  }

  const user = await orgRepo.getUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.organizationId === organizationId) {
    throw new BadRequestError('User is already a member of this organization');
  }

  if (user.organizationId && user.organizationId !== organizationId) {
    throw new BadRequestError('User already belongs to another organization');
  }

  const existingRequest = await joinRequestRepo.findExistingRequest(userId, organizationId);
  if (existingRequest) {
    if (existingRequest.status === JoinRequestStatus.PENDING) {
      throw new BadRequestError('You already have a pending request for this organization');
    }
    if (existingRequest.status === JoinRequestStatus.APPROVED) {
      throw new BadRequestError('Your request was already approved');
    }
  }

  const joinRequest = await joinRequestRepo.createJoinRequest(
    userId,
    organizationId,
    requestMessage
  );

  logger.info(`[JoinRequestService] Join request created successfully: requestId=${joinRequest.id}`);
  
  return {
    requestId: joinRequest.id,
    organizationName: organization.name,
    status: joinRequest.status,
    message: 'Join request submitted successfully'
  };
};

export const getPendingRequests = async (organizationId: number, requestedById: number) => {
  logger.info(`[JoinRequestService] Get pending requests: orgId=${organizationId}, byUser=${requestedById}`);

  const requestingUser = await orgRepo.getUserById(requestedById);
  if (
    !requestingUser ||
    requestingUser.organizationId !== organizationId ||
    requestingUser.role !== Role.ORG_ADMIN
  ) {
    throw new ForbiddenError('Only organization admins can view join requests');
  }

  const pendingRequests = await joinRequestRepo.getPendingJoinRequests(organizationId);

  logger.info(`[JoinRequestService] Retrieved ${pendingRequests.length} pending requests`);

  return {
    organizationId,
    pendingRequests: pendingRequests.map(request => ({
      id: request.id,
      user: request.user,
      createdAt: request.createdAt
    })),
    totalPending: pendingRequests.length
  };
};

export const respondToJoinRequest = async (
  organizationId: number,
  requestId: number,
  decision: 'APPROVED' | 'REJECTED',
  requestedById: number,
  adminResponse?: string
) => {
  logger.info(`[JoinRequestService] Respond to request: requestId=${requestId}, decision=${decision}, byUser=${requestedById}`);

  const requestingUser = await orgRepo.getUserById(requestedById);
  if (
    !requestingUser ||
    requestingUser.organizationId !== organizationId ||
    requestingUser.role !== Role.ORG_ADMIN
  ) {
    throw new ForbiddenError('Only organization admins can respond to join requests');
  }

  const joinRequest = await joinRequestRepo.getJoinRequestById(requestId);
  if (!joinRequest) {
    throw new NotFoundError('Join request not found');
  }

  if (joinRequest.organizationId !== organizationId) {
    throw new ForbiddenError('This request does not belong to your organization');
  }

  if (joinRequest.status !== JoinRequestStatus.PENDING) {
    throw new BadRequestError('This request has already been processed');
  }

  const status = decision === 'APPROVED' ? JoinRequestStatus.APPROVED : JoinRequestStatus.REJECTED;
  const updatedRequest = await joinRequestRepo.updateJoinRequestStatus(
    requestId,
    status,
    adminResponse
  );

  if (decision === 'APPROVED') {
    await orgRepo.assignUserToOrganization(joinRequest.userId, organizationId, Role.VIEWER);
    logger.info(`[JoinRequestService] User ${joinRequest.userId} added to organization ${organizationId}`);
  }

  logger.info(`[JoinRequestService] Request ${requestId} ${decision.toLowerCase()} successfully`);

  return {
    requestId,
    decision,
    user: updatedRequest.user,
    organization: updatedRequest.organization,
    message: `Request ${decision.toLowerCase()} successfully`
  };
};