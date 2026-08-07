"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const t = setTimeout(() => {
      const savedMode = localStorage.getItem("daylight-theme-mode") as ThemeMode | null;
      if (savedMode === "light" || savedMode === "dark") {
        setModeState(savedMode);
      } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        setModeState("light");
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("daylight-theme-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
