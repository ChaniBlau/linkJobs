import { z } from 'zod';

export const keywordSchema = z.object({
  word: z.string().min(1, 'Keyword is required'),
  weight: z.number().min(1).max(10).optional(),
});

export const updateKeywordSchema = z.object({
  weight: z.number().min(1).max(10),
});
