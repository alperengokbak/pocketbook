import { QuizType } from './enums';

export interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options?: string[];
  type: QuizType;
}

export interface QuizResult {
  id: string;
  userId: string;
  correct: number;
  total: number;
  quizType: QuizType;
  createdAt: string;
}

export interface QuizSubmission {
  answers: Array<{
    vocabularyId: string;
    answer: string;
    correct: boolean;
  }>;
  quizType: QuizType;
}
