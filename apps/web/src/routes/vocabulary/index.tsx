import { useState } from 'react';
import { Search, Trash2, Star, Languages } from 'lucide-react';
import { useVocabularyList, useRemoveVocabulary } from '@/hooks/useVocabulary';

export function VocabularyPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data, isLoading } = useVocabularyList({
    query: query || undefined,
    page,
    limit: 20,
    sortBy,
    sortOrder,
  });
  const removeMutation = useRemoveVocabulary();

  const getMasteryColor = (level: number) => {
    if (level >= 4) return 'text-green-500';
    if (level >= 2) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-300 dark:text-gray-600';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 4) return 'Mastered';
    if (level >= 2) return 'Learning';
    return 'New';
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vocabulary</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {data?.total || 0} words saved
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search words..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split('-');
            setSortBy(sb);
            setSortOrder(so);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="createdAt-desc">Newest first</option>
          <option value="createdAt-asc">Oldest first</option>
          <option value="masteryLevel-asc">Lowest mastery</option>
          <option value="masteryLevel-desc">Highest mastery</option>
          <option value="nextReviewAt-asc">Due for review</option>
        </select>
      </div>

      {/* Word List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card animate-pulse p-4">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="card p-12 text-center">
            <Languages className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              {query ? 'No words match your search' : 'No words saved yet'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click words while reading to translate them, then save to vocabulary
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.data.map((vocab) => (
              <div
                key={vocab.id}
                className="card flex items-center justify-between p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {vocab.translation.sourceWord}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {vocab.translation.targetWord}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < vocab.masteryLevel
                              ? getMasteryColor(vocab.masteryLevel)
                              : 'text-gray-200 dark:text-gray-700'
                          }`}
                          fill={i < vocab.masteryLevel ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${getMasteryColor(vocab.masteryLevel)}`}>
                      {getMasteryLabel(vocab.masteryLevel)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeMutation.mutate(vocab.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                    title="Remove from vocabulary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-xs"
          >
            Previous
          </button>
          <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.totalPages}
            className="btn-secondary text-xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
