export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'theme';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system';

// Storage can throw (blocked site data, private windows); the theme then simply doesn't persist.
export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignored: see readStoredTheme.
  }
}
