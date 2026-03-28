import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginPage } from '@/routes/auth/login';
import { RegisterPage } from '@/routes/auth/register';
import { DashboardPage } from '@/routes/dashboard';
import { LibraryPage } from '@/routes/library';
import { ReaderPage } from '@/routes/reader';
import { VocabularyPage } from '@/routes/vocabulary';
import { QuizPage } from '@/routes/quiz';

export default function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Reader (full screen, no sidebar) */}
      <Route path="/reader/:bookId" element={<ReaderPage />} />

      {/* Protected dashboard routes */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="quiz" element={<QuizPage />} />
      </Route>
    </Routes>
  );
}
