"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight, Cpu } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { getProviderLogo } from "@/lib/logos";

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
    <div className="space-y-8">
      {/* Provider Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedProvider("All")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedProvider === "All"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
              : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
          }`}
        >
          All Labs ({sortedModels.length})
        </button>
        {providers.map((p) => {
          const count = sortedModels.filter((m) => m.provider.toLowerCase() === p.toLowerCase()).length;
          const logo = getProviderLogo(p);
          return (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedProvider.toLowerCase() === p.toLowerCase()
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                <Image src={logo} alt={p} width={14} height={14} className="w-full h-full object-contain" />
              </div>
              <span>{p}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l border-[var(--muted)]/20 space-y-8 ml-2 sm:ml-4">
        {filteredModels.map((model) => {
          const dateStr = model.release_date
            ? new Date(model.release_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
            : "Recent";
          const logo = getProviderLogo(model.provider);

          return (
            <div key={model.id} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-[var(--bg)] border-2 border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all duration-300" />

              {/* Timeline Release Card */}
              <div className="p-5 sm:p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 bg-[var(--bg)] border border-[var(--muted)]/15 flex items-center justify-center p-0.5">
                      <Image src={logo} alt={model.provider} width={14} height={14} className="w-full h-full object-contain" />
                    </div>
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
