import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ReactReader } from 'react-reader';
import type { Contents, Rendition } from 'epubjs';
import { useBookContent, useUpdateProgress } from '@/hooks/useBooks';
import { useTranslate } from '@/hooks/useTranslation';
import { useAddVocabulary } from '@/hooks/useVocabulary';
import { TranslationPopup } from '@/components/reader/TranslationPopup';

interface TranslationState {
  word: string;
  translation: string | null;
  translationId: string | null;
  isLoading: boolean;
  isSaved: boolean;
  position: { x: number; y: number };
}

export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { data: bookContent, isLoading } = useBookContent(bookId!);
  const translateMutation = useTranslate();
  const addVocabMutation = useAddVocabulary();
  const updateProgressMutation = useUpdateProgress();
  const [translationState, setTranslationState] = useState<TranslationState | null>(null);
  const [location, setLocation] = useState<string | number>(0);
  const renditionRef = useRef<Rendition | null>(null);

  // Set initial position from saved progress
  useEffect(() => {
    if (bookContent?.currentPosition) {
      setLocation(bookContent.currentPosition);
    }
  }, [bookContent?.currentPosition]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-translation-popup]')) {
        setTranslationState(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleWordClick = useCallback(
    async (word: string, event: { clientX: number; clientY: number }) => {
      const cleanWord = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
      if (!cleanWord || cleanWord.length < 2) return;

      setTranslationState({
        word: cleanWord,
        translation: null,
        translationId: null,
        isLoading: true,
        isSaved: false,
        position: { x: event.clientX, y: event.clientY },
      });

      try {
        const result = await translateMutation.mutateAsync({ word: cleanWord });
        setTranslationState((prev) =>
          prev?.word === cleanWord
            ? {
                ...prev,
                translation: result.targetWord,
                translationId: result.id,
                isLoading: false,
              }
            : prev,
        );
      } catch {
        setTranslationState((prev) =>
          prev?.word === cleanWord
            ? { ...prev, translation: 'Translation failed', isLoading: false }
            : prev,
        );
      }
    },
    [translateMutation],
  );

  const handleSaveVocabulary = useCallback(async () => {
    if (!translationState?.translationId) return;
    try {
      await addVocabMutation.mutateAsync(translationState.translationId);
      setTranslationState((prev) => (prev ? { ...prev, isSaved: true } : null));
    } catch {
      // Word might already be saved
    }
  }, [translationState, addVocabMutation]);

  const handleLocationChanged = useCallback(
    (newLocation: string) => {
      setLocation(newLocation);

      // Calculate progress from the rendition
      if (renditionRef.current) {
        const currentLocation = renditionRef.current.currentLocation() as {
          start?: { percentage?: number };
        };
        const progress = (currentLocation?.start?.percentage ?? 0) * 100;

        updateProgressMutation.mutate({
          bookId: bookId!,
          progress,
          currentPosition: newLocation,
        });
      }
    },
    [bookId, updateProgressMutation],
  );

  const handleRendition = useCallback(
    (rendition: Rendition) => {
      renditionRef.current = rendition;

      // Style the epub content
      rendition.themes.default({
        body: {
          'font-family': '"Merriweather", Georgia, serif !important',
          'line-height': '1.8 !important',
          color: '#1f2937 !important',
        },
        p: {
          'margin-bottom': '0.8em !important',
        },
      });

      // Handle text selection / word clicks inside the epub iframe
      rendition.on('selected', (cfiRange: string, contents: Contents) => {
        const selection = contents.window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.split(/\s+/).length === 1) {
          // Single word selected — get the position
          const range = selection?.getRangeAt(0);
          if (range) {
            const rect = range.getBoundingClientRect();
            // The rect is relative to the iframe — offset it to the main window
            const iframe = document.querySelector('iframe');
            const iframeRect = iframe?.getBoundingClientRect();
            const x = (iframeRect?.left ?? 0) + rect.left;
            const y = (iframeRect?.top ?? 0) + rect.bottom;

            handleWordClick(selectedText, { clientX: x, clientY: y });
          }

          // Clear selection so it doesn't interfere with next click
          selection?.removeAllRanges();
        }
      });

      // Also handle single clicks on words (no drag selection)
      rendition.on('click', (e: MouseEvent) => {
        // Close translation popup if clicking elsewhere
        setTranslationState(null);
      });
    },
    [handleWordClick],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 animate-pulse text-primary-400" />
          <p className="mt-3 text-sm text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!bookContent) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <BookOpen className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Book not found</p>
        <Link to="/library" className="btn-primary mt-4">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Reader Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <Link
          to="/library"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {bookContent.metadata.title}
          </h1>
          {bookContent.metadata.author && (
            <p className="text-xs text-gray-500">{bookContent.metadata.author}</p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(bookContent.progress)}%
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-1 bg-primary-500 transition-all duration-300"
          style={{ width: `${bookContent.progress}%` }}
        />
      </div>

      {/* Book Content Area */}
      <div className="flex-1 relative">
        {bookContent.format === 'EPUB' ? (
          <div className="h-full">
            <ReactReader
              url={bookContent.fileUrl}
              location={location}
              locationChanged={handleLocationChanged}
              getRendition={handleRendition}
              showToc={true}
              epubOptions={{
                allowPopups: true,
                allowScriptedContent: true,
              }}
              loadingView={
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="mx-auto h-10 w-10 animate-pulse text-primary-400" />
                    <p className="mt-2 text-sm text-gray-400">Opening book...</p>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <PdfPlaceholder fileUrl={bookContent.fileUrl} />
        )}
      </div>

      {/* Translation Popup */}
      {translationState && (
        <div data-translation-popup>
          <TranslationPopup
            word={translationState.word}
            translation={translationState.translation}
            translationId={translationState.translationId}
            isLoading={translationState.isLoading}
            isSaved={translationState.isSaved}
            isSaving={addVocabMutation.isPending}
            position={translationState.position}
            onSave={handleSaveVocabulary}
            onClose={() => setTranslationState(null)}
          />
        </div>
      )}
    </div>
  );
}

function PdfPlaceholder({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-gray-400">
        <BookOpen className="mx-auto h-16 w-16 mb-4" />
        <p className="text-lg font-medium">PDF Reader</p>
        <p className="text-sm mt-2">
          PDF rendering is coming soon. For now, please use EPUB books.
        </p>
        <p className="text-xs mt-4 text-gray-300">File: {fileUrl}</p>
      </div>
    </div>
  );
}
