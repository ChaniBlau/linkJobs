import prisma from '../config/prisma';
import {  Role } from '@prisma/client';
import logger from '../utils/logger';

export const getUserById = (userId: number) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const updateUserRole = (userId: number, newRole: Role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
};

export const assignUserToOrganization = (userId: number, organizationId: number, role: Role = Role.VIEWER) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      organizationId,
      role,
    },
  });
};

export const removeUserFromOrganization = async (userId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      organizationId: null,
      role: Role.VIEWER,
    },
  });
};

export const getUsersInOrganization = async (organizationId: number) => {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};
export const getOrganizationById = async (orgId: number) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return organization;
  } catch (error) {
    logger.error('[OrgRepo] Get organization by ID failed:', error);
    throw error;
  }
};

// פונקציה לקבלת כל המשתמשים בארגון
export const getUsersByOrganizationId = async (orgId: number) => {
  try {
    const users = await prisma.user.findMany({
      where: { 
        organizationId: orgId 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { role: 'asc' }, // ORG_ADMIN יופיע ראשון
        { name: 'asc' }
      ]
    });

    return users;
  } catch (error) {
    logger.error('[OrgRepo] Get users by organization ID failed:', error);
    throw error;
  }
};

export const countUsersByOrganization = async (orgId: number): Promise<number> => {
  try {
    const count = await prisma.user.count({
      where: { organizationId: orgId }
    });

    return count;
  } catch (error) {
    logger.error('[OrgRepo] Count users by organization failed:', error);
    throw error;
  }
};

