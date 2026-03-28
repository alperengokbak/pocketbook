import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
