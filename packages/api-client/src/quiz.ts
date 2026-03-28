import type { ApiClient } from './client';
import type { QuizQuestion, QuizResult } from '@pocketbook/shared-types';
import type { SubmitQuizInput } from '@pocketbook/validators';

export function createQuizApi(client: ApiClient) {
  return {
    generate: (params?: { type?: string; count?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.count) searchParams.set('count', String(params.count));
      const qs = searchParams.toString();
      return client.get<QuizQuestion[]>(`/quiz/generate${qs ? `?${qs}` : ''}`);
    },

    submit: (data: SubmitQuizInput) =>
      client.post<QuizResult>('/quiz/submit', data),
  };
}
