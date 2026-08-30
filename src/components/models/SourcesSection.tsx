"use client";

import React from "react";
import { ExternalLink, ShieldCheck, FileText, Code2, Calendar } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface SourcesSectionProps {
  model: ModelRow;
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SourcesSection({ model }: SourcesSectionProps) {
  const rawLinks = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;

  const webLinks: [string, string][] = [];
  const metadataBadges: [string, string][] = [];

  for (const [key, value] of Object.entries(rawLinks)) {
    if (typeof value === "string" && isValidHttpUrl(value)) {
      webLinks.push([key, value]);
    } else if (value !== null && value !== undefined && String(value).trim()) {
      metadataBadges.push([key, String(value)]);
    }
  }

  return (
    <section id="sources" className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <ShieldCheck size={16} />
        <span>Primary Sources &amp; Access Repositories</span>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed max-w-2xl">
        All specifications, parameters, and benchmark scores for <strong>{model.name}</strong> are audited against primary source release documentation, whitepapers, and verified vendor APIs.
      </p>

      {/* Web & Repository Links */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {model.announcement_url && isValidHttpUrl(model.announcement_url) && (
          <a
            href={model.announcement_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] border border-[var(--muted)]/15 transition-all font-medium cursor-pointer"
          >
            <FileText size={13} className="text-[var(--accent)]" />
            <span>Official Announcement</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        )}

        {webLinks.map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] border border-[var(--muted)]/15 transition-all capitalize font-medium cursor-pointer"
          >
            <span>{key.replace(/_/g, " ")}</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        ))}
      </div>

      {/* Structured Technical Identifiers */}
      {metadataBadges.length > 0 && (
        <div className="pt-3 border-t border-[var(--muted)]/10 flex flex-wrap items-center gap-2 text-xs">
          {metadataBadges.map(([key, val]) => (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 text-[11px] text-[var(--muted)] font-mono"
            >
              {key.includes("api") ? <Code2 size={12} className="text-[var(--accent)]" /> : <Calendar size={12} className="text-[var(--accent)]" />}
              <span className="capitalize">{key.replace(/_/g, " ")}:</span>
              <strong className="text-[var(--text)] font-semibold">{val}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
