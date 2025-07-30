import logger from "../utils/logger";
import prisma from '../config/prisma';
import { JoinRequestStatus } from '@prisma/client';

export const createJoinRequest = async (
  userId: number,
  organizationId: number,
  requestMessage?: string
) => {
  try {
    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId,
        organizationId,
        status: JoinRequestStatus.PENDING
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return joinRequest;
  } catch (error) {
    logger.error('[JoinRequestRepo] Create join request failed:', error);
    throw error;
  }
};

export const getPendingJoinRequests = async (organizationId: number) => {
  try {
    const requests = await prisma.joinRequest.findMany({
      where: {
        organizationId,
        status: JoinRequestStatus.PENDING
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  } catch (error) {
    logger.error('[JoinRequestRepo] Get pending requests failed:', error);
    throw error;
  }
};

export const findExistingRequest = async (userId: number, organizationId: number) => {
  try {
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        userId,
        organizationId
      }
    });

    return existingRequest;
  } catch (error) {
    logger.error('[JoinRequestRepo] Find existing request failed:', error);
    throw error;
  }
};

export const updateJoinRequestStatus = async (
  requestId: number,
  status: JoinRequestStatus,
  adminResponse?: string
) => {
  try {
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: {
        status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedRequest;
  } catch (error) {
    logger.error('[JoinRequestRepo] Update request status failed:', error);
    throw error;
  }
};

export const getJoinRequestById = async (requestId: number) => {
  try {
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return request;
  } catch (error) {
    logger.error('[JoinRequestRepo] Get request by ID failed:', error);
    throw error;
  }
};
