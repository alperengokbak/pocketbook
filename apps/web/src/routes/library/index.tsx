import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Upload,
  BookOpen,
  Plus,
  Check,
  FileText,
} from 'lucide-react';
import {
  useMyBooks,
  useLibrary,
  useUploadBook,
  useAddToLibrary,
  useMyLibraryBookIds,
} from '@/hooks/useBooks';

export function LibraryPage() {
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: myBooksData, isLoading: loadingMyBooks } = useMyBooks(page, 12);
  const { data: publicData, isLoading: loadingPublic } = useLibrary(searchQuery, page, 12);
  const { data: myLibraryBookIds } = useMyLibraryBookIds(tab === 'public');
  const uploadMutation = useUploadBook();
  const addToLibraryMutation = useAddToLibrary();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Library</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your books and the public library
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            disabled={uploadMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Book'}
          </button>
        </div>
      </div>

      {uploadMutation.isSuccess && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          Book uploaded successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => { setTab('my'); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'my'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          My Books ({myBooksData?.total || 0})
        </button>
        <button
          onClick={() => { setTab('public'); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'public'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Public Library
        </button>
      </div>

      {/* Search (public tab only) */}
      {tab === 'public' && (
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
      )}

      {/* Book Grid */}
      <div className="mt-6">
        {tab === 'my' ? (
          loadingMyBooks ? (
            <LoadingSkeleton />
          ) : myBooksData?.data.length === 0 ? (
            <EmptyState
              message="No books in your library yet"
              action="Upload a book or add one from the public library"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myBooksData?.data.map((ub) => (
                <Link
                  key={ub.id}
                  to={`/reader/${ub.bookId}`}
                  className="card overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                    <BookOpen className="h-16 w-16 text-primary-400 dark:text-primary-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-gray-100">
                      {ub.book.title}
                    </h3>
                    {ub.book.author && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{ub.book.author}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <FileText className="mr-1 h-3 w-3" />
                        {ub.book.format}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(ub.progress)}% read
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-1.5 rounded-full bg-primary-500"
                        style={{ width: `${ub.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : loadingPublic ? (
          <LoadingSkeleton />
        ) : publicData?.data.length === 0 ? (
          <EmptyState
            message="No public books available"
            action="Upload your own books to get started"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publicData?.data.map((book) => {
              const inLibrary = myLibraryBookIds?.has(book.id) ?? false;
              return (
                <div key={book.id} className="card overflow-hidden">
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800">
                    <BookOpen className="h-16 w-16 text-secondary-400 dark:text-secondary-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-gray-100">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => addToLibraryMutation.mutate(book.id)}
                      className="btn-primary mt-3 w-full text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={
                        addToLibraryMutation.isPending || inLibrary
                      }
                    >
                      {inLibrary ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <Plus className="mr-1 h-3 w-3" />
                      )}
                      {inLibrary ? 'In My Library' : 'Add to My Library'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {((tab === 'my' && myBooksData && myBooksData.totalPages > 1) ||
        (tab === 'public' && publicData && publicData.totalPages > 1)) && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-xs"
          >
            Previous
          </button>
          <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of{' '}
            {tab === 'my' ? myBooksData?.totalPages : publicData?.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={
              page ===
              (tab === 'my' ? myBooksData?.totalPages : publicData?.totalPages)
            }
            className="btn-secondary text-xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="h-40 bg-gray-200 dark:bg-gray-800" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message, action }: { message: string; action: string }) {
  return (
    <div className="card p-12 text-center">
      <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action}</p>
    </div>
  );
}
