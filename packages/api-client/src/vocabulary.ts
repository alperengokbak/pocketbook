import type { ApiClient } from './client';
import type { UserVocabulary, PaginatedResponse } from '@pocketbook/shared-types';

export function createVocabularyApi(client: ApiClient) {
  return {
    list: (params?: {
      query?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      const qs = searchParams.toString();
      return client.get<PaginatedResponse<UserVocabulary>>(`/vocabulary${qs ? `?${qs}` : ''}`);
    },

    add: (translationId: string) =>
      client.post<UserVocabulary>('/vocabulary', { translationId }),

    remove: (id: string) => client.delete<void>(`/vocabulary/${id}`),

    review: (id: string, quality: number) =>
      client.patch<UserVocabulary>(`/vocabulary/${id}/review`, { quality }),
  };
}
