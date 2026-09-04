"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("modelverse-cookie-consent");
      if (!consent) {
        // Small delay so it doesn't pop up immediately upon first frame
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("modelverse-cookie-consent", "accepted");
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("modelverse-cookie-consent", "dismissed");
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-rise p-4 sm:p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--muted)]/20 shadow-2xl space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
          <Cookie size={16} className="text-amber-500 shrink-0" />
          <span>Cookie &amp; Privacy Preferences</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
          aria-label="Close consent banner"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed">
        TheModelverse uses cookies and trusted partners like Google to optimize performance, measure traffic, and serve relevant advertising. See our{" "}
        <Link href="/privacy" className="text-[var(--accent)] underline font-medium">
          Privacy Policy
        </Link>.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-[var(--radius-control)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity btn-tactile cursor-pointer shadow-sm"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
