"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="max-w-md space-y-4">
        <div className="p-3 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] w-fit mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          Something went wrong
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          An unexpected error occurred while rendering this view. Please try refreshing or return home.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
          >
            <Home size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
