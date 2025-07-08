import {
  createGroup,
  updateGroup,
  deleteGroup,
  listAllGroups,
  joinGroup,
  leaveGroup,
  listUserGroups,
} from '../src/api/group.controller';

import { groupService } from '../src/services/group.service';
import { Role } from '@prisma/client';

jest.mock('../src/services/group.service');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('group.controller', () => {
  describe('createGroup', () => {
    it('should create group and return 201', async () => {
      const mockReq: any = {
        body: {
          name: 'Frontend Devs IL',
          linkedinUrl: 'https://linkedin.com/groups/123456/',
        },
        user: { role: Role.SUPER_ADMIN },
      };

      const res = mockRes();

      const mockGroup = { id: 1, ...mockReq.body };
      (groupService.createGroup as jest.Mock).mockResolvedValue(mockGroup);

      await createGroup(mockReq, res);

      expect(groupService.createGroup).toHaveBeenCalledWith({
        ...mockReq.body,
        userRole: Role.SUPER_ADMIN,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockGroup }));
    });
  });

  describe('updateGroup', () => {
    it('should update group and return 200', async () => {
      const mockReq: any = {
        params: { id: '5' },
        body: { name: 'Updated Group' },
        user: { role: Role.SUPER_ADMIN },
      };

      const res = mockRes();
      const updatedGroup = { id: 5, name: 'Updated Group' };

      (groupService.updateGroup as jest.Mock).mockResolvedValue(updatedGroup);

      await updateGroup(mockReq, res);

      expect(groupService.updateGroup).toHaveBeenCalledWith(5, { name: 'Updated Group' }, Role.SUPER_ADMIN);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: updatedGroup }));
    });
  });

  describe('deleteGroup', () => {
    it('should delete group and return 204', async () => {
      const mockReq: any = {
        params: { id: '7' },
        user: { role: Role.SUPER_ADMIN },
      };

      const res = mockRes();

      (groupService.deleteGroup as jest.Mock).mockResolvedValue(undefined);

      await deleteGroup(mockReq, res);

      expect(groupService.deleteGroup).toHaveBeenCalledWith(7, Role.SUPER_ADMIN);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('listAllGroups', () => {
    it('should return all groups', async () => {
      const mockReq: any = {};
      const res = mockRes();

      const mockGroups = [{ id: 1, name: 'Group A' }, { id: 2, name: 'Group B' }];
      (groupService.listAllGroups as jest.Mock).mockResolvedValue(mockGroups);

      await listAllGroups(mockReq, res);

      expect(groupService.listAllGroups).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockGroups }));
    });
  });

  describe('joinGroup', () => {
    it('should allow user to join group', async () => {
      const mockReq: any = {
        params: { groupId: '3' },
        user: { id: 5, role: Role.VIEWER },
      };

      const res = mockRes();
      (groupService.joinGroup as jest.Mock).mockResolvedValue({ userId: 5, groupId: 3 });

      await joinGroup(mockReq, res);

      expect(groupService.joinGroup).toHaveBeenCalledWith(5, 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('leaveGroup', () => {
    it('should allow user to leave group', async () => {
      const mockReq: any = {
        params: { groupId: '3' },
        user: { id: 5, role: Role.VIEWER },
      };

      const res = mockRes();
      (groupService.leaveGroup as jest.Mock).mockResolvedValue(undefined);

      await leaveGroup(mockReq, res);

      expect(groupService.leaveGroup).toHaveBeenCalledWith(5, 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('listUserGroups', () => {
    it('should return groups of the user', async () => {
      const mockReq: any = {
        user: { id: 5, role: Role.VIEWER },
      };

      const res = mockRes();
      const mockGroups = [{ id: 1, name: 'Group X' }];
      (groupService.getUserGroups as jest.Mock).mockResolvedValue(mockGroups);

      await listUserGroups(mockReq, res);

      expect(groupService.getUserGroups).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockGroups }));
    });
  });
});
