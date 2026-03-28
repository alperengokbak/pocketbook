import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('pocketbook-theme', theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));

/** Call once at app startup, before React renders. */
export function initTheme() {
  const stored = localStorage.getItem('pocketbook-theme') as Theme | null;
  const theme = stored ?? 'system';
  const resolved = resolveTheme(theme);
  applyTheme(resolved);
  useThemeStore.setState({ theme, resolvedTheme: resolved });

  // Listen for OS theme changes when in "system" mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    const current = useThemeStore.getState().theme;
    if (current === 'system') {
      const newResolved = getSystemTheme();
      applyTheme(newResolved);
      useThemeStore.setState({ resolvedTheme: newResolved });
    }
  });
}
