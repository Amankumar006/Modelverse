"use client";

import React from "react";
import {
  ExternalLink,
  ShieldCheck,
  Layers,
  BookOpen,
  FileText,
  Terminal,
  Cpu,
  Globe,
  Code2,
  Calendar,
} from "lucide-react";
import type { ModelRow } from "@/types/database";
import { resolveModelLinks, type ResolvedModelLink } from "@/lib/model-links";

interface SourcesSectionProps {
  model: ModelRow;
}

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function getLinkIcon(type: ResolvedModelLink["type"]) {
  switch (type) {
    case "github":
      return <GithubIcon size={16} />;
    case "huggingface":
      return <Layers size={16} className="text-amber-500" />;
    case "docs":
      return <BookOpen size={16} className="text-blue-500" />;
    case "paper":
      return <FileText size={16} className="text-purple-500" />;
    case "ollama":
      return <Terminal size={16} className="text-emerald-500" />;
    case "openrouter":
      return <Cpu size={16} className="text-rose-500" />;
    case "website":
      return <Globe size={16} className="text-sky-500" />;
    default:
      return <ExternalLink size={16} className="text-[var(--accent)]" />;
  }
}

export default function SourcesSection({ model }: SourcesSectionProps) {
  const resolvedLinks = resolveModelLinks(model);
  const rawLinks = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, unknown>;

  const metadataBadges: [string, string][] = [];
  for (const [key, value] of Object.entries(rawLinks)) {
    if (typeof value !== "string" || !value.startsWith("http")) {
      if (value !== null && value !== undefined && String(value).trim()) {
        metadataBadges.push([key, String(value)]);
      }
    }
  }

  return (
    <section id="sources" className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <ShieldCheck size={16} />
        <span>Primary Sources &amp; Access Repositories</span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
        All technical specifications, parameter distributions, context architectures, and benchmark evaluations for <strong>{model.name}</strong> are audited against primary source release documentation, research whitepapers, and verified vendor API endpoints.
      </p>

      {/* Grid of Verified Web & Repository Links */}
      {resolvedLinks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {resolvedLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-[var(--radius-card)] bg-[var(--bg)] hover:bg-[var(--card-bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-md flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10 group-hover:scale-110 transition-transform shrink-0">
                  {getLinkIcon(link.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {link.label}
                  </h4>
                  <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                    {link.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                  </p>
                </div>
              </div>

              <ExternalLink size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          ))}
        </div>
      )}

      {/* Structured Technical Identifiers */}
      {metadataBadges.length > 0 && (
        <div className="pt-4 border-t border-[var(--muted)]/10 flex flex-wrap items-center gap-2 text-xs">
          {metadataBadges.map(([key, val]) => (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 text-[11px] text-[var(--muted)] font-mono"
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
