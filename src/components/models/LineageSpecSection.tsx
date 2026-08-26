"use client";

import React from "react";
import Link from "next/link";
import { type ModelEntry } from "@/lib/models";
import { formatParameters, getModalities, formatContextWindow } from "@/lib/model-format";
import { GitFork, ArrowRight, ExternalLink, Cpu, Layers, ShieldCheck, Tag } from "lucide-react";

interface LineageSpecSectionProps {
  model: ModelEntry;
}

export default function LineageSpecSection({ model }: LineageSpecSectionProps) {
  // Format parameters and active parameters
  const paramsStr = formatParameters(model);
  const activeParams =
    model.activeParameters && model.activeParameters !== "Undisclosed" && model.activeParameters !== "Unknown"
      ? typeof model.activeParameters === "object"
        ? Object.values(model.activeParameters).join(" / ")
        : String(model.activeParameters)
      : null;

  // Format context window
  const contextWindowStr = formatContextWindow(model.contextWindow);

  // Format license
  const licenseStr =
    model.license && typeof model.license === "object"
      ? (model.license as { name?: string; weights?: { name?: string } }).name ||
        (model.license as { name?: string; weights?: { name?: string } }).weights?.name ||
        "Custom"
      : model.license || "Not specified";

  // Modalities & Deployment
  const modalities = getModalities(model.modality);
  const deployment = Array.isArray(model.deployment) && model.deployment.length > 0 ? model.deployment : ["Not specified"];

  // Lineage tags (e.g. base:slug, arxiv:id)
  const lineageTags = (model.tags || []).filter((tag) => tag.startsWith("base:") || tag.startsWith("arxiv:") || tag.startsWith("lineage:"));
  const regularTags = (model.tags || []).filter((tag) => !tag.startsWith("base:") && !tag.startsWith("arxiv:") && !tag.startsWith("lineage:"));

  return (
    <section id="lineage-spec" className="section-anchor space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <GitFork size={14} />
            <span>Architecture &amp; Lineage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Model lineage &amp; specification
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--muted)] bg-[var(--card-bg)] px-2.5 py-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10">
            {model.developer}
          </span>
          {model.family && (
            <Link
              href={`/models/family/${encodeURIComponent(model.family)}`}
              className="text-xs font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1 bg-[var(--accent-soft)]/40 px-2.5 py-1 rounded-[var(--radius-control)]"
            >
              Family: {model.family}
              <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Technical architectural specifications, context capacities, parameter distributions, and historical lineage relationships tracked for <strong className="text-[var(--text)]">{model.name}</strong>.
      </p>

      {/* 2-Column Grid: Left Lineage Graph, Right Key Technical Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lineage Card */}
        <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-5 border border-[var(--muted)]/10 space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] border-b border-[var(--muted)]/10 pb-2.5 flex items-center justify-between">
            <span>Model Ancestry &amp; Lineage</span>
            <span className="text-[10px] font-mono font-normal">Release: {model.releaseDate || "Undisclosed"}</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Current Model */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Current Model</span>
              <span className="font-bold text-[var(--text)]">{model.name}</span>
            </div>

            {/* Family */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Model Family</span>
              {model.family ? (
                <Link
                  href={`/models/family/${encodeURIComponent(model.family)}`}
                  className="font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  {model.family}
                  <ExternalLink size={11} />
                </Link>
              ) : (
                <span className="text-[var(--muted)]">Standalone release</span>
              )}
            </div>

            {/* Product Tier */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Product Tier</span>
              <span className="font-semibold text-[var(--text)]">{model.tier || "Standard / Flagship"}</span>
            </div>

            {/* Previous Version */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Previous Version</span>
              {model.previousVersion ? (
                <Link
                  href={`/models/${model.previousVersion}`}
                  className="font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  {model.previousVersion}
                  <ArrowRight size={11} />
                </Link>
              ) : (
                <span className="text-[var(--muted)]">None (initial generation)</span>
              )}
            </div>

            {/* Base Model */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Base / Parent Model</span>
              {model.baseModel ? (
                <Link
                  href={`/models/${model.baseModel}`}
                  className="font-mono text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  {model.baseModel}
                  <ArrowRight size={11} />
                </Link>
              ) : (
                <span className="text-[var(--muted)]">Base foundation</span>
              )}
            </div>

            {/* Status & Model Type */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[var(--muted)] font-medium">Lifecycle &amp; Access</span>
              <div className="flex items-center gap-2">
                <span className="capitalize text-[var(--text)] font-semibold">{model.type.replace(/-/g, " ")}</span>
                <span className="text-[var(--muted)]">•</span>
                <span className="capitalize text-[var(--accent)] font-semibold">{model.status || "Active"}</span>
              </div>
            </div>
          </div>

          {/* Lineage / arXiv Tags */}
          {lineageTags.length > 0 && (
            <div className="pt-2 border-t border-[var(--muted)]/10 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] block">
                Lineage &amp; Research Citations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lineageTags.map((tag) => {
                  if (tag.startsWith("arxiv:")) {
                    const arxivId = tag.replace("arxiv:", "");
                    return (
                      <a
                        key={tag}
                        href={`https://arxiv.org/abs/${arxivId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono hover:underline"
                      >
                        <Tag size={10} />
                        arXiv:{arxivId}
                      </a>
                    );
                  }
                  if (tag.startsWith("base:")) {
                    const baseSlug = tag.replace("base:", "");
                    return (
                      <Link
                        key={tag}
                        href={`/models/${baseSlug}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--muted)]/10 text-[11px] font-mono hover:text-[var(--accent)]"
                      >
                        <Tag size={10} />
                        base:{baseSlug}
                      </Link>
                    );
                  }
                  return (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--muted)]/10 text-[11px] font-mono"
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Specifications Card */}
        <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-5 border border-[var(--muted)]/10 space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] border-b border-[var(--muted)]/10 pb-2.5 flex items-center justify-between">
            <span>Hardware &amp; Execution Specs</span>
            <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">{model.primaryTask?.replace(/-/g, " ")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Parameters */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                <Cpu size={13} className="text-[var(--muted)]" />
                Parameter Count
              </span>
              <span className="font-mono tabular-nums font-bold text-[var(--text)]">{paramsStr}</span>
            </div>

            {/* Active Parameters (MoE) */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Active Parameters (MoE)</span>
              <span className="font-mono tabular-nums text-[var(--text)] font-semibold">{activeParams || "Dense / All active"}</span>
            </div>

            {/* Context Window */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                <Layers size={13} className="text-[var(--muted)]" />
                Context Window
              </span>
              <span className="font-mono tabular-nums font-bold text-[var(--text)]">{contextWindowStr}</span>
            </div>

            {/* Modalities */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Supported Modalities</span>
              <div className="flex gap-1.5">
                {modalities.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--muted)]/10 font-mono text-[11px] capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Deployment */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium">Deployment Formats</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                {deployment.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)]/30 text-[var(--accent)] font-medium text-[11px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* License */}
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[var(--muted)]" />
                License
              </span>
              <span className="font-bold text-[var(--text)]">{licenseStr}</span>
            </div>

            {/* ChatGPT Availability (if defined) */}
            {model.chatgptAvailability && (
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--muted)]/10">
                <span className="text-[var(--muted)] font-medium">ChatGPT Access</span>
                <span className="text-xs font-semibold text-[var(--text)] text-right">
                  {(() => {
                    const c = model.chatgptAvailability as { status?: string; plans?: string[]; access?: string };
                    if (c.status === "active") {
                      return `Active (${Array.isArray(c.plans) ? c.plans.join(", ") : c.access || "Available"})`;
                    }
                    if (c.status === "retired") {
                      return "API Only (Retired from ChatGPT)";
                    }
                    return "Not available";
                  })()}
                </span>
              </div>
            )}

            {/* API Availability (if defined) */}
            {model.apiAvailability && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[var(--muted)] font-medium">API Endpoint ID</span>
                <span className="text-xs font-mono font-bold text-[var(--accent)]">
                  {String((model.apiAvailability as { apiModelId?: string }).apiModelId || model.slug)}
                </span>
              </div>
            )}
          </div>

          {/* Canonical Aliases */}
          {model.aliases && model.aliases.length > 0 && (
            <div className="pt-2 border-t border-[var(--muted)]/10 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] block">
                Canonical Aliases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {model.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)]/20 text-[var(--accent)] border border-[var(--accent)]/30 text-[11px] font-mono font-medium"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regular Tags */}
          {regularTags.length > 0 && (
            <div className="pt-2 border-t border-[var(--muted)]/10 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] block">
                Capability &amp; Index Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {regularTags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--bg)] text-[var(--muted)] border border-[var(--muted)]/10 text-[11px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
