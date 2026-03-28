import type { ApiClient } from './client';
import type { Book, UserBook, BookContent, PaginatedResponse } from '@pocketbook/shared-types';

export function createBooksApi(client: ApiClient) {
  return {
    getLibrary: (params?: { query?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return client.get<PaginatedResponse<Book>>(`/books/library${qs ? `?${qs}` : ''}`);
    },

    getMyBooks: (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      const qs = searchParams.toString();
      return client.get<PaginatedResponse<UserBook>>(`/books${qs ? `?${qs}` : ''}`);
    },

    getBook: (id: string) => client.get<UserBook>(`/books/${id}`),

    upload: (formData: FormData) => client.upload<Book>('/books/upload', formData),

    addToLibrary: (bookId: string) => client.post<UserBook>(`/books/${bookId}/add`),

    getContent: (bookId: string) => client.get<BookContent>(`/reader/${bookId}/content`),

    updateProgress: (bookId: string, data: {
      currentPosition?: string;
      currentPage?: number;
      totalPages?: number;
      progress?: number;
    }) => client.patch<UserBook>(`/reader/${bookId}/progress`, data),
  };
}
