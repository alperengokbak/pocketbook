import { X, Plus, Check } from 'lucide-react';

interface TranslationPopupProps {
  word: string;
  translation: string | null;
  translationId: string | null;
  isLoading: boolean;
  isSaved: boolean;
  isSaving: boolean;
  position: { x: number; y: number };
  onSave: () => void;
  onClose: () => void;
}

export function TranslationPopup({
  word,
  translation,
  isLoading,
  isSaved,
  isSaving,
  position,
  onSave,
  onClose,
}: TranslationPopupProps) {
  return (
    <div
      className="fixed z-50 animate-in fade-in slide-in-from-bottom-2"
      style={{
        left: Math.min(position.x, window.innerWidth - 260),
        top: position.y + 10,
      }}
    >
      <div className="w-60 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Translation</span>
          <button
            onClick={onClose}
            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-3 py-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{word}</p>
          {isLoading ? (
            <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : (
            <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">{translation}</p>
          )}
        </div>

        {!isLoading && translation && (
          <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-700">
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Check className="h-3.5 w-3.5" />
                Saved to vocabulary
              </span>
            ) : (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
              >
                <Plus className="h-3.5 w-3.5" />
                {isSaving ? 'Saving...' : 'Save to vocabulary'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
