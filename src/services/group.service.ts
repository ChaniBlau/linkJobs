import { groupRepository } from '../repositories/group.repository';
import { Role } from '@prisma/client';
import { CreateGroupInput } from '../types/CreateGroupInput';

export const groupService = {
    async createGroup(data: CreateGroupInput) {
        const { name, linkedinUrl, organizationId, userRole } = data;

        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
            throw new Error('Unauthorized to create group');
        }

        const existingGroups = await groupRepository.getGroupsByOrganization(organizationId);
        const duplicate = existingGroups.find(g => g.linkedinUrl === linkedinUrl);
        if (duplicate) {
            throw new Error('Group already exists for this organization');
        }

        return groupRepository.createGroup({ name, linkedinUrl, organizationId });
    },

    async updateGroup(
        id: number,
        data: Partial<Omit<CreateGroupInput, 'userRole'>>,
        userRole: Role
    ) {
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
            throw new Error('Unauthorized to update group');
        }

        const existing = await groupRepository.getGroupById(id);
        if (!existing) {
            throw new Error('Group not found');
        }
        return groupRepository.updateGroup(id, data);
    },

    async deleteGroup(id: number, userRole: Role) {
        if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
            throw new Error('Unauthorized to delete group');
        }

        const existing = await groupRepository.getGroupById(id);
        if (!existing) {
            throw new Error('Group not found');
        }

        
        // const jobCount = await jobRepository.countByGroupId(id);
        // if (jobCount > 0) {
        //   throw new Error('Cannot delete group with associated jobs');
        // }

        return groupRepository.deleteGroup(id);
    },

    async getGroupsByOrganization(organizationId: number) {
        const groups = await groupRepository.getGroupsByOrganization(organizationId);

        if (!groups || groups.length === 0) {
            throw new Error('No groups found for this organization');
        }

        return groups;
    }
};
