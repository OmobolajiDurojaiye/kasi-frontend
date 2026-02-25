import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'bfm-theme';

/* ── Available Themes ─────────────────────────────── */
export const THEMES = [
  { id: 'light',           name: 'Light',         emoji: '☀️',  body: '#FFFFFF', card: '#FFFFFF', accent: '#0F8C55', isDark: false },
  { id: 'sepia',           name: 'Sepia',          emoji: '📜',  body: '#faf6f1', card: '#f5efe6', accent: '#92713a', isDark: false },
  { id: 'dark',            name: 'Dark',           emoji: '🌑',  body: '#1e1e1e', card: '#272727', accent: '#34d399', isDark: true },
  { id: 'midnight-blue',   name: 'Midnight Blue',  emoji: '🌌',  body: '#0f172a', card: '#1e293b', accent: '#38bdf8', isDark: true },
  { id: 'purple-night',    name: 'Purple Night',   emoji: '💜',  body: '#1a1025', card: '#271d35', accent: '#c084fc', isDark: true },
  { id: 'ocean-dark',      name: 'Ocean Dark',     emoji: '🌊',  body: '#0d1b2a', card: '#172a3a', accent: '#2dd4bf', isDark: true },
  { id: 'warm-dark',       name: 'Warm Dark',      emoji: '🔥',  body: '#1c1917', card: '#292524', accent: '#fb923c', isDark: true },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('dark', ...THEMES.map(t => `theme-${t.id}`));

    const current = THEMES.find(t => t.id === theme);

    // Apply dark class for all dark themes (reuses existing .dark CSS rules as base)
    if (current?.isDark) {
      root.classList.add('dark');
    }

    // Apply specific theme class (except for default light & dark which don't need extra)
    if (theme !== 'light' && theme !== 'dark') {
      root.classList.add(`theme-${theme}`);
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const isDark = currentTheme.isDark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark, currentTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export default ThemeContext;
