import prisma from '../config/prisma';
import { Group } from '@prisma/client';

export const groupRepository = {
  
  getGroupById: (id: number): Promise<Group | null> => {
    return prisma.group.findUnique({ where: { id } });
  },

  createGroup: (data: Pick<Group, 'name' | 'linkedinUrl' | 'organizationId'>): Promise<Group> => {
    return prisma.group.create({ data });
  },

  updateGroup: (
    id: number,
    data: Partial<Pick<Group, 'name' | 'linkedinUrl' | 'organizationId'>>
  ): Promise<Group> => {
    return prisma.group.update({
      where: { id },
      data,
    });
  },

  deleteGroup: (id: number): Promise<Group> => {
    return prisma.group.delete({ where: { id } });
  },

  getGroupsByOrganization: (organizationId: number): Promise<Group[]> => {
    return prisma.group.findMany({ where: { organizationId } });
  },
};
