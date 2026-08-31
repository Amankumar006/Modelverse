"use client";

import React from "react";
import Link from "next/link";
import { ModelRow } from "@/types/models";

export function CatalogTableFallback({ models }: { models: ModelRow[] }) {
  if (models.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 p-8">
        <p className="text-sm font-semibold text-[var(--text)]">No models available for comparison yet</p>
        <p className="text-xs text-[var(--muted)] mt-1">Models will appear here once seeded or ingested.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] mt-8">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-[var(--muted)]/10 bg-[var(--accent-soft)]/20 text-[var(--text)]">
            <th className="p-4 font-bold">Model</th>
            <th className="p-4 font-bold">Provider</th>
            <th className="p-4 font-bold">Context Window</th>
            <th className="p-4 font-bold">Parameters</th>
            <th className="p-4 font-bold">Category</th>
            <th className="p-4 font-bold">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--muted)]/10 text-[var(--text)]">
          {models.map((m) => (
            <tr key={m.id} className="hover:bg-[var(--bg)] transition-colors">
              <td className="p-4 font-semibold">{m.name}</td>
              <td className="p-4 text-[var(--accent)] font-medium">{m.provider}</td>
              <td className="p-4 font-mono tabular-nums">
                {m.context_window ? `${m.context_window.toLocaleString("en-US")} tokens` : "Standard"}
              </td>
              <td className="p-4 font-mono">{m.parameters || "Proprietary"}</td>
              <td className="p-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase">
                  {m.category || "LLM"}
                </span>
              </td>
              <td className="p-4">
                <Link
                  href={`/models/${m.slug}`}
                  className="text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  View Specs &rarr;
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
