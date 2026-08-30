"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, Cpu } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface TimelineContainerProps {
  initialModels: ModelRow[];
}

export default function TimelineContainer({ initialModels }: TimelineContainerProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("All");

  const sortedModels = useMemo(() => {
    return [...initialModels].sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateB - dateA;
    });
  }, [initialModels]);

  const filteredModels = useMemo(() => {
    if (selectedProvider === "All") return sortedModels;
    return sortedModels.filter(
      (m) => m.provider.toLowerCase() === selectedProvider.toLowerCase()
    );
  }, [sortedModels, selectedProvider]);

  const providers = useMemo(() => {
    return Array.from(new Set(initialModels.map((m) => m.provider))).filter(Boolean);
  }, [initialModels]);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Provider Filter Chips */}
      {providers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--muted)] font-medium mr-1">Filter Lab:</span>
          <button
            onClick={() => setSelectedProvider("All")}
            className={`px-3 py-1 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
              selectedProvider === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
            }`}
          >
            All Labs ({initialModels.length})
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-3 py-1 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                selectedProvider === p
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-[var(--muted)]/20 pl-6 sm:pl-8 ml-3 space-y-8">
        {filteredModels.map((model) => {
          const dateStr = model.release_date
            ? new Date(model.release_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
            : "Recently Added";

          return (
            <div key={model.id} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-[var(--bg)] border-2 border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all duration-300" />

              {/* Timeline Release Card */}
              <div className="p-5 sm:p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {model.provider}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase font-medium">
                      {model.category || "LLM"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-mono">
                    <Calendar size={12} className="text-[var(--accent)]" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    {model.name}
                  </h3>
                  {model.description && (
                    <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-2 font-mono">
                    {model.context_window && (
                      <span className="flex items-center gap-1">
                        <Cpu size={12} className="text-[var(--accent)]" />
                        {model.context_window.toLocaleString("en-US")} ctx
                      </span>
                    )}
                    {model.parameters && <span>• {model.parameters}</span>}
                  </div>

                  <Link
                    href={`/models/${model.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline text-xs"
                  >
                    <span>View Model Specs</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredModels.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--muted)]">
            No releases match this lab filter.
          </div>
        )}
      </div>
    </div>
  );
}
