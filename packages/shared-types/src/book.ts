import { BookFormat } from './enums';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  format: BookFormat;
  fileUrl: string;
  fileSize: number;
  isPublic: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  book: Book;
  currentPosition: string | null;
  currentPage: number;
  totalPages: number;
  progress: number;
  lastReadAt: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface BookContent {
  bookId: string;
  format: BookFormat;
  content: string;
  totalPages: number;
  metadata: {
    title: string;
    author: string | null;
    coverUrl: string | null;
  };
}
