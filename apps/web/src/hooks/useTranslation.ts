import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TranslateResponse {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLang: string;
  targetLang: string;
}

export function useTranslate() {
  return useMutation({
    mutationFn: (data: { word: string; context?: string }) =>
      api.post<TranslateResponse>('/translations/translate', data),
  });
}
