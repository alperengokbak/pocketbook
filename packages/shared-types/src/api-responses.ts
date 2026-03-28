export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalBooks: number;
  booksInProgress: number;
  booksFinished: number;
  totalWordsLearned: number;
  wordsToReview: number;
  currentStreak: number;
  quizzesTaken: number;
  averageQuizScore: number;
}
