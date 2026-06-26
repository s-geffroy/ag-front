import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { fr } from '../i18n/fr';

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
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-slate-300 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold">HDDE — {fr.auth.login}</h1>
        <p className="mt-1 text-xs text-slatewarn">{fr.app.private}</p>
        <label className="mt-4 block text-sm font-medium">{fr.auth.email}</label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <label className="mt-3 block text-sm font-medium">{fr.auth.password}</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-md bg-ink py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {fr.auth.signIn}
        </button>
      </form>
    </div>
  );
}
