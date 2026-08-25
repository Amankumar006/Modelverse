import React from "react";
import {
  CAPABILITY_TAXONOMY,
  groupCapabilities,
} from "@/lib/model-sections";
import {
  Brain,
  Wrench,
  Eye,
  FileCode2,
  Globe,
  Zap,
  Sliders,
  Sparkles,
  Mic,
  Volume2,
  Monitor,
  Video,
  Layers,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

interface CapabilitiesMatrixProps {
  capabilities?: Record<string, boolean>;
  modelName: string;
}

// Icons are presentation-only; the taxonomy itself lives in
// src/lib/model-sections.ts so the quick-facts rail shares it.
const CAPABILITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  reasoning: Brain,
  tool_calling: Wrench,
  vision_input: Eye,
  structured_outputs: FileCode2,
  web_search: Globe,
  prompt_caching: Zap,
  fine_tuning: Sliders,
  image_generation: Sparkles,
  audio_input: Mic,
  audio_output: Volume2,
  computer_use: Monitor,
  video_input: Video,
  batch: Layers,
};

export default function CapabilitiesMatrix({
  capabilities = {},
  modelName,
}: CapabilitiesMatrixProps) {
  const supportedCount = Object.values(capabilities).filter(Boolean).length;
  const totalCount = CAPABILITY_TAXONOMY.length;

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--muted)]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
              Technical Capabilities Matrix
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
              <CheckCircle2 size={12} />
              {supportedCount} / {totalCount} Supported
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Structured feature flags substantiated by official model cards and provider APIs for {modelName}.
          </p>
        </div>
      </div>

      {/* Category-grouped grid — counts per category from the shared taxonomy */}
      <div className="space-y-5 pt-1">
        {groupCapabilities(capabilities).map((group) => (
          <div key={group.category}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {group.category}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg)] text-[var(--text)] border border-[var(--muted)]/15 tabular-nums">
                {group.supported}/{group.total}
              </span>
              <span className="flex-1 h-px bg-[var(--muted)]/10" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {CAPABILITY_TAXONOMY.filter((d) => d.category === group.category).map((def) => {
                const isSupported = Boolean(capabilities[def.key]);
                const Icon = CAPABILITY_ICONS[def.key] ?? Sparkles;

                return (
                  <div
                    key={def.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-[12px] border transition-all duration-200 ${
                      isSupported
                        ? "bg-[var(--accent-soft)]/10 border-[var(--accent)]/30 shadow-sm"
                        : "bg-[var(--bg)]/40 border-[var(--muted)]/10 opacity-60"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-[8px] shrink-0 ${
                        isSupported
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "bg-[var(--muted)]/10 text-[var(--muted)]"
                      }`}
                    >
                      <Icon size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-xs font-semibold truncate ${
                            isSupported ? "text-[var(--text)]" : "text-[var(--muted)]"
                          }`}
                        >
                          {def.title}
                        </h5>
                        {isSupported ? (
                          <span
                            aria-label="Supported"
                            className="text-emerald-500 flex items-center shrink-0"
                          >
                            <CheckCircle2 size={13} />
                            <span className="sr-only">Supported</span>
                          </span>
                        ) : (
                          <span
                            aria-label="Not supported"
                            className="text-[var(--muted)]/70 flex items-center shrink-0"
                          >
                            <MinusCircle size={13} />
                            <span className="sr-only">Not supported</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-tight mt-0.5 line-clamp-2">
                        {def.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
