import { z } from 'zod';

export const addVocabularySchema = z.object({
  translationId: z.string().uuid(),
});

export const reviewVocabularySchema = z.object({
  quality: z.number().int().min(0).max(5),
});

export const vocabularySearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['createdAt', 'masteryLevel', 'nextReviewAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AddVocabularyInput = z.infer<typeof addVocabularySchema>;
export type ReviewVocabularyInput = z.infer<typeof reviewVocabularySchema>;
export type VocabularySearchInput = z.infer<typeof vocabularySearchSchema>;
