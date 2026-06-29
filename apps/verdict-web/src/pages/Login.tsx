import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { fr } from '../i18n/fr';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch {
      setError(fr.auth.invalid);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="w-full max-w-sm card shadow-sm">
        <h1 className="text-lg font-semibold">VERDICT — {fr.auth.login}</h1>
        <p className="mt-1 text-xs text-slatewarn dark:text-slate-400">{fr.app.private}</p>
        <label className="mt-4 block text-sm font-medium">{fr.auth.email}</label>
        <input
          type="text"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          required
        />
        <label className="mt-3 block text-sm font-medium">{fr.auth.password}</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          required
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn mt-5 w-full">
          {fr.auth.signIn}
        </button>
      </form>
    </div>
  );
}
