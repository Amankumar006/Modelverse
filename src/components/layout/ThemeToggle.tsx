"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { mode, toggleMode } = useTheme();

  if (!isMounted) {
    return (
      <div
        className={`p-2 rounded-[var(--radius-pill)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-[var(--muted)] border border-[var(--muted)]/10 w-[33px] h-[33px] flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        <span className="w-3.5 h-3.5" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleMode}
      className={`p-2 rounded-[var(--radius-pill)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-[var(--muted)] hover:text-[var(--text)] transition-all flex items-center justify-center cursor-pointer border border-[var(--muted)]/10 ${className}`}
      title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme mode"
    >
      {mode === "dark" ? (
        <Sun size={15} className="text-amber-400" />
      ) : (
        <Moon size={15} className="text-indigo-600" />
      )}
    </button>
  );
}
