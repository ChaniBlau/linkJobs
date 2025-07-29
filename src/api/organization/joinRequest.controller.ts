import { Request, Response } from 'express';
import * as joinRequestService from '../../services/joinRequest.service'
import logger from '../../utils/logger';
import { BaseController } from '../base/base.controller';


export const submitJoinRequest = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { requestMessage } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json(BaseController.error("Unauthorized"));
  }

  if (!orgId || isNaN(Number(orgId))) {
    return res.status(400).json(BaseController.error("Valid organization ID is required"));
  }

  try {
    const result = await joinRequestService.submitJoinRequest(
      userId,
      Number(orgId),
      requestMessage
    );

    logger.info(`[JoinRequestController] Join request submitted by user ${userId} to org ${orgId}`);
    
    res.status(201).json(
      BaseController.success("Join request submitted successfully", result)
    );

  } catch (error) {
    logger.error('[JoinRequestController] Submit join request error:', error);
    const status = (error as any).statusCode || 500;
    res.status(status).json(BaseController.error(error.message || 'Internal server error'));
  }
};

export const getPendingJoinRequests = async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const currentUserId = req.user?.id;

  if (!currentUserId) {
    return res.status(401).json(BaseController.error("Unauthorized"));
  }

  if (!orgId || isNaN(Number(orgId))) {
    return res.status(400).json(BaseController.error("Valid organization ID is required"));
  }

  try {
    const result = await joinRequestService.getPendingRequests(
      Number(orgId),
      currentUserId
    );

    res.status(200).json(
      BaseController.success("Pending join requests retrieved successfully", result)
    );

  } catch (error) {
    logger.error('[JoinRequestController] Get pending requests error:', error);
    const status = (error as any).statusCode || 500;
    res.status(status).json(BaseController.error(error.message || 'Internal server error'));
  }
};

export const respondToJoinRequest = async (req: Request, res: Response) => {
  const { orgId, requestId } = req.params;
  const { decision, adminResponse } = req.body;
  const currentUserId = req.user?.id;

  if (!currentUserId) {
    return res.status(401).json(BaseController.error("Unauthorized"));
  }

  if (!orgId || isNaN(Number(orgId))) {
    return res.status(400).json(BaseController.error("Valid organization ID is required"));
  }

  if (!requestId || isNaN(Number(requestId))) {
    return res.status(400).json(BaseController.error("Valid request ID is required"));
  }

  if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json(
      BaseController.error("Decision must be either 'APPROVED' or 'REJECTED'")
    );
  }

  try {
    const result = await joinRequestService.respondToJoinRequest(
      Number(orgId),
      Number(requestId),
      decision,
      currentUserId,
      adminResponse
    );

    logger.info(`[JoinRequestController] Request ${requestId} ${decision} by user ${currentUserId}`);

    res.status(200).json(
      BaseController.success(`Join request ${decision.toLowerCase()} successfully`, result)
    );

  } catch (error) {
    logger.error('[JoinRequestController] Respond to join request error:', error);
    const status = (error as any).statusCode || 500;
    res.status(status).json(BaseController.error(error.message || 'Internal server error'));
  }
};