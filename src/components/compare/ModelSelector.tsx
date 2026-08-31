"use client";

import React from "react";
import { ModelRow } from "@/types/models";

export function ModelSelector({
  models,
  selectedSlug,
  onSelect,
  label,
}: {
  models: ModelRow[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
        {label}
      </label>
      <select
        className="w-full p-2.5 rounded-md border border-[var(--muted)]/20 bg-[var(--card-bg)] text-[var(--text)] text-sm shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
        value={selectedSlug || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-- Select a Model --</option>
        {models.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.provider} - {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
