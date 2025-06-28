import { z } from 'zod';
import { groupService } from '../services/group.service';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { Request, Response } from 'express';

const createGroupSchema = z.object({
  name: z.string().min(1),
  linkedinUrl: z.string().url(),
  organizationId: z.number().int().positive(),
});
const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  linkedinUrl: z.string().url().optional(),
  organizationId: z.number().int().positive().optional(),
});

export const createGroup = async (req: Request, res: Response) => {
  try {
    const body = createGroupSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const group = await groupService.createGroup({
      name: body.name,
      linkedinUrl: body.linkedinUrl,
      organizationId: body.organizationId,
      userRole: user.role,
    });

    res.status(201).json(group);

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Unexpected error' });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.id);
    if (isNaN(groupId)) {
      res.status(400).json({ error: 'Invalid group ID' });
      return;
    }

    const validatedBody = updateGroupSchema.parse(req.body);

    if (Object.keys(validatedBody).length === 0) {
      res.status(400).json({ error: 'No fields provided for update' });
      return;
    }

    const user = (req as AuthenticatedRequest).user!;
    const updatedGroup = await groupService.updateGroup(groupId, validatedBody, user.role);

    if (!updatedGroup) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.status(200).json(updatedGroup);

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Unexpected error while updating group' });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.id);
    if (isNaN(groupId)) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }
    const user = (req as AuthenticatedRequest).user!;
    await groupService.deleteGroup(groupId, user.role);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

export const listGroupsByOrganization = async (req: Request, res: Response) => {
  try {
    const orgId = Number(req.params.organizationId);
    if (isNaN(orgId)) {
      res.status(400).json({ error: 'Invalid organizationId' });
      return;
    }
    const groups = await groupService.getGroupsByOrganization(orgId);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
    return;
  }
};
