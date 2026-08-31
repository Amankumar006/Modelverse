"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="w-full h-screen flex flex-col items-center justify-center text-center px-4 bg-[var(--background, #000)]">
          <div className="max-w-md space-y-4">
            <div className="p-3 rounded-full bg-[var(--accent-soft, rgba(255,0,0,0.1))] text-[var(--accent, #ff0000)] w-fit mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text, #fff)] tracking-tight">
              Fatal System Error
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted, #999)] leading-relaxed">
              We encountered a critical failure. The service might be temporarily degraded. Please try again.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent, #333)] text-[var(--accent-contrast, #fff)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <RefreshCw size={14} /> Recover System
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
