import type { ReactNode } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { fr } from './i18n/fr';
import { ThemeToggle } from './components/ThemeToggle';
import Login from './pages/Login';
import CasesList from './pages/CasesList';
import CaseWorkspace from './pages/CaseWorkspace';

function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            HDDE{' '}
            <span className="text-slatewarn dark:text-slate-400 font-normal">· {fr.app.title}</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slatewarn dark:text-slate-400">{user?.email}</span>
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="text-slate-600 hover:text-ink dark:text-slate-300 dark:hover:text-white"
            >
              {fr.auth.signOut}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-6 py-4 text-xs text-slatewarn dark:text-slate-400">
        {fr.app.private}
      </footer>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-slatewarn dark:text-slate-400">
        …
      </div>
    );
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<CasesList />} />
        <Route path="/cases/:id" element={<CaseWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
