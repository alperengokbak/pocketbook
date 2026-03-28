import { Translation } from './translation';

export interface UserVocabulary {
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
