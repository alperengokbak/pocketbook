import { z } from 'zod';

export const updateProgressSchema = z.object({
  currentPosition: z.string().optional(),
  currentPage: z.number().int().min(0).optional(),
  totalPages: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const bookSearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type BookSearchInput = z.infer<typeof bookSearchSchema>;
