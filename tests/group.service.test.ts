import { groupService } from '../src/services/group.service';
import { groupRepository } from '../src/repositories/group.repository';
import { Role } from '@prisma/client';

jest.mock('../src/repositories/group.repository', () => ({
  groupRepository: {
    getGroupById: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getAllGroups: jest.fn(),
    joinGroup: jest.fn(),
    leaveGroup: jest.fn(),
    isUserInGroup: jest.fn(),
    getUserGroups: jest.fn(),
    findByLinkedinUrl: jest.fn(),
  },
}));

describe('groupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create group if user is authorized and url is unique', async () => {
      (groupRepository.findByLinkedinUrl as jest.Mock).mockResolvedValue(null);
      (groupRepository.createGroup as jest.Mock).mockResolvedValue({ id: 1, name: 'React Devs' });

      const result = await groupService.createGroup({
        name: 'React Devs',
        linkedinUrl: 'https://linkedin.com/groups/123',
        userRole: Role.SUPER_ADMIN,
      });

      expect(groupRepository.createGroup).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'React Devs' });
    });

    it('should throw if user is not authorized', async () => {
      await expect(
        groupService.createGroup({
          name: 'React Devs',
          linkedinUrl: 'https://linkedin.com/groups/123',
          userRole: Role.VIEWER,
        })
      ).rejects.toThrow('Unauthorized to create group');
    });

    it('should throw if group with same URL already exists', async () => {
      (groupRepository.findByLinkedinUrl as jest.Mock).mockResolvedValue({ id: 2 });

      await expect(
        groupService.createGroup({
          name: 'React Devs',
          linkedinUrl: 'https://linkedin.com/groups/123',
          userRole: Role.ORG_ADMIN,
        })
      ).rejects.toThrow('Group with this LinkedIn URL already exists');
    });
  });

  describe('deleteGroup', () => {
    it('should delete group if found and user authorized', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 2 });
      (groupRepository.deleteGroup as jest.Mock).mockResolvedValue({ id: 2 });

      const result = await groupService.deleteGroup(2, Role.SUPER_ADMIN);

      expect(groupRepository.deleteGroup).toHaveBeenCalledWith(2);
      expect(result).toEqual({ id: 2 });
    });

    it('should throw if group not found', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue(null);

      await expect(groupService.deleteGroup(3, Role.ORG_ADMIN)).rejects.toThrow('Group not found');
    });

    it('should throw if user unauthorized', async () => {
      await expect(groupService.deleteGroup(3, Role.VIEWER)).rejects.toThrow('Unauthorized to delete group');
    });
  });

  describe('joinGroup', () => {
    it('should join group if user not already in it', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 3 });
      (groupRepository.isUserInGroup as jest.Mock).mockResolvedValue(null);
      (groupRepository.joinGroup as jest.Mock).mockResolvedValue({ userId: 10, groupId: 3 });

      const result = await groupService.joinGroup(10, 3);

      expect(groupRepository.joinGroup).toHaveBeenCalledWith(10, 3);
      expect(result).toEqual({ userId: 10, groupId: 3 });
    });

    it('should throw if group not found', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue(null);

      await expect(groupService.joinGroup(10, 99)).rejects.toThrow('Group not found');
    });

    it('should throw if already joined', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 3 });
      (groupRepository.isUserInGroup as jest.Mock).mockResolvedValue({ userId: 10, groupId: 3 });

      await expect(groupService.joinGroup(10, 3)).rejects.toThrow('User already joined this group');
    });
  });

  describe('leaveGroup', () => {
    it('should remove user from group if in group', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 4 });
      (groupRepository.isUserInGroup as jest.Mock).mockResolvedValue({ userId: 8, groupId: 4 });

      await groupService.leaveGroup(8, 4);

      expect(groupRepository.leaveGroup).toHaveBeenCalledWith(8, 4);
    });

    it('should throw if group not found', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue(null);

      await expect(groupService.leaveGroup(8, 404)).rejects.toThrow('Group not found');
    });

    it('should throw if user is not in group', async () => {
      (groupRepository.getGroupById as jest.Mock).mockResolvedValue({ id: 4 });
      (groupRepository.isUserInGroup as jest.Mock).mockResolvedValue(null);

      await expect(groupService.leaveGroup(8, 4)).rejects.toThrow('User is not a member of this group');
    });
  });

  describe('getUserGroups', () => {
    it('should return all groups of user', async () => {
      const groups = [
        { id: 1, name: 'Frontend' },
        { id: 2, name: 'Backend' },
      ];

      (groupRepository.getUserGroups as jest.Mock).mockResolvedValue(groups);

      const result = await groupService.getUserGroups(6);
      expect(result).toEqual(groups);
    });
  });

  describe('getAllGroups', () => {
    it('should return all existing groups', async () => {
      const groups = [{ id: 1, name: 'X' }];
      (groupRepository.getAllGroups as jest.Mock).mockResolvedValue(groups);

      const result = await groupService.listAllGroups();
      expect(result).toEqual(groups);
    });
  });
});
