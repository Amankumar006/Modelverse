"use client";

import React from "react";
import { ExternalLink, ShieldCheck, FileText } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface SourcesSectionProps {
  model: ModelRow;
}

export default function SourcesSection({ model }: SourcesSectionProps) {
  const links = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;

  return (
    <section id="sources" className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <ShieldCheck size={16} />
        <span>Primary Sources &amp; Access Repositories</span>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed max-w-2xl">
        All specifications, parameters, and benchmark scores for <strong>{model.name}</strong> are audited against primary source release documentation, whitepapers, and verified vendor APIs.
      </p>

      <div className="flex flex-wrap gap-2.5 pt-2">
        {model.announcement_url && (
          <a
            href={model.announcement_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] border border-[var(--muted)]/15 transition-all font-medium"
          >
            <FileText size={13} className="text-[var(--accent)]" />
            <span>Official Announcement</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        )}

        {Object.entries(links).map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] border border-[var(--muted)]/15 transition-all capitalize font-medium"
          >
            <span>{key}</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        ))}
      </div>
    </section>
  );
}
