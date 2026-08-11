"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  
  const mode = theme === 'system' ? systemTheme : theme;
  const toggleMode = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  return {
    mode: mode || "dark",
    setMode: setTheme,
    toggleMode
  };
}
