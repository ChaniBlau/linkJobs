import { Response } from 'express';
import * as service from '../../services/keyword.service';
import logger from '../../utils/logger';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { BaseController } from '../base/base.controller';

/**
 * GET /api/keywords
 * Get all keywords for authenticated user
 */
export const getAllKeywords = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json(BaseController.error('Unauthorized'));

  try {
    const keywords = await service.getKeywords(userId);
    return res.status(200).json(BaseController.success('Successfully fetched keywords', keywords));
  } catch (error: any) {
    logger.error(`❌ Failed to get keywords for user ${userId}: ${error.message}`);
    return res.status(500).json(BaseController.error('Failed to fetch keywords'));
  }
};

/**
 * POST /api/keywords
 * Add new keyword for authenticated user
 */
export const createKeyword = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json(BaseController.error('Unauthorized'));

  const { word, weight } = req.body;

  try {
    const keyword = await service.createKeyword(userId, word, weight);
    return res.status(201).json(BaseController.success('Keyword created successfully', keyword));
  } catch (error: any) {
    logger.error(`❌ Failed to add keyword for user ${userId}: ${error.message}`);
    return res.status(500).json(BaseController.error('Failed to create keyword'));
  }
};

/**
 * PUT /api/keywords/:id
 * Update keyword weight (if owned by user)
 */
export const updateKeyword = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const keywordId = Number(req.params.id);
  if (!userId) return res.status(401).json(BaseController.error('Unauthorized'));

  if (isNaN(keywordId) || keywordId <= 0)
    return res.status(400).json(BaseController.error('Invalid keyword ID'));

  const { weight } = req.body;

  try {
    const keyword = await service.updateKeyword(userId, keywordId, weight);
    return res.status(200).json(BaseController.success('Keyword updated successfully', keyword));
  } catch (error: any) {
    logger.warn(`🚫 Update failed for keyword ${keywordId} by user ${userId}: ${error.message}`);
    return res.status(403).json(BaseController.error('Permission denied or error occurred'));
  }
};

/**
 * DELETE /api/keywords/:id
 * Delete keyword if owned by user
 */
export const deleteKeyword = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const keywordId = Number(req.params.id);
  if (!userId) return res.status(401).json(BaseController.error('Unauthorized'));

  if (isNaN(keywordId) || keywordId <= 0)
    return res.status(400).json(BaseController.error('Invalid keyword ID'));

  try {
    await service.deleteKeyword(userId, keywordId);
    return res.status(204).send();
  } catch (error: any) {
    logger.warn(`🚫 Delete failed for keyword ${keywordId} by user ${userId}: ${error.message}`);
    return res.status(403).json(BaseController.error('Permission denied or error occurred'));
  }
};
