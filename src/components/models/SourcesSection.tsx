"use client";

import React from "react";
import { extractDomainSources } from "@/lib/model-normalization";
import { Link2, ExternalLink, FileText, Globe, Code, Shield, ArrowUpRight } from "lucide-react";

interface SourcesSectionProps {
  sources: unknown;
  links: unknown;
  developer?: string;
  modelName?: string;
}

export default function SourcesSection({ sources, links, modelName }: SourcesSectionProps) {
  const domainSources = extractDomainSources(sources, links);

  if (domainSources.length === 0) {
    return (
      <section id="sources" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Link2 size={14} />
          <span>Provenance &amp; Primary Documents</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          Sources &amp; Provenance
        </h2>
        <div className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-xs text-[var(--muted)]">
          No external research papers or primary source citations have been linked to this record yet.
        </div>
      </section>
    );
  }

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case "paper":
        return <FileText size={14} className="text-rose-400" />;
      case "github":
      case "huggingface":
        return <Code size={14} className="text-amber-400" />;
      case "system-card":
        return <Shield size={14} className="text-emerald-400" />;
      case "announcement":
        return <Globe size={14} className="text-blue-400" />;
      default:
        return <ExternalLink size={14} className="text-[var(--accent)]" />;
    }
  };

  return (
    <section id="sources" className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Link2 size={14} />
            <span>Verification &amp; Provenance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Sources &amp; Provenance
          </h2>
        </div>
        <span className="text-xs font-mono text-[var(--muted)] bg-[var(--card-bg)] px-2.5 py-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10 w-fit">
          {domainSources.length} Primary {domainSources.length === 1 ? "Citation" : "Citations"}
        </span>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Direct references, official documentation endpoints, evaluation papers, and launch announcements referenced for <strong className="text-[var(--text)]">{modelName || "this model"}</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {domainSources.map((source, idx) => (
          <a
            key={`${source.url}-${idx}`}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 hover:border-[var(--accent)] transition-all group flex items-start justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                {getSourceIcon(source.type)}
                <span className="font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {source.label}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] font-mono truncate">{source.domain}</p>
              <p className="text-[11px] text-[var(--muted)]/70 font-mono truncate">{source.url}</p>
            </div>

            <div className="shrink-0 p-1 rounded bg-[var(--bg)] border border-[var(--muted)]/10 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors mt-0.5">
              <ArrowUpRight size={13} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
