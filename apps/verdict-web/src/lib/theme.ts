// Dark-mode theme: persisted to localStorage, defaults to the OS preference. The `dark` class is
// toggled on <html> so Tailwind's `dark:` variants apply.
export type Theme = 'light' | 'dark';

const KEY = 'verdict-theme';

export function getTheme(): Theme {
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(KEY, theme);
}

export function initTheme(): void {
  applyTheme(getTheme());
}
