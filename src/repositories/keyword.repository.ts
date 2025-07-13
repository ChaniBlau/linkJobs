import prisma from '../config/prisma';
import { Keyword } from '@prisma/client';

export const getKeywordsByUser = async (userId: number): Promise<Keyword[]> => {
  return prisma.keyword.findMany({ where: { userId } });
};

export const createKeyword = async (
  userId: number,
  word: string,
  weight: number = 1
): Promise<Keyword> => {
  return prisma.keyword.create({ data: { userId, word, weight } });
};

export const updateKeyword = async (
  id: number,
  weight: number
): Promise<Keyword> => {
  return prisma.keyword.update({ where: { id }, data: { weight } });
};

export const deleteKeyword = async (id: number): Promise<Keyword> => {
  return prisma.keyword.delete({ where: { id } });
};
