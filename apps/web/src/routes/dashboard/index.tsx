import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Languages,
  Brain,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useMyBooks } from '@/hooks/useBooks';

interface VocabStats {
  total: number;
  toReview: number;
  mastered: number;
}

export function DashboardPage() {
  const { data: booksData } = useMyBooks(1, 4);
  const { data: vocabStats } = useQuery({
    queryKey: ['vocab-stats'],
    queryFn: () => api.get<VocabStats>('/vocabulary/stats'),
  });

  const recentBooks = booksData?.data || [];
  const stats = vocabStats || { total: 0, toReview: 0, mastered: 0 };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Your reading and learning overview
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Books"
          value={booksData?.total || 0}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Languages}
          label="Words Learned"
          value={stats.total}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Brain}
          label="Words to Review"
          value={stats.toReview}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Mastered"
          value={stats.mastered}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Continue Reading */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Continue Reading</h2>
          <Link
            to="/library"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="mt-4 card p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No books yet. Upload a book or browse the library to get started.
            </p>
            <Link to="/library" className="btn-primary mt-4 inline-flex">
              Browse Library
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentBooks.map((ub) => (
              <Link
                key={ub.id}
                to={`/reader/${ub.bookId}`}
                className="card overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                  <BookOpen className="h-12 w-12 text-primary-400" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {ub.book.title}
                  </h3>
                  {ub.book.author && (
                    <p className="mt-0.5 text-xs text-gray-500">{ub.book.author}</p>
                  )}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{Math.round(ub.progress)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
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
        )}
      </div>

      {/* Quick Actions */}
      {stats.toReview > 0 && (
        <div className="mt-8 card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                You have {stats.toReview} words ready for review
              </p>
              <p className="text-sm text-gray-500">
                Practice now to strengthen your vocabulary
              </p>
            </div>
            <Link to="/quiz" className="btn-primary">
              Start Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
