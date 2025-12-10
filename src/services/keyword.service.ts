import logger from '../utils/logger';
import * as repo from '../repositories/keyword.repository';

/**
 * select keywords for a specific user
 * @param userId - ID of the user to fetch keywords for
 */
export const getKeywords = async (userId: number) => {
  try {
    logger.info(`🔍 Fetching keywords for user ${userId}`);
    return await repo.getKeywordsByUser(userId);
  } catch (error) {
    logger.error(`❌ Failed to fetch keywords for user ${userId}: ${error}`);
    throw error;
  }
};

/**
 * add a new keyword for a user
 */
export const createKeyword = async (userId: number, word: string, weight = 1) => {
  try {
    logger.info(`➕ Creating keyword '${word}' for user ${userId} with weight ${weight}`);
    return await repo.createKeyword(userId, word, weight);
  } catch (error) {
    logger.error(`❌ Failed to create keyword '${word}' for user ${userId}: ${error}`);
    throw error;
  }
};

/**
 * update an existing keyword
 * includes checking if the keyword belongs to the user
 */
export const updateKeyword = async (userId: number, keywordId: number, weight: number = 1) => {
  try {
    logger.info(`✏️ Attempting to update keyword ${keywordId} to weight ${weight} for user ${userId}`);

    const keywords = await repo.getKeywordsByUser(userId);
    const owned = keywords.find(k => k.id === keywordId);

    if (!owned) {
      logger.warn(`🚫 User ${userId} tried to update keyword ${keywordId} that does not belong to them`);
      throw new Error('Permission denied: keyword does not belong to user');
    }

    return await repo.updateKeyword(keywordId, weight);
  } catch (error) {
    logger.error(`❌ Failed to update keyword ${keywordId} for user ${userId}: ${error}`);
    throw error;
  }
};

/**
 * delete a keyword for a user
 * includes checking if the keyword belongs to the user
 */
export const deleteKeyword = async (userId: number, keywordId: number) => {
  try {
    logger.info(`🗑️ Attempting to delete keyword ${keywordId} for user ${userId}`);

    const keywords = await repo.getKeywordsByUser(userId);
    const owned = keywords.find(k => k.id === keywordId);

    if (!owned) {
      logger.warn(`🚫 User ${userId} tried to delete keyword ${keywordId} that does not belong to them`);
      throw new Error('Permission denied: keyword does not belong to user');
    }

    return await repo.deleteKeyword(keywordId);
  } catch (error) {
    logger.error(`❌ Failed to delete keyword ${keywordId} for user ${userId}: ${error}`);
    throw error;
  }
};
