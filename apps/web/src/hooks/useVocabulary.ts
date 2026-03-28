import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Translation {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLang: string;
  targetLang: string;
}

interface UserVocabulary {
  id: string;
  userId: string;
  translationId: string;
  translation: Translation;
  masteryLevel: number;
  nextReviewAt: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useVocabularyList(params?: {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.query) searchParams.set('query', params.query);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const qs = searchParams.toString();

  return useQuery({
    queryKey: ['vocabulary', params],
    queryFn: () =>
      api.get<PaginatedResponse<UserVocabulary>>(
        `/vocabulary${qs ? `?${qs}` : ''}`,
      ),
  });
}

export function useAddVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (translationId: string) =>
      api.post<UserVocabulary>('/vocabulary', { translationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

export function useRemoveVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/vocabulary/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

export function useReviewVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: number }) =>
      api.patch<UserVocabulary>(`/vocabulary/${id}/review`, { quality }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}
