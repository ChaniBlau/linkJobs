import { groupRepository } from '../repositories/group.repository';
import { Role } from '@prisma/client';

interface CreateGroupInput {
  name: string;
  linkedinUrl: string;
  userRole: Role;
}

export const groupService = {
  async createGroup({ name, linkedinUrl, userRole }: CreateGroupInput) {
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
      throw new Error('Unauthorized to create group');
    }

    const existing = await groupRepository.findByLinkedinUrl(linkedinUrl);
    if (existing) {
      throw new Error('Group with this LinkedIn URL already exists');
    }

    return groupRepository.createGroup({ name, linkedinUrl });
  },

  async updateGroup(
    groupId: number,
    data: { name?: string; linkedinUrl?: string },
    userRole: Role
  ) {
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
      throw new Error('Unauthorized to update group');
    }

    const existing = await groupRepository.getGroupById(groupId);
    if (!existing) {
      throw new Error('Group not found');
    }

    return groupRepository.updateGroup(groupId, data);
  },

  async deleteGroup(groupId: number, userRole: Role) {
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
      throw new Error('Unauthorized to delete group');
    }

    const existing = await groupRepository.getGroupById(groupId);
    if (!existing) {
      throw new Error('Group not found');
    }

    return groupRepository.deleteGroup(groupId);
  },

  async listAllGroups() {
    return groupRepository.getAllGroups();
  },

  async joinGroup(userId: number, groupId: number) {
    const group = await groupRepository.getGroupById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const isJoined = await groupRepository.isUserInGroup(userId, groupId);
    if (isJoined) {
      throw new Error('User already joined this group');
    }

    return groupRepository.joinGroup(userId, groupId);
  },

  async leaveGroup(userId: number, groupId: number) {
    const group = await groupRepository.getGroupById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const isJoined = await groupRepository.isUserInGroup(userId, groupId);
    if (!isJoined) {
      throw new Error('User is not a member of this group');
    }

    return groupRepository.leaveGroup(userId, groupId);
  },

  async getUserGroups(userId: number) {
    return groupRepository.getUserGroups(userId);
  }
};
