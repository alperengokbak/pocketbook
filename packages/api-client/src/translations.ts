import type { ApiClient } from './client';
import type { TranslateResponse } from '@pocketbook/shared-types';

export function createTranslationsApi(client: ApiClient) {
  return {
    translate: (data: {
      word: string;
      context?: string;
      sourceLang?: string;
      targetLang?: string;
    }) => client.post<TranslateResponse>('/translations/translate', data),
  };
}
