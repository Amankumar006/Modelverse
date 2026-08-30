import React from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="max-w-md space-y-4">
        <span className="text-4xl font-extrabold font-mono text-[var(--accent)]">404</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          The AI model or article you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
          >
            <Search size={14} /> Search Catalog
          </Link>
        </div>
      </div>
    </main>
  );
}
