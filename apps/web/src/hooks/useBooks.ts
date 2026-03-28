import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Book {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  format: string;
  fileUrl: string;
  fileSize: number;
  isPublic: boolean;
  createdAt: string;
}

interface UserBook {
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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useMyBooks(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['my-books', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<UserBook>>(`/books?page=${page}&limit=${limit}`),
  });
}

export function useLibrary(query?: string, page = 1, limit = 12) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('page', String(page));
  params.set('limit', String(limit));

  return useQuery({
    queryKey: ['library', query, page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Book>>(`/books/library?${params.toString()}`),
  });
}

/** Book IDs already in the user's library (for public list add-button state). */
export function useMyLibraryBookIds(enabled: boolean) {
  return useQuery({
    queryKey: ['my-books', 'library-book-ids'],
    queryFn: () =>
      api.get<PaginatedResponse<UserBook>>(`/books?page=1&limit=1000`),
    select: (res) => new Set(res.data.map((ub) => ub.bookId)),
    enabled,
  });
}

export function useBookContent(bookId: string) {
  return useQuery({
    queryKey: ['book-content', bookId],
    queryFn: () =>
      api.get<{
        bookId: string;
        format: string;
        fileUrl: string;
        totalPages: number;
        currentPosition: string | null;
        currentPage: number;
        progress: number;
        metadata: { title: string; author: string | null; coverUrl: string | null };
      }>(`/reader/${bookId}/content`),
    enabled: !!bookId,
  });
}

export function useUploadBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.upload<UserBook>('/books/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => api.post<UserBook>(`/books/${bookId}/add`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
}

export function useUpdateProgress() {
  return useMutation({
    mutationFn: ({
      bookId,
      ...data
    }: {
      bookId: string;
      currentPosition?: string;
      currentPage?: number;
      totalPages?: number;
      progress?: number;
    }) => api.patch<UserBook>(`/reader/${bookId}/progress`, data),
  });
}
