import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Upload,
  BookOpen,
  Plus,
  Check,
  FileText,
  Eye,
  X,
  Lock,
} from 'lucide-react';
import {
  useMyBooks,
  useLibrary,
  useUploadBook,
  useAddToLibrary,
  useMyLibraryBookIds,
} from '@/hooks/useBooks';
import { useDebounce } from '@/hooks/useDebounce';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import type { Rendition } from 'epubjs';
import { useThemeStore } from '@/stores/theme.store';

export function LibraryPage() {
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewBook, setPreviewBook] = useState<{
    id: string;
    title: string;
    author: string | null;
    format: string;
    fileSize: number;
    fileUrl: string;
    createdAt: string;
  } | null>(null);

  const { data: myBooksData, isLoading: loadingMyBooks } = useMyBooks(page, 12);
  const { data: publicData, isLoading: loadingPublic } = useLibrary(debouncedSearchQuery, page, 12);
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myBooksData?.data.map((ub) => (
                <Link
                  key={ub.id}
                  to={`/reader/${ub.bookId}`}
                  className="card group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                    <BookOpen className="h-14 w-14 text-primary-400/80 transition-transform duration-200 group-hover:scale-110 dark:text-primary-300/80" />
                    <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-600 backdrop-blur-sm dark:bg-gray-900/80 dark:text-gray-400">
                      <FileText className="mr-1 h-2.5 w-2.5" />
                      {ub.book.format}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-gray-100">
                      {ub.book.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1 dark:text-gray-400">
                      {ub.book.author || 'Unknown author'}
                    </p>
                    <div className="mt-auto pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{Math.round(ub.progress)}% read</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-1.5 rounded-full bg-primary-500 transition-all"
                          style={{ width: `${ub.progress}%` }}
                        />
                      </div>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publicData?.data.map((book) => {
              const inLibrary = myLibraryBookIds?.has(book.id) ?? false;
              return (
                <div
                  key={book.id}
                  className="card group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setPreviewBook(book)}
                >
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                    <BookOpen className="h-14 w-14 text-primary-400/80 transition-transform duration-200 group-hover:scale-110 dark:text-primary-300/80" />
                    <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gray-600 backdrop-blur-sm dark:bg-gray-900/80 dark:text-gray-400">
                      <FileText className="mr-1 h-2.5 w-2.5" />
                      {book.format}
                    </span>
                    {/* Preview hint */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10 dark:group-hover:bg-black/20">
                      <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-800/90 dark:text-gray-300">
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-gray-100">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1 dark:text-gray-400">
                      {book.author || 'Unknown author'}
                    </p>
                    <div className="mt-auto pt-3">
                      {inLibrary ? (
                        <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                          <Check className="h-3.5 w-3.5" />
                          In My Library
                        </span>
                      ) : (
                        <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <Eye className="h-3.5 w-3.5" />
                          Click to preview
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Preview Modal */}
      {previewBook && (
        <BookPreviewModal
          book={previewBook}
          inLibrary={myLibraryBookIds?.has(previewBook.id) ?? false}
          isAdding={addToLibraryMutation.isPending}
          onAdd={() => addToLibraryMutation.mutate(previewBook.id)}
          onClose={() => setPreviewBook(null)}
        />
      )}

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

function BookPreviewModal({
  book,
  inLibrary,
  isAdding,
  onAdd,
  onClose,
}: {
  book: { id: string; title: string; author: string | null; format: string; fileSize: number; fileUrl: string; createdAt: string };
  inLibrary: boolean;
  isAdding: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const [previewLocation, setPreviewLocation] = useState<string | number | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const MAX_PREVIEW_PAGES = 10;
  const previewLocked = pageCount >= MAX_PREVIEW_PAGES;
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const [startPreview, setStartPreview] = useState(false);

  const customStyles = useMemo(() => ({
    ...ReactReaderStyle,
    container: {
      ...ReactReaderStyle.container,
      overflow: 'hidden',
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      backgroundColor: isDark ? '#1e2433' : '#faf8f4',
      transition: 'none',
    },
    reader: {
      ...ReactReaderStyle.reader,
      top: 16,
      left: 32,
      bottom: 16,
      right: 32,
    },
    arrow: {
      ...ReactReaderStyle.arrow,
      color: isDark ? '#a5b4c8' : '#4b5563',
      fontSize: 32 as unknown as string, // Cast to string since ReactReaderStyle types mismatch sometimes
    },
    titleArea: { ...ReactReaderStyle.titleArea, display: 'none' },
    tocButton: { ...ReactReaderStyle.tocButton, display: 'none' },
  }), [isDark]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Side Panel — slides in from right */}
      <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Top bar — book info + close */}
        <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          {/* Book icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          {/* Title + meta */}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold leading-tight text-gray-900 line-clamp-2 dark:text-gray-100">
              {book.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {book.author || 'Unknown author'}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <FileText className="h-2.5 w-2.5" />
                {book.format}
              </span>
              <span>{formatFileSize(book.fileSize)}</span>
            </div>
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* EPUB Reader Preview — takes all remaining height */}
        {book.format === 'EPUB' ? (
          <div className="relative flex-1" style={{ backgroundColor: isDark ? '#1e2433' : '#faf8f4' }}>
            {!startPreview ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <BookOpen className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-gray-100">Ready to preview</h3>
                <p className="mt-1 max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading the book file may take a moment depending on your connection.
                </p>
                <button
                  onClick={() => setStartPreview(true)}
                  className="btn-primary mt-6 px-6 py-2.5 shadow-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Load Preview
                </button>
              </div>
            ) : (
              <>
                <ReactReader
                  url={book.fileUrl}
                  location={previewLocation}
                  locationChanged={(loc: string) => {
                    if (!previewLocked) {
                      setPreviewLocation(loc);
                      // Don't count the initial chapter skip as a page turn
                      if (initialLocationSet) {
                        setPageCount((c) => c + 1);
                      }
                    }
                  }}
                  showToc={false}
                  readerStyles={customStyles}
                  getRendition={(rendition: Rendition) => {
                    rendition.themes.default({
                      body: {
                        'font-family': '"Merriweather", Georgia, serif !important',
                        'line-height': '1.8 !important',
                        'font-size': '15px !important',
                        color: isDark ? '#e2e8f0 !important' : '#1f2937 !important',
                        background: isDark ? '#1e2433 !important' : '#faf8f4 !important',
                        padding: '0 !important',
                      },
                      'p, span, div, h1, h2, h3, h4, h5, h6, li, a': {
                        color: isDark ? '#e2e8f0 !important' : '#1f2937 !important',
                      },
                      a: { color: isDark ? '#93b4e8 !important' : '#4f46e5 !important' },
                    });

                    // Skip to first real chapter (past cover, license, TOC)
                    if (!initialLocationSet) {
                      rendition.book.loaded.navigation.then((nav) => {
                        const toc = nav.toc || [];
                        // Look for first entry that looks like actual chapter content
                        const chapterPattern = /^(chapter|letter|part)\s/i;
                        const numberedChapter = /^[IVXLC]+\.\s+[A-Z]/; // "I. A SCANDAL..."
                        const firstChapter = toc.find((item) => {
                          const label = item.label.trim();
                          return chapterPattern.test(label) || numberedChapter.test(label);
                        });
                        // Fallback: skip at least the first 2 entries (cover + title/contents)
                        const target = firstChapter || toc[Math.min(2, toc.length - 1)];
                        if (target?.href) {
                          rendition.display(target.href);
                          setInitialLocationSet(true);
                        }
                      });
                    }
                  }}
                  loadingView={
                    <div className="flex h-full flex-col items-center justify-center">
                      <BookOpen className="mb-4 h-10 w-10 animate-pulse text-primary-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading epub...</p>
                    </div>
                  }
                />

                {/* Lock overlay when preview limit reached */}
                {previewLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md dark:bg-gray-950/95">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20">
                      <Lock className="h-7 w-7 text-primary-500 dark:text-primary-400" />
                    </div>
                    <p className="mt-4 text-base font-bold text-gray-900 dark:text-white">Preview limit reached</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add this book to your library to keep reading</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">PDF preview not available</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Add to your library to read</p>
            </div>
          </div>
        )}

        {/* Bottom bar — progress + action */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 dark:border-gray-800">
          {/* Page progress */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_PREVIEW_PAGES }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < pageCount
                      ? 'w-3.5 bg-primary-500'
                      : i === pageCount
                        ? 'w-3.5 bg-primary-300 dark:bg-primary-700'
                        : 'w-1.5 bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {pageCount}/{MAX_PREVIEW_PAGES}
            </span>
          </div>

          {/* Action button */}
          {inLibrary ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-4 py-2 text-xs font-semibold text-green-600 dark:bg-green-950 dark:text-green-400">
              <Check className="h-3.5 w-3.5" />
              In Library
            </span>
          ) : (
            <button
              onClick={onAdd}
              disabled={isAdding}
              className="btn-primary rounded-lg px-4 py-2 text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {isAdding ? 'Adding...' : 'Add to Library'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
