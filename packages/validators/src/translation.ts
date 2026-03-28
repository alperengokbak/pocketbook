import { z } from 'zod';

export const translateSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100),
  context: z.string().max(500).optional(),
  sourceLang: z.string().default('en'),
  targetLang: z.string().default('tr'),
});

export type TranslateInput = z.infer<typeof translateSchema>;
