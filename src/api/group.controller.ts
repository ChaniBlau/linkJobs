import { z } from 'zod';
import { Request, Response } from 'express';
import { groupService } from '../services/group.service';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { BaseController } from './base/base.controller';

const createGroupSchema = z.object({
  name: z.string().min(1),
  linkedinUrl: z.string().url(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  linkedinUrl: z.string().url().optional(),
});

export const createGroup = async (req: Request, res: Response) => {
  try {
    const body = createGroupSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const group = await groupService.createGroup({
      name: body.name,
      linkedinUrl: body.linkedinUrl,
      userRole: user.role,
    });

    res.status(201).json(BaseController.success('Group created successfully', group));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to create group', error instanceof Error ? error.message : error)
    );
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.id);
    if (isNaN(groupId)) throw new Error('Invalid group ID');

    const body = updateGroupSchema.parse(req.body);
    if (Object.keys(body).length === 0) throw new Error('No fields provided for update');

    const user = (req as AuthenticatedRequest).user!;
    const group = await groupService.updateGroup(groupId, body, user.role);

    res.status(200).json(BaseController.success('Group updated successfully', group));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to update group', error instanceof Error ? error.message : error)
    );
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.id);
    if (isNaN(groupId)) throw new Error('Invalid group ID');

    const user = (req as AuthenticatedRequest).user!;
    await groupService.deleteGroup(groupId, user.role);

    // ✅ תקני: מחזיר סטטוס 204 ללא תוכן
    res.status(204).send();
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to delete group', error instanceof Error ? error.message : error)
    );
  }
};

export const listAllGroups = async (_req: Request, res: Response) => {
  try {
    const groups = await groupService.listAllGroups();
    res.status(200).json(BaseController.success('Groups fetched successfully', groups));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to fetch groups', error instanceof Error ? error.message : error)
    );
  }
};


export const joinGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) throw new Error('Invalid group ID');

    const user = (req as AuthenticatedRequest).user!;
    await groupService.joinGroup(user.id, groupId);

    res.status(200).json(BaseController.success('Joined group successfully', null));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to join group', error instanceof Error ? error.message : error)
    );
  }
};

export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) throw new Error('Invalid group ID');

    const user = (req as AuthenticatedRequest).user!;
    await groupService.leaveGroup(user.id, groupId);

    res.status(200).json(BaseController.success('Left group successfully', null));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to leave group', error instanceof Error ? error.message : error)
    );
  }
};

export const listUserGroups = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const groups = await groupService.getUserGroups(user.id);

    res.status(200).json(BaseController.success('User groups fetched successfully', groups));
  } catch (error) {
    res.status(400).json(
      BaseController.error('Failed to fetch user groups', error instanceof Error ? error.message : error)
    );
  }
};
