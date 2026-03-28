import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options?: string[];
  type: string;
}

interface QuizResult {
  id: string;
  userId: string;
  correct: number;
  total: number;
  quizType: string;
  createdAt: string;
}

export function useGenerateQuiz(type = 'FLASHCARD', count = 10, enabled = false) {
  return useQuery({
    queryKey: ['quiz', type, count],
    queryFn: () =>
      api.get<QuizQuestion[]>(`/quiz/generate?type=${type}&count=${count}`),
    enabled,
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: (data: {
      quizType: string;
      answers: Array<{
        vocabularyId: string;
        answer: string;
        correct: boolean;
      }>;
    }) => api.post<QuizResult>('/quiz/submit', data),
  });
}
