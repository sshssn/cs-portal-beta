import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing classes
    root.classList.remove('light', 'dark');

    // Always use light theme
    root.classList.add('light');
    setIsDark(false);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Override setTheme to always set light mode
  const setThemeOverride = (newTheme: Theme) => {
    // Always set to light regardless of input
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: setThemeOverride, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
