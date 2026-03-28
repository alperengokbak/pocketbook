import { z } from 'zod';

export const generateQuizSchema = z.object({
  type: z.enum(['FLASHCARD', 'MULTIPLE_CHOICE', 'FILL_BLANK']).default('FLASHCARD'),
  count: z.coerce.number().int().min(1).max(50).default(10),
});

export const submitQuizSchema = z.object({
  quizType: z.enum(['FLASHCARD', 'MULTIPLE_CHOICE', 'FILL_BLANK']),
  answers: z.array(
    z.object({
      vocabularyId: z.string().uuid(),
      answer: z.string(),
      correct: z.boolean(),
    }),
  ),
});

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
