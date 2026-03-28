export interface Translation {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLang: string;
  targetLang: string;
  context: string | null;
  createdAt: string;
}

export interface TranslateRequest {
  word: string;
  context?: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslateResponse {
  sourceWord: string;
  targetWord: string;
  sourceLang: string;
  targetLang: string;
}
