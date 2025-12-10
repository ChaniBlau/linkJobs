import prisma from '../config/prisma';
import { Group, UserGroup } from '@prisma/client';

export const groupRepository = {
  getGroupById: (id: number): Promise<Group | null> => {
    return prisma.group.findUnique({ where: { id } });
  },

  createGroup: (data: Pick<Group, 'name' | 'linkedinUrl'>): Promise<Group> => {
    return prisma.group.create({ data });
  },

  updateGroup: (id: number, data: Partial<Pick<Group, 'name' | 'linkedinUrl'>>): Promise<Group> => {
    return prisma.group.update({ where: { id }, data });
  },

  deleteGroup: (id: number): Promise<Group> => {
    return prisma.group.delete({ where: { id } });
  },

  getAllGroups: (): Promise<Group[]> => {
    return prisma.group.findMany();
  },

  joinGroup: (userId: number, groupId: number): Promise<UserGroup> => {
    return prisma.userGroup.create({
      data: { userId, groupId },
    });
  },

  leaveGroup: (userId: number, groupId: number): Promise<UserGroup> => {
    return prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
  },

  isUserInGroup: (userId: number, groupId: number): Promise<UserGroup | null> => {
    return prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
  },

  getUserGroups: (userId: number): Promise<Group[]> => {
    return prisma.group.findMany({
      where: {
        Users: {
          some: {
            userId,
          },
        },
      },
    });
  },
  findByLinkedinUrl: (linkedinUrl: string) => {
  return prisma.group.findUnique({ where: { linkedinUrl } });
},
};

