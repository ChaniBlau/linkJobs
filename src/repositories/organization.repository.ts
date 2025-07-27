import prisma from '../config/prisma';
import { Role } from '@prisma/client';

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
