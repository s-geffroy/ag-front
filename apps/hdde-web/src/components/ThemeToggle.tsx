import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getTheme, type Theme } from '../lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }
  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
