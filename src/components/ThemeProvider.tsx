"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";
type ViewMode = "public" | "curator";

interface ThemeContextType {
  mode: ThemeMode;
  view: ViewMode;
  toggleMode: () => void;
  toggleView: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [view, setViewState] = useState<ViewMode>("public");

  useEffect(() => {
    const savedMode = localStorage.getItem("daylight-theme-mode") as ThemeMode | null;
    if (savedMode === "light" || savedMode === "dark") {
      setModeState(savedMode);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setModeState("light");
    }
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

  const toggleView = () => {
    setViewState((prev) => (prev === "public" ? "curator" : "public"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, view, toggleMode, toggleView, setMode }}>
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
