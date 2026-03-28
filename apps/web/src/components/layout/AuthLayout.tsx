import { Outlet, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

export function AuthLayout() {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/20">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Pocketbook</h1>
        <p className="mt-1 text-sm text-gray-500">
          Read books, learn words
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
