import { groupService } from '../src/services/group.service';
import { groupRepository } from '../src/repositories/group.repository';
import { Role } from '@prisma/client';

jest.mock('../src/repositories/group.repository', () => ({
  groupRepository: {
    getGroupsByOrganization: jest.fn(),
    createGroup: jest.fn(),
    getGroupById: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
  },
}));
describe('groupService', () => {
  describe('createGroup', () => {
    it('should create group if user is authorized and group does not exist', async () => {
      (groupRepository.getGroupsByOrganization as jest.Mock).mockResolvedValue([]);
      (groupRepository.createGroup as jest.Mock).mockResolvedValue({ id: 1, name: 'Group1' });

      const result = await groupService.createGroup({
        name: 'Group1',
        linkedinUrl: 'https://linkedin.com/group1',
        organizationId: 1,
        userRole: Role.ORG_ADMIN,
      });

      expect(result).toEqual({ id: 1, name: 'Group1' });
    });

    it('should throw error if user is unauthorized', async () => {
      await expect(groupService.createGroup({
        name: 'Group1',
        linkedinUrl: 'https://linkedin.com/group1',
        organizationId: 1,
        userRole: Role.VIEWER,
      })).rejects.toThrow('Unauthorized to create group');
    });

    it('should throw error if group already exists', async () => {
      (groupRepository.getGroupsByOrganization as jest.Mock).mockResolvedValue([
        { linkedinUrl: 'https://linkedin.com/group1' }
      ]);

      await expect(groupService.createGroup({
        name: 'Group1',
        linkedinUrl: 'https://linkedin.com/group1',
        organizationId: 1,
        userRole: Role.SUPER_ADMIN,
      })).rejects.toThrow('Group already exists for this organization');
    });
  });
});

describe('deleteGroup', () => {
  it('should delete group if user is authorized and group exists', async () => {
    (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 1 });
    (groupRepository.deleteGroup as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await groupService.deleteGroup(1, Role.SUPER_ADMIN);

    expect(groupRepository.getGroupById).toHaveBeenCalledWith(1);
    expect(groupRepository.deleteGroup).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should throw error if group not found', async () => {
    (groupRepository.getGroupById as jest.Mock).mockResolvedValue(null);

    await expect(
      groupService.deleteGroup(1, Role.SUPER_ADMIN)
    ).rejects.toThrow('Group not found');
  });

  it('should throw error if user is unauthorized', async () => {
    await expect(
      groupService.deleteGroup(1, Role.VIEWER)
    ).rejects.toThrow('Unauthorized to delete group');
  });
});
