"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, ChevronRight, ArrowRight, Sparkles, Layers, ShieldCheck, Cpu } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { resolveModelLineage } from "@/lib/lineage";

interface ModelLineageTreeProps {
  model: ModelRow;
  allModels: ModelRow[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Pre-2024";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export default function ModelLineageTree({ model, allModels }: ModelLineageTreeProps) {
  const lineage = resolveModelLineage(model, allModels);
  const { family, generation, predecessors, successors, siblings, distillations } = lineage;

  const hasLineage = predecessors.length > 0 || successors.length > 0 || siblings.length > 0 || distillations.length > 0;

  return (
    <section id="lineage" className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
      <div className="space-y-2 border-b border-[var(--muted)]/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            <GitBranch size={16} />
            <span>Model Heritage &amp; Evolutionary Lineage</span>
          </div>
          {family && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              {family} {generation ? `v${generation}` : "Lineage Branch"}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">
          Genealogical Graph &amp; Evolutionary Provenance
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
          Tracing foundational base architecture ancestry, architectural successors, scale siblings, and reasoning distillation derivatives.
        </p>
      </div>

      {!hasLineage ? (
        <div className="p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Cpu size={16} className="text-[var(--accent)]" />
              <span>Independent Foundation Checkpoint</span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {model.name} operates as an autonomous foundation model architecture without direct precursor derivatives in this catalog.
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded bg-[var(--card-bg)] border border-[var(--muted)]/15 text-[var(--muted)] shrink-0">
            Root Architecture Node
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Evolutionary Flow: Predecessors -> Active -> Successors */}
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 min-w-[640px] md:min-w-0 justify-between">
              {/* Predecessors (Ancestors) */}
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Ancestral Base / Predecessor
                </span>
                {predecessors.length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed border-[var(--muted)]/20 bg-[var(--card-bg)]/40 text-[11px] text-[var(--muted)]">
                    Root Pretrained Origin
                  </div>
                ) : (
                  <div className="space-y-2">
                    {predecessors.slice(0, 2).map((pred) => (
                      <Link key={pred.id} href={`/models/${pred.slug}`} className="group block p-3 rounded-lg border border-[var(--muted)]/20 bg-[var(--card-bg)] hover:border-[var(--accent)] transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">{pred.name}</span>
                          <ChevronRight size={12} className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[var(--muted)]">
                          <span>{formatDate(pred.release_date)}</span>
                          {pred.parameters && <span>· {pred.parameters}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Connecting Edge */}
              <div className="hidden md:flex flex-col items-center justify-center px-1 text-[var(--muted)]">
                <ArrowRight size={16} className="text-[var(--accent)] animate-pulse" />
              </div>

              {/* Active Current Node */}
              <div className="flex-1 p-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--card-bg)] shadow-[0_0_20px_rgba(var(--accent-rgb,59,130,246),0.15)] relative space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)]">
                    <Sparkles size={10} /> Active Selection
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted)]">{formatDate(model.release_date)}</span>
                </div>
                <div className="text-sm font-extrabold text-[var(--text)] tracking-tight">{model.name}</div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-[var(--muted)]">
                  {model.parameters && <span className="bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--muted)]/15 font-semibold text-[var(--text)]">{model.parameters}</span>}
                  {model.context_window && <span className="bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--muted)]/15">{model.context_window.toLocaleString()} Ctx</span>}
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">Current Spec</span>
                </div>
              </div>

              {/* Connecting Edge */}
              <div className="hidden md:flex flex-col items-center justify-center px-1 text-[var(--muted)]">
                <ArrowRight size={16} className="text-[var(--accent)]" />
              </div>

              {/* Successors (Next Generation) */}
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Evolutionary Successor
                </span>
                {successors.length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed border-[var(--muted)]/20 bg-[var(--card-bg)]/40 text-[11px] text-[var(--muted)]">
                    Latest Generation Checkpoint
                  </div>
                ) : (
                  <div className="space-y-2">
                    {successors.slice(0, 2).map((succ) => (
                      <Link key={succ.id} href={`/models/${succ.slug}`} className="group block p-3 rounded-lg border border-[var(--muted)]/20 bg-[var(--card-bg)] hover:border-[var(--accent)] transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">{succ.name}</span>
                          <ChevronRight size={12} className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[var(--muted)]">
                          <span>{formatDate(succ.release_date)}</span>
                          {succ.parameters && <span>· {succ.parameters}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sibling Scale Tiers & Distillations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siblings.length > 0 && (
              <div className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                  <Layers size={14} className="text-[var(--accent)]" />
                  <span>Sibling Scale Variants ({siblings.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {siblings.map((sib) => (
                    <Link key={sib.id} href={`/models/${sib.slug}`} className="text-[11px] px-2.5 py-1 rounded bg-[var(--card-bg)] border border-[var(--muted)]/20 hover:border-[var(--accent)] text-[var(--text)] hover:text-[var(--accent)] font-medium transition-colors">
                      {sib.name} {sib.parameters ? `(${sib.parameters})` : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {distillations.length > 0 && (
              <div className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Reasoning Distillations &amp; Fine-Tunes ({distillations.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {distillations.map((dist) => (
                    <Link key={dist.id} href={`/models/${dist.slug}`} className="text-[11px] px-2.5 py-1 rounded bg-[var(--card-bg)] border border-emerald-500/20 text-[var(--text)] hover:border-emerald-500 hover:text-emerald-500 font-medium transition-colors">
                      {dist.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
