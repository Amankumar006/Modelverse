"use client";

import React from "react";
import Link from "next/link";
import { type ModelEntry, type ModelIndex, formatParameters } from "@/lib/models";
import { Scale, ArrowRight } from "lucide-react";

interface ComparableModelsSectionProps {
  currentModel: ModelEntry;
  comparableModels: (ModelEntry | ModelIndex)[];
}

export default function ComparableModelsSection({ currentModel, comparableModels = [] }: ComparableModelsSectionProps) {
  // Always place the current model first, followed by unique comparable candidates
  const allModels = [
    currentModel,
    ...comparableModels.filter((m) => m.slug !== currentModel.slug && m.id !== currentModel.id),
  ].slice(0, 4);

  if (allModels.length <= 1) return null;

  return (
    <section id="comparable-models" className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Scale size={14} />
            <span>Architecture &amp; Tier Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Comparable Models
          </h2>
        </div>

        <Link
          href={`/compare?models=${allModels.map((m) => m.slug).join(",")}`}
          className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 bg-[var(--accent-soft)]/30 px-3 py-1.5 rounded-[var(--radius-pill)] border border-[var(--accent)]/20 w-fit"
        >
          <span>Open Full Interactive Comparison</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Side-by-side architectural and specification comparison across equivalent models in the <strong className="text-[var(--text)]">{currentModel.primaryTask?.replace(/-/g, " ") || "current"}</strong> category.
      </p>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-xs sm:text-sm text-[var(--muted)]">
          <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
            <tr>
              <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] w-36">Metric</th>
              {allModels.map((m) => {
                const isCurrent = m.slug === currentModel.slug;
                return (
                  <th key={m.id} className="p-3.5 font-bold text-[var(--text)]">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/models/${m.slug}`} className="hover:text-[var(--accent)] hover:underline">
                        {m.name}
                      </Link>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent)] text-white text-[10px] uppercase font-bold font-mono">
                          This Model
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--muted)]/10 font-normal">
            {/* Developer */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Developer</td>
              {allModels.map((m) => (
                <td key={m.id} className="p-3.5 text-xs font-semibold text-[var(--text)]">
                  {m.developer}
                </td>
              ))}
            </tr>

            {/* API Identifier */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">API Identifier</td>
              {allModels.map((m) => (
                <td key={m.id} className="p-3.5 font-mono text-[11px]">
                  <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-bold border border-[var(--muted)]/10">
                    {m.slug}
                  </code>
                </td>
              ))}
            </tr>

            {/* Parameters */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Parameters</td>
              {allModels.map((m) => {
                const p = formatParameters(m as ModelEntry);
                return (
                  <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                    {p}
                  </td>
                );
              })}
            </tr>

            {/* Context Window */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Context Window</td>
              {allModels.map((m) => {
                const cw =
                  typeof m.contextWindow === "object" && m.contextWindow !== null
                    ? (m.contextWindow as { native?: number }).native
                      ? `${(m.contextWindow as { native?: number }).native} tokens`
                      : JSON.stringify(m.contextWindow)
                    : m.contextWindow || "Undisclosed";
                return (
                  <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                    {cw}
                  </td>
                );
              })}
            </tr>

            {/* Model Type */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Model Type</td>
              {allModels.map((m) => (
                <td key={m.id} className="p-3.5 text-[var(--muted)] capitalize text-xs">
                  {m.type.replace(/-/g, " ")}
                </td>
              ))}
            </tr>

            {/* Primary Task */}
            <tr>
              <td className="p-3.5 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Key Task</td>
              {allModels.map((m) => (
                <td key={m.id} className="p-3.5 text-xs text-[var(--accent)] font-medium capitalize">
                  {m.primaryTask?.replace(/-/g, " ") || "General"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {allModels.map((m) => {
          const isCurrent = m.slug === currentModel.slug;
          const p = formatParameters(m as ModelEntry);
          const cw =
            typeof m.contextWindow === "object" && m.contextWindow !== null
              ? (m.contextWindow as { native?: number }).native
                ? `${(m.contextWindow as { native?: number }).native} tokens`
                : JSON.stringify(m.contextWindow)
              : m.contextWindow || "Undisclosed";

          return (
            <div
              key={m.id}
              className={`rounded-[var(--radius-card)] border p-4 space-y-3 ${
                isCurrent ? "border-[var(--accent)] bg-[var(--card-bg)] shadow-[var(--shadow-card)]" : "border-[var(--muted)]/10 bg-[var(--card-bg)]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[var(--muted)]/10 pb-2">
                <Link href={`/models/${m.slug}`} className="font-extrabold text-[var(--text)] text-sm hover:text-[var(--accent)]">
                  {m.name}
                </Link>
                {isCurrent ? (
                  <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent)] text-white text-[10px] uppercase font-bold font-mono">
                    This Model
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[var(--muted)]">{m.developer}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--muted)] font-medium block mb-0.5">Parameters</span>
                  <span className="font-mono tabular-nums font-bold text-[var(--text)]">{p}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] font-medium block mb-0.5">Context Window</span>
                  <span className="font-mono tabular-nums font-bold text-[var(--text)]">{cw}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] font-medium block mb-0.5">Type</span>
                  <span className="capitalize text-[var(--text)]">{m.type.replace(/-/g, " ")}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] font-medium block mb-0.5">Task</span>
                  <span className="capitalize text-[var(--accent)]">{m.primaryTask?.replace(/-/g, " ") || "General"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
