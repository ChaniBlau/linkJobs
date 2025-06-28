import { createGroup, updateGroup, deleteGroup, listGroupsByOrganization } from '../src/api/group.controller';
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
          name: 'Dev Group',
          linkedinUrl: 'https://linkedin.com/dev-group',
          organizationId: 1,
        },
        user: { role: Role.ORG_ADMIN },
      };

      const res = mockRes();

      (groupService.createGroup as jest.Mock).mockResolvedValue({ id: 1, ...mockReq.body });

      await createGroup(mockReq, res);

      expect(groupService.createGroup).toHaveBeenCalledWith({
        ...mockReq.body,
        userRole: Role.ORG_ADMIN,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...mockReq.body });
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

      (groupService.updateGroup as jest.Mock).mockResolvedValue({ id: 5, name: 'Updated Group' });

      await updateGroup(mockReq, res);

      expect(groupService.updateGroup).toHaveBeenCalledWith(
        5,
        { name: 'Updated Group' },
        Role.SUPER_ADMIN
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 5, name: 'Updated Group' });
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

  describe('listGroupsByOrganization', () => {
    it('should return groups for organization', async () => {
      const mockReq: any = {
        params: { organizationId: '3' },
      };

      const res = mockRes();

      const mockGroups = [{ id: 1, name: 'Group A' }, { id: 2, name: 'Group B' }];

      (groupService.getGroupsByOrganization as jest.Mock).mockResolvedValue(mockGroups);

      await listGroupsByOrganization(mockReq, res);

      expect(groupService.getGroupsByOrganization).toHaveBeenCalledWith(3);
      expect(res.json).toHaveBeenCalledWith(mockGroups);
    });
  });
});
