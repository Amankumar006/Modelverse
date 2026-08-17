"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface QuickstartSectionProps {
  quickstart: Record<string, string>;
}

export default function QuickstartSection({ quickstart }: QuickstartSectionProps) {
  const entries = Object.entries(quickstart).filter(
    ([, code]) => typeof code === "string" && code.trim().length > 0
  );
  const [selectedLang, setSelectedLang] = useState<string>(entries[0]?.[0] || "python");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (entries.length === 0) return null;

  const currentCode = quickstart[selectedLang] || entries[0][1];

  const handleCopy = (key: string, code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getLanguageLabel = (key: string) => {
    const map: Record<string, string> = {
      python: "Python",
      javascript: "JavaScript",
      typescript: "TypeScript",
      curl: "cURL",
      bash: "Bash",
      json: "JSON",
      go: "Go",
      rust: "Rust",
    };
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <p className="text-xs text-[var(--muted)]">
          Ready-to-run implementation code snippet for inference and integration.
        </p>
        {entries.length > 1 && (
          <div className="flex gap-1.5 p-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/10 w-fit">
            {entries.map(([key]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedLang(key)}
                className={`px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                  selectedLang === key
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {getLanguageLabel(key)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg)]/80 border-b border-[var(--muted)]/10 text-xs">
          <span className="font-mono font-bold text-[var(--text)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            {getLanguageLabel(selectedLang)}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(selectedLang, currentCode)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
          >
            {copiedKey === selectedLang ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-[var(--muted)]" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre font-normal selection:bg-[var(--accent-soft)]">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
