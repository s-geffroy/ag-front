import { useState } from 'react';

export type Theme = 'dark' | 'light';

/** Reads the theme already applied to <html> (set pre-paint in index.html) and toggles it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  );

  const toggle = () =>
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('ag-theme', next);
      } catch {
        /* ignore storage failures */
      }
      return next;
    });

  return { theme, toggle };
}
